import { createHash } from "crypto";
import fs from "fs";
import { promises as fsp } from "fs";
import path from "path";
import Parser from "rss-parser";
import OpenAI from "openai";

type SourceConfig = {
  name: string;
  type: "rss";
  url: string;
};

type FeedItem = {
  sourceName: string;
  sourceUrl: string;
  title: string;
  link: string;
  pubDate: string;
  snippet: string;
  score: number;
  keywordHits: string[];
};

type LogEntry = {
  date: string;
  url_hash: string;
  title_hash: string;
  title: string;
  file: string;
};

type PostLog = {
  entries: LogEntry[];
  meta: {
    consecutive_failures: number;
    last_failure_at: string | null;
  };
};

type DraftContent = {
  title: string;
  description: string;
  slug: string;
  tags: string[];
  summary: string;
  background: string;
  facts: string[];
  impact: string;
  uncertainties: string[];
  checklist: string[];
};

const ROOT = process.cwd();
const SOURCES_PATH = path.join(ROOT, "config", "sources.json");
const LOG_PATH = path.join(ROOT, "data", "post_log.json");
const POSTS_DIR = path.join(ROOT, "content", "posts");
const MAX_FAILURES = Number(process.env.AUTOPOST_MAX_CONSECUTIVE_FAILURES ?? "3");

const CRE_KEYWORDS: Array<{ word: string; score: number }> = [
  { word: "상업용 부동산", score: 14 },
  { word: "commercial real estate", score: 14 },
  { word: "cre", score: 6 },
  { word: "오피스", score: 8 },
  { word: "리테일", score: 7 },
  { word: "물류센터", score: 9 },
  { word: "data center", score: 7 },
  { word: "캡레이트", score: 10 },
  { word: "cap rate", score: 10 },
  { word: "리츠", score: 8 },
  { word: "reit", score: 8 },
  { word: "임대료", score: 6 },
  { word: "vacancy", score: 6 },
  { word: "공실률", score: 8 },
  { word: "pf", score: 6 },
  { word: "금리", score: 8 },
  { word: "financing", score: 7 },
  { word: "refinancing", score: 7 },
  { word: "개발사업", score: 6 },
  { word: "transaction", score: 6 },
];

function parseArgs() {
  const args = process.argv.slice(2);
  const options: { dryRun: boolean; force: boolean; date?: string } = {
    dryRun: false,
    force: false,
  };

  args.forEach((arg) => {
    if (arg === "--dry-run") options.dryRun = true;
    else if (arg === "--force") options.force = true;
    else if (arg.startsWith("--date=")) options.date = arg.replace("--date=", "");
  });

  if (options.date && !/^\d{4}-\d{2}-\d{2}$/.test(options.date)) {
    throw new Error("--date must be YYYY-MM-DD");
  }

  return options;
}

