import type { Metadata } from "next";
import { Noto_Sans_KR, Noto_Serif_KR } from "next/font/google";

const headingFont = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["700", "800"],
});

const bodyFont = Noto_Serif_KR({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "소개",
  description: "상업용 부동산 시장의 변화와 맥락을 기록하는 블로그 소개",
};

export default function AboutPage() {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-b from-background via-background to-muted/30 p-6 sm:p-10">
      <div className="pointer-events-none absolute -left-20 top-16 h-56 w-56 rounded-full bg-amber-200/30 blur-3xl dark:bg-amber-500/10" />
      <div className="pointer-events-none absolute -right-20 bottom-10 h-52 w-52 rounded-full bg-blue-200/30 blur-3xl dark:bg-blue-500/10" />

      <div className="relative flex flex-col gap-10">
        <header className="space-y-4">
          <p className={`${headingFont.className} text-sm font-bold tracking-[0.18em] text-muted-foreground`}>
            {"ABOUT"}
          </p>
          <h1 className={`${headingFont.className} text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl`}>
            {"소개"}
          </h1>
          <p className={`${bodyFont.className} max-w-3xl text-[1.06rem] leading-8 text-foreground/90`}>
            {"이 블로그는 상업용 부동산 시장의 흐름을 이해하고, 변화의 맥락을 읽기 위해 만들어졌습니다. 매일 하나의 이슈를 선정해 시장에서 실제로 일어나고 있는 변화와 그 의미를 정리합니다."}
          </p>
        </header>

        <section className="rounded-2xl border border-border/70 bg-card/70 p-6 sm:p-7">
          <p className={`${bodyFont.className} text-[1.02rem] leading-8 text-foreground/90`}>
            {"상업용 부동산은 단순한 건물이 아니라 도시 구조, 금융 시장, 금리 환경, 투자 심리, 정책 변화가 복합적으로 반영되는 자산입니다. 따라서 이 블로그는 개별 뉴스 전달을 넘어, 왜 이러한 변화가 발생했는지와 시장에 어떤 영향을 미칠 수 있는지를 함께 살펴봅니다."}
          </p>
        </section>

        <section className="space-y-4">
          <h2 className={`${headingFont.className} text-2xl font-extrabold tracking-tight text-foreground`}>
            {"다루는 주요 내용"}
          </h2>
          <ul className={`${bodyFont.className} grid gap-3 text-[1.01rem] leading-7 text-foreground/90`}>
            <li className="rounded-xl border border-border/70 bg-background/70 px-4 py-3">
              {"오피스, 리테일, 물류센터 등 자산군별 시장 동향"}
            </li>
            <li className="rounded-xl border border-border/70 bg-background/70 px-4 py-3">
              {"금리·금융환경 변화와 투자시장 영향"}
            </li>
            <li className="rounded-xl border border-border/70 bg-background/70 px-4 py-3">
              {"주요 거래 및 개발 프로젝트 분석"}
            </li>
            <li className="rounded-xl border border-border/70 bg-background/70 px-4 py-3">
              {"정책 및 규제 변화 해설"}
            </li>
            <li className="rounded-xl border border-border/70 bg-background/70 px-4 py-3">
              {"글로벌 상업용 부동산 트렌드 비교"}
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className={`${headingFont.className} text-2xl font-extrabold tracking-tight text-foreground`}>
            {"운영 방식"}
          </h2>
          <p className={`${bodyFont.className} text-[1.02rem] leading-8 text-foreground/90`}>
            {"매일 하나의 핵심 이슈를 중심으로 핵심 요약 → 배경 설명 → 시장 영향 → 시사점 순서로 정리하여, 빠르게 읽으면서도 깊이 있는 이해를 돕는 것을 목표로 합니다."}
          </p>
          <p className={`${bodyFont.className} text-[1.02rem] leading-8 text-foreground/90`}>
            {"이 공간이 상업용 부동산 시장을 바라보는 시야를 넓히고, 투자·연구·실무에 실질적인 인사이트를 제공하는 기록이 되기를 바랍니다."}
          </p>
        </section>

        <section className="rounded-2xl border border-border/70 bg-secondary/30 p-6 sm:p-7">
          <h2 className={`${headingFont.className} text-2xl font-extrabold tracking-tight text-foreground`}>
            {"연락처"}
          </h2>
          <p className={`${bodyFont.className} mt-3 text-[1.02rem] leading-8 text-foreground/90`}>
            {"궁금한 점이나 제안 사항이 있으시면 편하게 연락해주세요."}
          </p>
          <a
            className="mt-4 inline-block rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
            href="mailto:gss110111@naver.com"
          >
            {"gss110111@naver.com"}
          </a>
        </section>
      </div>
    </div>
  );
}
