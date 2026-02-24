---
title: "초보자를 위한 주식 포트폴리오 구성법"
date: "2026-02-10"
description: "처음 주식 투자를 시작하는 분들을 위한 포트폴리오 구성 전략과 리스크 관리 방법을 안내합니다."
tags: ["주식", "공부법"]
---

## 왜 포트폴리오가 중요한가

주식 투자에서 가장 흔한 실수는 한두 종목에 집중 투자하는 것입니다. 분산 투자는 리스크를 줄이면서도 안정적인 수익을 추구할 수 있는 가장 기본적인 전략입니다.

### 분산 투자의 원칙

"달걀을 한 바구니에 담지 마라"는 오래된 투자 격언은 여전히 유효합니다.

```typescript
type AssetClass = "국내주식" | "해외주식" | "채권" | "원자재" | "현금";

interface Portfolio {
  assets: Map<AssetClass, number>; // 비율(%)
  totalValue: number;
  rebalanceDate: Date;
}

function createBalancedPortfolio(totalInvestment: number): Portfolio {
  const assets = new Map<AssetClass, number>([
    ["국내주식", 30],
    ["해외주식", 30],
    ["채권", 25],
    ["원자재", 10],
    ["현금", 5],
  ]);

  return {
    assets,
    totalValue: totalInvestment,
    rebalanceDate: new Date(),
  };
}
```

## 연령대별 추천 포트폴리오

### 20~30대: 공격형
- 국내 성장주: 40%
- 해외 ETF (S&P 500, NASDAQ): 35%
- 채권: 15%
- 현금: 10%

### 40~50대: 균형형
- 국내 가치주: 30%
- 해외 배당 ETF: 25%
- 채권: 30%
- 현금: 15%

### 60대 이상: 안정형
- 배당주: 20%
- 채권: 50%
- 현금성 자산: 30%

## 리밸런싱 전략

포트폴리오는 만들고 끝이 아닙니다. 정기적인 리밸런싱이 핵심입니다.

```javascript
function shouldRebalance(currentRatio, targetRatio, threshold = 5) {
  return Math.abs(currentRatio - targetRatio) > threshold;
}

// 분기별 리밸런싱 체크
function quarterlyRebalanceCheck(portfolio) {
  const alerts = [];
  for (const [asset, targetRatio] of portfolio.assets) {
    const currentRatio = calculateCurrentRatio(asset);
    if (shouldRebalance(currentRatio, targetRatio)) {
      alerts.push(`${asset}: ${currentRatio}% → ${targetRatio}% 조정 필요`);
    }
  }
  return alerts;
}
```

## 흔한 실수들

1. **감정적 매매**: 공포에 팔고, 탐욕에 사는 패턴을 반복합니다
2. **과도한 매매**: 잦은 거래는 수수료와 세금으로 수익을 갉아먹습니다
3. **트렌드 추종**: 이미 오른 종목을 뒤늦게 쫓는 것은 위험합니다
4. **리서치 부족**: 남의 추천만 믿고 투자하면 안 됩니다

## 추천 학습 자료

- [한국거래소 투자교육](https://www.krx.co.kr) - 기초 교육 프로그램
- 버튼 그레이엄의 "현명한 투자자" - 가치투자의 고전
- 존 보글의 "모든 주식을 소유하라" - 인덱스 투자 입문

투자는 마라톤입니다. 단기 수익에 현혹되지 말고, 꾸준한 학습과 인내심을 가지고 장기적인 관점에서 접근하시길 바랍니다.
