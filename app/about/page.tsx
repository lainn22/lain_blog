import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "소개",
  description: "블로그를 운영하는 사람에 대해 알아보세요.",
};

export default function AboutPage() {
  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">
        {"소개"}
      </h1>
      <div className="prose">
        <p>
          {"안녕하세요. 개발과 투자, 그리고 새로운 기술에 관심이 많은 블로거입니다."}
        </p>
        <p>
          {"이 블로그는 제가 공부하고 경험한 내용을 기록하고 공유하기 위해 만들었습니다. 주로 부동산, 주식 등 재테크 관련 글과 생성형 AI, 프로그래밍 등 기술 관련 글을 작성하고 있습니다."}
        </p>
        <p>
          {"마크다운으로 작성된 글들은 코드 하이라이팅을 지원하며, 태그 기반 분류와 검색 기능을 통해 원하는 글을 쉽게 찾을 수 있습니다."}
        </p>
        <h2>{"관심 분야"}</h2>
        <ul>
          <li>{"부동산 및 주식 투자 전략"}</li>
          <li>{"생성형 AI와 개발 워크플로우"}</li>
          <li>{"효율적인 학습 방법론"}</li>
          <li>{"웹 개발 (Next.js, TypeScript, React)"}</li>
        </ul>
        <h2>{"연락처"}</h2>
        <p>
          {"궁금한 점이나 제안 사항이 있으시면 편하게 연락해주세요."}
        </p>
        <ul>
          <li>{"GitHub: github.com/myblog"}</li>
          <li>{"Email: hello@myblog.dev"}</li>
        </ul>
      </div>
    </div>
  );
}