function kstDateString(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

function hashText(value: string): string {
  return createHash("sha256").update(value.trim().toLowerCase()).digest("hex").slice(0, 16);
}

function sanitizeText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function slugify(input: string): string {
  const ascii = input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return ascii || "cre-daily-issue";
}

async function ensureDir(targetPath: string) {
  await fsp.mkdir(targetPath, { recursive: true });
}

async function loadSources(): Promise<SourceConfig[]> {
  const raw = await fsp.readFile(SOURCES_PATH, "utf8");
  const parsed = JSON.parse(raw) as SourceConfig[];
  return parsed.filter((s) => s.type === "rss" && Boolean(s.url));
}

async function loadPostLog(): Promise<PostLog> {
  if (!fs.existsSync(LOG_PATH)) {
    return { entries: [], meta: { consecutive_failures: 0, last_failure_at: null } };
  }
  const raw = await fsp.readFile(LOG_PATH, "utf8");
  const parsed = JSON.parse(raw) as Partial<PostLog>;
  return {
    entries: Array.isArray(parsed.entries) ? parsed.entries : [],
    meta: {
      consecutive_failures: parsed.meta?.consecutive_failures ?? 0,
      last_failure_at: parsed.meta?.last_failure_at ?? null,
    },
  };
}

async function savePostLog(log: PostLog) {
  await ensureDir(path.dirname(LOG_PATH));
  await fsp.writeFile(LOG_PATH, `${JSON.stringify(log, null, 2)}\n`, "utf8");
}

function scoreItem(item: FeedItem, trendMap: Map<string, number>): FeedItem {
  const corpus = sanitizeText(`${item.title} ${item.snippet}`).toLowerCase();
  let score = 0;
  const hits = new Set<string>();

  for (const { word, score: weight } of CRE_KEYWORDS) {
    if (corpus.includes(word.toLowerCase())) {
      score += weight;
      hits.add(word);
    }
  }

  const ageHours = Math.max(0, (Date.now() - new Date(item.pubDate).getTime()) / 3600000);
  const freshnessBonus = Math.max(0, 24 - ageHours / 3);
  score += freshnessBonus;

  let trendBonus = 0;
  hits.forEach((hit) => {
    const repeated = trendMap.get(hit) ?? 0;
    if (repeated >= 2) trendBonus += Math.min(8, repeated * 1.2);
  });
  score += trendBonus;

  return { ...item, score, keywordHits: Array.from(hits) };
}

function extractTrendMap(items: FeedItem[]) {
  const map = new Map<string, number>();
  for (const item of items) {
    const corpus = sanitizeText(`${item.title} ${item.snippet}`).toLowerCase();
    for (const { word } of CRE_KEYWORDS) {
      const lower = word.toLowerCase();
      if (corpus.includes(lower)) {
        map.set(word, (map.get(word) ?? 0) + 1);
      }
    }
  }
  return map;
}

async function fetchCandidates(sources: SourceConfig[]): Promise<FeedItem[]> {
  const parser = new Parser();
  const earliest = Date.now() - 72 * 3600000;
  const latest = Date.now() + 2 * 3600000;
  const results: FeedItem[] = [];

  for (const source of sources) {
    try {
      const feed = await parser.parseURL(source.url);
      const items = (feed.items || []).slice(0, 40);
      for (const item of items) {
        const title = sanitizeText(item.title || "");
        const link = sanitizeText(item.link || item.guid || "");
        const pubDateRaw = item.isoDate || item.pubDate || "";
        const snippet = sanitizeText(item.contentSnippet || item.content || "");
        if (!title || !link || !pubDateRaw) continue;
        const publishedAt = new Date(pubDateRaw).getTime();
        if (!Number.isFinite(publishedAt)) continue;
        if (publishedAt < earliest || publishedAt > latest) continue;

        results.push({
          sourceName: source.name,
          sourceUrl: source.url,
          title,
          link,
          pubDate: new Date(publishedAt).toISOString(),
          snippet: snippet.slice(0, 600),
          score: 0,
          keywordHits: [],
        });
      }
    } catch (error) {
      console.warn(`[autopost] Failed to parse source: ${source.name}`);
      console.warn(String(error));
    }
  }

  const trendMap = extractTrendMap(results);
  return results.map((item) => scoreItem(item, trendMap));
}

function stripCodeFences(text: string): string {
  return text.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
}

async function generateWithOpenAI(
  selected: FeedItem | null,
  related: FeedItem[],
  targetDate: string
): Promise<DraftContent | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const client = new OpenAI({ apiKey });
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  const sourceBlock = related
    .slice(0, 5)
    .map(
      (item, index) =>
        `${index + 1}. [${item.sourceName}] ${item.title}\nURL: ${item.link}\n요약: ${item.snippet || "요약 없음"}`
    )
    .join("\n\n");

  const selectedNote = selected
    ? `대표 이슈: ${selected.title}\nURL: ${selected.link}`
    : "대표 이슈 선정 실패. 대체 주제로 작성.";

  const prompt = `
당신은 상업용 부동산 시장 전문 에디터다.
반드시 한국어로 작성하고, 팩트 기반으로 재서술하라.
긴 원문 인용은 금지하고, 모든 내용은 요약/분석 형태로 작성한다.

작성일: ${targetDate}
${selectedNote}

참고 후보:
${sourceBlock || "출처 수집 실패"}

반환 형식: JSON만 반환.
{
  "title": "string",
  "description": "2~3문장",
  "slug": "english-kebab-slug",
  "tags": ["상업용부동산", "..."],
  "summary": "오늘의 한 줄 요약 본문",
  "background": "배경/개념 정리",
  "facts": ["핵심 내용 bullet 1", "bullet 2", "bullet 3"],
  "impact": "시장 영향 본문",
  "uncertainties": ["불확실성 1", "불확실성 2", "불확실성 3"],
  "checklist": ["질문1", "질문2", "질문3", "질문4", "질문5"]
}
`;

  try {
    const response = await client.chat.completions.create({
      model,
      temperature: 0.35,
      messages: [
        {
          role: "system",
          content: "당신은 상업용 부동산 리서치 블로그 편집자다. 추측은 배제하고 불확실성은 명시한다.",
        },
        { role: "user", content: prompt },
      ],
    });

    const raw = response.choices[0]?.message?.content || "";
    if (!raw) return null;
    const parsed = JSON.parse(stripCodeFences(raw)) as DraftContent;

    if (!parsed.title || !parsed.description || !parsed.summary || !parsed.impact) {
      return null;
    }
    parsed.slug = slugify(parsed.slug || parsed.title);
    parsed.tags = (parsed.tags || []).slice(0, 6);
    parsed.facts = (parsed.facts || []).slice(0, 6);
    parsed.uncertainties = (parsed.uncertainties || []).slice(0, 5);
    parsed.checklist = (parsed.checklist || []).slice(0, 7);
    return parsed;
  } catch (error) {
    console.warn("[autopost] LLM generation failed, fallback will be used.");
    console.warn(String(error));
    return null;
  }
}

