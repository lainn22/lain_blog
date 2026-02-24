# lainWRLD Blog

Next.js(App Router) 기반 정적 블로그이며, GitHub Pages로 배포됩니다.

## 배포 구조
- Pages 배포 워크플로: `.github/workflows/deploy-pages.yml`
- 트리거 브랜치: `main`, `deploy`
- 빌드 방식: `next build` + `output: "export"` (`out/` 업로드)
- GitHub Pages 하위 경로 대응: `next.config.mjs`의 `basePath`, `assetPrefix` 자동 설정

## 자동 포스팅(평일 09:00 KST)
- 워크플로: `.github/workflows/autopost.yml`
- 스케줄: `0 0 * * 1-5` (UTC 기준, KST 09:00)
- 수동 실행: `workflow_dispatch`
- 동작:
  1. `main` 체크아웃
  2. 패키지 매니저 자동 감지(`pnpm-lock.yaml`/`package-lock.json`/`yarn.lock`)
  3. `scripts/autopost.ts` 실행
  4. 변경 시 `content/posts/*.md` + `data/post_log.json`만 커밋 후 `main` 푸시
  5. 이후 Pages 배포 워크플로가 자동 재실행되어 반영

## GitHub Secrets 설정
1. GitHub 저장소 > `Settings` > `Secrets and variables` > `Actions`
2. `New repository secret`
3. Name: `OPENAI_API_KEY`
4. Value: OpenAI API Key

`OPENAI_API_KEY`가 없으면 LLM 없이 rule-based 템플릿으로 fallback 생성됩니다.

## 중복 방지 로직
- 날짜 중복 방지: 같은 날짜(`YYYY-MM-DD`)의 파일이 이미 있으면 생성 스킵
- 이력 로그: `data/post_log.json`에 아래 항목 저장
  - `date`
  - `url_hash`
  - `title_hash`
- 이미 처리한 URL/제목 해시는 재선정 금지
- 연속 실패 카운트(`meta.consecutive_failures`)를 기록하며 임계치(기본 3회) 이상이면 스킵

## 로컬 실행
```bash
# 일반 실행
pnpm autopost

# 파일 생성 없이 점검
pnpm autopost:dry

# 날짜 고정 시뮬레이션
pnpm autopost -- --date=2026-02-24 --dry-run

# 중복 무시 강제 생성
pnpm autopost -- --force --date=2026-02-24
```

## 트러블슈팅
- 피드 파싱 실패:
  - 소스 RSS URL 유효성 확인 (`config/sources.json`)
  - 네트워크/DNS 상태 확인
- OpenAI 호출 실패:
  - `OPENAI_API_KEY` 존재 여부 확인
  - 모델 접근 권한 확인(`OPENAI_MODEL` 환경변수로 교체 가능)
- 자동 커밋 실패:
  - 워크플로 `permissions.contents: write` 확인
  - 저장소 브랜치 보호 규칙에서 bot push 허용 여부 확인
- Pages 반영 안 됨:
  - `deploy-pages.yml`가 `main` push에서 실행되는지 확인
  - `Settings > Pages` Source가 `GitHub Actions`인지 확인
