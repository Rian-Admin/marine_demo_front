import React from 'react';

import { useRouter } from 'next/router';

import { translate } from '@/utils/i18n';

import useAppStore from '@/store/useAppStore';

interface SidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  language: string;
  highestRiskLevel: string;
}

const Sidebar: React.FC<SidebarProps> = ({
  isSidebarOpen,
  setIsSidebarOpen,
  language,
}) => {
  const router = useRouter();

  // 설정 상태 가져오기
  const { radarEnabled, weatherEnabled } = useAppStore();

  // 기본 메뉴 아이템들
  const allMenuItems = [
    {
      path: '/',
      icon: '🏠',
      label: translate('대시보드', 'Dashboard', language),
    },
    {
      path: '/video-analysis',
      icon: '🎥',
      label: translate('동영상 분석', 'Video Analysis', language),
    },
    {
      path: '/radar',
      icon: '📡',
      label: translate('레이더 모니터링', 'Radar Monitoring', language),
    },
    {
      path: '/weather',
      icon: '🌤️',
      label: translate('기상 정보', 'Weather Data', language),
    },
    {
      path: '/analytics',
      icon: '📊',
      label: translate('분석 및 통계', 'Analytics & Statistics', language),
    },
    {
      path: '/alerts',
      icon: '🚨',
      label: translate('알림 및 이벤트', 'Alerts & Events', language),
    },
    {
      path: '/defense-control',
      icon: '🛡️',
      label: translate('시스템 제어', 'Defense System Control', language),
    },
    {
      path: '/settings',
      icon: '⚙️',
      label: translate('설정', 'Settings', language),
    },
  ];

  // 설정에 따라 메뉴 필터링
  const menuItems = allMenuItems.filter((item) => {
    // 레이더 메뉴는 radarEnabled가 true일 때만 표시
    if (item.path === '/radar' && !radarEnabled) {
      return false;
    }
    // 기상정보 메뉴는 weatherEnabled가 true일 때만 표시
    if (item.path === '/weather' && !weatherEnabled) {
      return false;
    }
    return true;
  });

  const handleNavigation = (path: string) => {
    router.push(path);
    // 모바일에서는 메뉴 선택 후 사이드바 닫기
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <>
      {/* 모바일 오버레이 */}
      {isSidebarOpen && (
        <div
          className="bg-opacity-50 fixed z-20 bg-black md:hidden"
          style={{
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
          }}
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* 사이드바 */}
      <div
        className={` ${isSidebarOpen ? 'w-56' : 'w-0 md:w-16'} fixed top-0 bottom-0 left-0 z-30 flex flex-col shadow-lg transition-all duration-300 ease-in-out md:relative md:z-10`}
        style={{
          backgroundColor: '#0a1929',
          height: '100%', // 컨테이너 전체 높이 사용
        }}
      >
        {/* 사이드바 헤더 */}
        <div className="border-b p-4" style={{ borderColor: '#1e3a5a' }}>
          <div className="flex items-center justify-between">
            {isSidebarOpen && (
              <div className="text-white">
                <h2 className="text-lg font-semibold">AIACS</h2>
                <p className="text-xs text-gray-400">
                  {translate(
                    '조류충돌방지시스템',
                    'Bird Collision Prevention',
                    language
                  )}
                </p>
              </div>
            )}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="rounded p-2 text-white transition-colors"
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor =
                  'rgba(255, 255, 255, 0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <svg
                className={`h-5 w-5 transition-transform ${isSidebarOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* 메뉴 아이템들 */}
        <nav className="flex-1 py-4">
          <ul className="space-y-2 px-3">
            {menuItems.map((item) => (
              <li key={item.path}>
                <button
                  onClick={() => handleNavigation(item.path)}
                  className={`flex w-full items-center ${isSidebarOpen ? 'justify-start' : 'justify-center'} space-x-3 rounded-lg px-3 py-2 transition-colors ${
                    router.pathname === item.path
                      ? 'text-white'
                      : 'text-gray-300 hover:text-white'
                  } `}
                  style={{
                    backgroundColor:
                      router.pathname === item.path ? '#1976d2' : 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    if (router.pathname !== item.path) {
                      e.currentTarget.style.backgroundColor =
                        'rgba(255, 255, 255, 0.08)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (router.pathname !== item.path) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                  title={!isSidebarOpen ? item.label : undefined}
                >
                  <span className="flex-shrink-0 text-xl">{item.icon}</span>
                  {isSidebarOpen && (
                    <span className="truncate text-sm font-medium">
                      {item.label}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* 사이드바 푸터 */}
        {isSidebarOpen && (
          <div className="border-t p-4" style={{ borderColor: '#1e3a5a' }}>
            <div className="text-left">
              <p className="text-xs text-gray-500">© 2025 AIACS</p>
              <p className="text-xs text-gray-500">v1.0.0</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Sidebar;