function fallbackDraft(selected: FeedItem | null, targetDate: string): DraftContent {
  if (!selected) {
    const topic = "금리·자금조달·캡레이트 흐름 점검";
    return {
      title: `[자동 생성(대체 주제)] ${targetDate} ${topic}`,
      description:
        "출처 수집 실패로 대체 주제를 기반으로 작성한 자동 생성 요약입니다. 금리와 자금조달 환경이 상업용 부동산 가격 및 거래에 미치는 영향을 점검합니다.",
      slug: slugify(`${targetDate}-cre-fallback-topic`),
      tags: ["상업용부동산", "CRE", "금리", "캡레이트", "자동포스팅"],
      summary: "오늘은 외부 소스 수집이 원활하지 않아 대체 주제로 시장 핵심 변수의 방향성을 점검합니다.",
      background:
        "상업용 부동산 시장은 금리 경로, 대출 가산금리, 임대시장 체력, 자산별 공실률의 조합으로 가격이 형성됩니다. 특히 자금조달 비용과 기대 수익률의 차이가 투자 의사결정을 좌우합니다.",
      facts: [
        "출처 수집 실패 상태에서 작성된 대체 주제 콘텐츠입니다.",
        "최근 금리 레벨이 높은 구간에서는 자산별 차별화가 확대됩니다.",
        "리파이낸싱 만기 구조와 캡레이트 조정 속도가 거래량 회복의 핵심 변수입니다.",
      ],
      impact:
        "임대 시장이 방어적인 섹터는 가격 하방 압력이 제한될 수 있으나, 공실률이 높은 섹터는 자금조달 비용 상승이 밸류에이션에 더 크게 반영될 수 있습니다.",
      uncertainties: [
        "국가별 통화정책 전환 시점 차이",
        "자산군별 수요 회복 속도 차이",
        "거래 데이터 공시 지연으로 인한 시차",
      ],
      checklist: [
        "현재 보유 자산의 만기 구조와 차환 리스크는 어떤가?",
        "가정한 캡레이트와 실제 거래 캡레이트 간 격차는 어느 정도인가?",
        "공실률과 임대료 재계약률이 현금흐름을 얼마나 방어하는가?",
        "금리 하락 시나리오 없이도 버틸 수 있는 레버리지 구조인가?",
        "섹터별(오피스/리테일/물류) 회복 속도 차이를 포트폴리오에 반영했는가?",
      ],
    };
  }

  return {
    title: `${targetDate} 오늘의 상업용 부동산 이슈: ${selected.title}`,
    description:
      "주요 기사와 시장 데이터를 기반으로 상업용 부동산 이슈를 요약했습니다. 핵심 팩트와 시장 영향, 불확실성을 구조적으로 정리합니다.",
    slug: slugify(`${targetDate}-${selected.title}`),
    tags: ["상업용부동산", "CRE", "시장동향", "자동포스팅"],
    summary: `오늘의 이슈는 "${selected.title}"입니다. 핵심 변화가 임대시장과 투자 심리에 미치는 영향을 중심으로 정리합니다.`,
    background:
      "상업용 부동산 시장은 거시 금리 환경, 자금조달 여건, 섹터별 수요/공급, 거래시장 유동성이 함께 작동합니다. 단일 뉴스보다 복합 요인을 함께 보는 접근이 필요합니다.",
    facts: [
      `대표 출처(${selected.sourceName})에서 관련 이슈가 확인되었습니다.`,
      "최근 72시간 내 기사 중심으로 후보를 선별해 최신성을 확보했습니다.",
      "중복 URL/제목 해시를 제외해 동일 이슈 반복 발행을 방지했습니다.",
    ],
    impact:
      "임대료 재조정 속도, 캡레이트 스프레드, 거래 성사 기간, 리츠 밸류에이션, 차입 비용의 변화가 중기 시장 방향성을 결정할 가능성이 큽니다.",
    uncertainties: [
      "기사별 데이터 집계 기준 차이",
      "지역/섹터별 체감 경기 편차",
      "정책 반영 시차로 인한 단기 왜곡",
    ],
    checklist: [
      "해당 이슈가 특정 섹터인지 시장 전반 이슈인지 구분했는가?",
      "임대료/공실률/캡레이트 중 어떤 지표가 선행하는가?",
      "거래 사례가 예외인지 추세인지 검증했는가?",
      "리파이낸싱 일정과 금리 경로를 함께 고려했는가?",
      "리츠/사모/직접투자 중 어느 시장에 먼저 반영되는가?",
    ],
  };
}

