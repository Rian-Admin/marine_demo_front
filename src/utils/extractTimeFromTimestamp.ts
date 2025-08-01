/**
 * timestamp에서 시간만 추출하는 헬퍼 함수
 */
export const extractTimeFromTimestamp = (timestamp: string): string => {
  if (!timestamp) return '';

  try {
    const date = new Date(timestamp);

    // 유효한 날짜인지 확인
    if (isNaN(date.getTime())) {
      console.warn('유효하지 않은 timestamp:', timestamp);
      return timestamp; // 원본 반환
    }

    // HH:MM:SS 형식으로 시간 추출
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');

    return `${hours}:${minutes}:${seconds}`;
  } catch (error) {
    console.error('timestamp 파싱 오류:', error, timestamp);
    return timestamp; // 오류 시 원본 반환
  }
};
