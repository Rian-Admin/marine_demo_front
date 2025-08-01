import React, { useEffect, useState } from 'react';

import Image from 'next/image';
import { useRouter } from 'next/router';

import rianLogo from '@/assets/rian_logo.png';

// 임시 translate 함수
const translate = (korean: string, english: string, language: string) => {
  return language === 'ko' ? korean : english;
};

interface TopbarProps {
  pageTitle: string;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  language: string;
  changeLanguage: (lang: string) => void;
  handleLogout: () => void;
  unreadAlertCount: number;
  handleAlertClick: () => void;
}

const Topbar: React.FC<TopbarProps> = ({
  pageTitle,
  isSidebarOpen,
  setIsSidebarOpen,
  language,
  changeLanguage,
  handleLogout,
  unreadAlertCount,
  handleAlertClick,
}) => {
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [currentDate, setCurrentDate] = useState('');
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);

  // 시간 업데이트 효과
  useEffect(() => {
    // 초기 시간 설정
    setCurrentTime(new Date());

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // 날짜 포맷 설정
    const updateDate = () => {
      const today = new Date();

      if (language === 'ko') {
        setCurrentDate(
          `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`
        );
      } else {
        setCurrentDate(
          `${today.getFullYear()}/${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}`
        );
      }
    };

    updateDate();

    return () => clearInterval(timer);
  }, [language]);

  // 시간 포맷 함수
  const formatTime = (date: Date) => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  const handleLanguageChange = (lang: string) => {
    changeLanguage(lang);
    setIsLanguageMenuOpen(false);
  };

  return (
    <div
      className="relative z-10 flex h-16 items-center justify-between px-6"
      style={{
        backgroundColor: '#0a1929',
        background:
          'linear-gradient(90deg, #0a1929 0%, #0d47a1 50%, #0a1929 100%)',
        borderBottom: '1px solid #1e3a5a',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
      }}
    >
      {/* 왼쪽 영역: 메뉴 버튼과 타이틀 */}
      <div className="flex items-center">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="mr-4 rounded p-2 text-white transition-colors hover:bg-slate-700"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        {/* 로고 */}
        <div
          onClick={() => router.push('/')}
          className="mr-3 flex h-30 w-30 cursor-pointer items-center justify-center rounded transition-transform hover:scale-105"
        >
          <Image
            src={rianLogo}
            alt="RIAN Logo"
            width={120}
            height={120}
            className="rounded object-contain"
            priority
          />
        </div>

        <div className="flex flex-row items-center justify-center gap-4 text-2xl font-bold text-white">
          <p>AIACS 조류충돌방지시스템</p>
          <p>-</p>
          <p className="text-lg">{pageTitle}</p>
        </div>
        {/* <p className="text-2xl font-bold text-white">{pageTitle}</p> */}
      </div>

      {/* 오른쪽 영역: 언어, 알림, 로그아웃, 시간 */}
      <div className="flex items-center space-x-4">
        {/* 언어 선택 */}
        <div className="relative">
          <button
            onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
            className="flex items-center rounded p-2 text-white transition-colors hover:bg-slate-700"
            title={translate('언어 선택', 'Select Language', language)}
          >
            <svg
              className="mr-1 h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
              />
            </svg>
            <span className="text-sm font-medium">
              {language === 'ko' ? '한국어' : 'English'}
            </span>
            <svg
              className={`ml-1 h-4 w-4 transition-transform ${isLanguageMenuOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {/* 언어 선택 드롭다운 */}
          {isLanguageMenuOpen && (
            <div
              className="absolute top-full right-0 mt-1 w-32 rounded border border-gray-600 bg-slate-800 py-1 shadow-lg"
              style={{ zIndex: 1000 }}
            >
              <button
                onClick={() => handleLanguageChange('ko')}
                className={`block w-full px-4 py-2 text-left text-sm transition-colors hover:bg-slate-700 ${
                  language === 'ko'
                    ? 'bg-slate-700 text-blue-400'
                    : 'text-white'
                }`}
              >
                한국어
              </button>
              <button
                onClick={() => handleLanguageChange('en')}
                className={`block w-full px-4 py-2 text-left text-sm transition-colors hover:bg-slate-700 ${
                  language === 'en'
                    ? 'bg-slate-700 text-blue-400'
                    : 'text-white'
                }`}
              >
                English
              </button>
            </div>
          )}
        </div>

        {/* 알림 버튼 */}
        <button
          onClick={handleAlertClick}
          className="relative rounded p-2 text-white transition-colors hover:bg-slate-700"
          title={translate('알림', 'Notifications', language)}
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-5 5v-5zm-8-3a7 7 0 1014 0H7z"
            />
          </svg>
          {unreadAlertCount > 0 && (
            <span
              className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white"
              style={{
                background: 'linear-gradient(135deg, #ff4444 0%, #cc0000 100%)',
                boxShadow: '0 2px 4px rgba(255, 68, 68, 0.3)',
              }}
            >
              {unreadAlertCount > 9 ? '9+' : unreadAlertCount}
            </span>
          )}
        </button>

        {/* 로그아웃 버튼 */}
        <button
          onClick={handleLogout}
          className="rounded p-2 text-white transition-colors hover:bg-slate-700 hover:text-red-400"
          title={translate('로그아웃', 'Logout', language)}
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
        </button>

        {/* 시간 표시 */}
        <div className="rounded bg-black/20 px-3 py-2 text-right text-white">
          <div className="font-mono text-lg">
            {currentTime ? formatTime(currentTime) : '--:--:--'}
          </div>
          <div className="text-xs text-gray-300">{currentDate}</div>
        </div>
      </div>
    </div>
  );
};

export default Topbar;