function renderMarkdown(
  draft: DraftContent,
  targetDate: string,
  selected: FeedItem | null,
  related: FeedItem[]
): { markdown: string; fileName: string } {
  const tags = Array.from(new Set(draft.tags)).filter(Boolean).slice(0, 6);
  if (tags.length === 0) tags.push("상업용부동산", "CRE");

  const sourceItems = selected ? [selected, ...related.filter((it) => it.link !== selected.link)] : related;
  const sources = sourceItems.slice(0, 5);
  const sourceYaml =
    sources.length > 0
      ? sources
          .map((s) => `  - name: "${s.sourceName.replace(/"/g, "'")}"\n    url: "${s.link}"`)
          .join("\n")
      : `  - name: "출처 수집 실패"\n    url: ""`;

  const facts = draft.facts.length > 0 ? draft.facts : ["핵심 팩트를 정리할 수 있는 외부 데이터가 제한적입니다."];
  const uncertainties =
    draft.uncertainties.length > 0 ? draft.uncertainties : ["데이터 출처와 시점에 따라 해석이 달라질 수 있습니다."];
  const checklist =
    draft.checklist.length >= 5
      ? draft.checklist.slice(0, 7)
      : [
          ...draft.checklist,
          "현재 시장 가정이 3개월 뒤에도 유효할 근거가 있는가?",
          "반대 시나리오에서 손실 한도를 정의했는가?",
        ].slice(0, 7);

  const body = `---
title: "${draft.title.replace(/"/g, "'")}"
date: "${targetDate}"
description: "${draft.description.replace(/"/g, "'")}"
tags: [${tags.map((tag) => `"${tag.replace(/"/g, "'")}"`).join(", ")}]
sources:
${sourceYaml}
---

