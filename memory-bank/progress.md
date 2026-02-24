# Progress

## 현재 상태
- [x] 블로그 프로젝트 초기 생성
- [x] AGENTS.md 개인 블로그 지침 반영
- [x] memory-bank 템플릿 생성
- [ ] 콘텐츠 로더 구현
- [ ] 포스트 목록/상세 페이지 완성
- [ ] SEO/배포 설정

## 최근 완료 작업
- `AGENTS.md`에 재시작/복구 규칙 추가
- `memory-bank/` 문서 4종 템플릿 생성
- `app/about/page.tsx` 소개 페이지 문구를 상업용 부동산 중심으로 전면 개편
- 소개 페이지 가독성 향상을 위한 타이포그래피/카드형 레이아웃 적용
- GitHub Pages 배포를 위한 GitHub Actions 워크플로우 추가 (`deploy` 브랜치 트리거)
- Next.js 정적 export 설정 및 GitHub Pages 경로 대응(`basePath`, `assetPrefix`) 적용

## 다음 작업 (우선순위)
1. GitHub 저장소에서 Pages Source를 `GitHub Actions`로 설정 후 `deploy` 브랜치 푸시 테스트
2. 배포 URL에서 정적 에셋 경로/내부 링크 정상 동작 점검
3. 포스트 frontmatter 스키마 확정 및 목록/상세 데이터 로더 구현

## 이슈/메모
- 패키지 매니저는 `pnpm-lock.yaml` 기준으로 pnpm 사용
