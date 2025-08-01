import React, { useEffect, useState } from 'react';

import { useRouter } from 'next/router';

import Sidebar from './sidebar';
import Topbar from './topbar';

// import { translate } from '../../utils/i18n';

// 임시 translate 함수 (실제 i18n 유틸리티가 구현될 때까지)
const translate = (korean: string, english: string, language: string) => {
  return language === 'ko' ? korean : english;
};

/**
 * 앱의 기본 레이아웃 컴포넌트
 * - 사이드바, 상단바, 메인 콘텐츠 영역 제공
 */
interface LayoutProps {
  children: React.ReactNode;
  language?: string;
  changeLanguage?: (lang: string) => void;
  handleLogout?: () => void;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  language = 'ko',
  changeLanguage = () => {},
  handleLogout = () => {},
}) => {
  // 사이드바 초기값을 false(닫힌 상태)로 설정
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();

  // 현재 경로에 따른 사이드바 토글 (모바일에서는 기본적으로 닫혀있음)
  useEffect(() => {
    const handleResize = () => {
      // 모바일 화면은 항상
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      }
      // 데스크탑에서도 초기 로드 시 닫힌 상태 유지
      // else {
      //   setIsSidebarOpen(true);
      // }
    };

    // 초기 크기 설정 및 리사이즈 이벤트 리스너 추가
    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 라우트에 따른 페이지 제목 설정
  const getPageTitle = () => {
    const path = router.pathname;

    switch (path) {
      case '/':
        return translate('대시보드', 'Dashboard', language);
      case '/video-analysis':
        return translate('동영상 분석', 'Video Analysis', language);
      case '/radar':
        return translate('레이더 모니터링', 'Radar Monitoring', language);
      case '/weather':
        return translate('기상 정보', 'Weather Data', language);
      case '/analytics':
        return translate('분석 및 통계', 'Analytics & Statistics', language);
      case '/alerts':
        return translate('알림 및 이벤트', 'Alerts & Events', language);
      case '/defense-control':
        return translate('시스템 제어', 'Defense System Control', language);
      case '/settings':
        return translate('설정', 'Settings', language);
      default:
        return translate(
          '조류충돌방지시스템',
          'Bird Collision Prevention System',
          language
        );
    }
  };

  return (
    <div className="h-screen overflow-hidden">
      {/* 상단바 컴포넌트 - 전체 상단에 고정 */}
      <Topbar
        pageTitle={getPageTitle()}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        language={language}
        changeLanguage={changeLanguage}
        handleLogout={handleLogout}
        unreadAlertCount={0}
        handleAlertClick={() => {}}
      />

      {/* 하단 영역: 사이드바 + 메인 콘텐츠 */}
      <div className="flex" style={{ height: 'calc(100vh - 64px)' }}>
        {/* 사이드바 컴포넌트 */}
        <Sidebar
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          language={language}
          highestRiskLevel="low"
        />

        {/* 메인 콘텐츠 */}
        <div
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
          style={{ backgroundColor: '#f5f5f5' }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;
