/**
 * 다국어 번역 유틸리티 함수
 */
export const translate = (
  korean: string,
  english: string,
  language: string
): string => {
  return language === 'ko' ? korean : english;
};

/**
 * 언어 코드에 따른 표시명 반환
 */
export const getLanguageDisplayName = (languageCode: string): string => {
  const languageMap: Record<string, string> = {
    ko: '한국어',
    en: 'English',
  };
  return languageMap[languageCode] || languageCode;
};
