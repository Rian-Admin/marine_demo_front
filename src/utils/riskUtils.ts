/**
 * 위험도 관련 util 함수
 * dashboard/cameraView/DetectionItem.tsx 에서 사용
 * 조류 탐지 결과에 따라 위험도를 계산하여 위험 단계와 색상 반환
 */

export type RiskLevel = 'low' | 'medium' | 'high';

export const riskColors = {
  high: {
    primary: '#FF5252',
    secondary: '#FF8A80',
    bg: 'rgba(255, 82, 82, 0.08)',
    textClass: 'text-red-500',
  },
  medium: {
    primary: '#FFB74D',
    secondary: '#FFCC80',
    bg: 'rgba(255, 183, 77, 0.08)',
    textClass: 'text-orange-500',
  },
  low: {
    primary: '#69F0AE',
    secondary: '#B9F6CA',
    bg: 'rgba(105, 240, 174, 0.08)',
    textClass: 'text-green-500',
  },
} as const;

export const getRiskLevel = (bb_count: number): RiskLevel => {
  if (bb_count > 5) return 'high';
  if (bb_count > 2) return 'medium';
  return 'low';
};

export const getRiskText = (level: RiskLevel): string => {
  const textMap = {
    low: '관찰',
    medium: '주의',
    high: '경고',
  };
  return textMap[level];
};

export const getRiskColorClass = (level: RiskLevel): string => {
  return riskColors[level].textClass;
};