## 1) 오늘의 한 줄 요약
${draft.summary}

## 2) 배경/개념 정리(용어 정의)
${draft.background}

## 3) 핵심 내용(팩트 중심 bullet)
${facts.map((fact) => `- ${fact}`).join("\n")}

## 4) 시장 영향(임대/캡레이트/거래/리츠/자금조달)
${draft.impact}

## 5) 반론/불확실성(데이터 한계/지역·섹터 차이/시차)
${uncertainties.map((item) => `- ${item}`).join("\n")}

## 6) 실무·투자 체크리스트(5~7개 질문)
${checklist.map((item) => `- [ ] ${item}`).join("\n")}

## 7) 참고 출처(링크 목록)
${sources.length > 0 ? sources.map((s) => `- [${s.sourceName}](${s.link})`).join("\n") : "- 출처 수집 실패"}

※ 본 글은 정보 제공 목적이며 투자 조언이 아닙니다.
`;

  const fileName = `${targetDate}-${slugify(draft.slug || draft.title)}.md`;
  return { markdown: body, fileName };
}

async function main() {
  const { dryRun, force, date } = parseArgs();
  const targetDate = date || kstDateString();

  const log = await loadPostLog();
  if (MAX_FAILURES > 0 && log.meta.consecutive_failures >= MAX_FAILURES) {
    console.log(
      `[autopost] Skipped due to consecutive failures (${log.meta.consecutive_failures}/${MAX_FAILURES}).`
    );
    return;
  }

  await ensureDir(POSTS_DIR);
  const existingToday = (await fsp.readdir(POSTS_DIR)).find(
    (name) => name.startsWith(`${targetDate}-`) && name.endsWith(".md")
  );

  if (existingToday && !force) {
    console.log(`[autopost] ${targetDate} post already exists: ${existingToday}`);
    return;
  }

  const sources = await loadSources();
  const candidates = await fetchCandidates(sources);
  candidates.sort((a, b) => b.score - a.score);

  const seenUrl = new Set(log.entries.map((entry) => entry.url_hash));
  const seenTitle = new Set(log.entries.map((entry) => entry.title_hash));
  const fresh = candidates.filter((item) => {
    const urlHash = hashText(item.link);
    const titleHash = hashText(item.title);
    if (!force && (seenUrl.has(urlHash) || seenTitle.has(titleHash))) return false;
    return true;
  });

  const selected = fresh[0] ?? null;
  const related = fresh.slice(0, 5);
  const llmDraft = await generateWithOpenAI(selected, related, targetDate);
  const draft = llmDraft ?? fallbackDraft(selected, targetDate);
  const { markdown, fileName } = renderMarkdown(draft, targetDate, selected, related);
  const targetFile = path.join(POSTS_DIR, fileName);

  if (dryRun) {
    console.log(`[autopost][dry-run] date=${targetDate}`);
    console.log(`[autopost][dry-run] selected=${selected ? selected.title : "fallback-topic"}`);
    console.log(`[autopost][dry-run] file=${path.relative(ROOT, targetFile)}`);
    console.log(markdown.slice(0, 800));
    return;
  }

  await fsp.writeFile(targetFile, markdown, "utf8");

  const entry: LogEntry = {
    date: targetDate,
    url_hash: hashText(selected?.link || `fallback-${targetDate}`),
    title_hash: hashText(selected?.title || draft.title),
    title: draft.title,
    file: path.relative(ROOT, targetFile),
  };
  log.entries.push(entry);
  log.meta.consecutive_failures = 0;
  log.meta.last_failure_at = null;
  await savePostLog(log);

  console.log(`[autopost] Created: ${entry.file}`);
  console.log(`[autopost] Title: ${entry.title}`);
}

main().catch(async (error) => {
  console.error("[autopost] failed", error);
  try {
    const log = await loadPostLog();
    log.meta.consecutive_failures += 1;
    log.meta.last_failure_at = new Date().toISOString();
    await savePostLog(log);
  } catch (innerError) {
    console.error("[autopost] failed to update post log", innerError);
  }
  process.exitCode = 1;
});
