import { useCallback, useState } from 'react';

import CameraView from '@/components/dashboard/cameraView';
import LeftSidePanel from '@/components/dashboard/leftSidePannel';
import MapView from '@/components/dashboard/mapView';
import RadarView from '@/components/dashboard/radarView';
import RightSidePanel from '@/components/dashboard/rightSidePannel';

import useAppStore from '@/store/useAppStore';

// 중앙 뷰 타입 정의
type CentralViewType = 'camera' | 'map' | 'radar';

/**
 * 대시보드 메인 컴포넌트
 * 시스템의 주요 상태와 정보를 한눈에 볼 수 있는 화면
 */
export default function Home() {
  // 패널 상태 관리
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);

  // 중앙 뷰 선택 상태 관리
  const [selectedView, setSelectedView] = useState<CentralViewType>('camera');

  // 사이드바 토글 핸들러
  const handleToggleLeftPanel = useCallback(() => {
    setShowLeftPanel((prev) => !prev);
  }, []);

  const handleToggleRightPanel = useCallback(() => {
    setShowRightPanel((prev) => !prev);
  }, []);

  // 뷰 선택 핸들러
  const handleViewChange = useCallback((view: CentralViewType) => {
    setSelectedView(view);
  }, []);

  // 뷰 옵션 정의
  const viewOptions = [
    { key: 'camera' as CentralViewType, label: '개별 카메라 화면' },
    { key: 'map' as CentralViewType, label: '조류 위치 현황' },
    { key: 'radar' as CentralViewType, label: '조류 레이더 현황', icon: '📈' },
  ];

  const { radarEnabled } = useAppStore();

  return (
    <div className="bg-'#f5f5f5 flex h-full">
      {/* 왼쪽 패널 */}
      <LeftSidePanel isOpen={showLeftPanel} onToggle={handleToggleLeftPanel} />

      {/* 중앙/메인 컨텐츠 영역 */}
      <div className="relative flex flex-1 flex-col transition-all duration-300 ease-in-out">
        {/* 상단 뷰 선택 탭 */}
        <div className="flex-shrink-0 border-b border-gray-200 bg-white shadow-sm">
          <div className="flex">
            {viewOptions.map(
              (option) =>
                option.key !== 'radar' && (
                  <button
                    key={option.key}
                    onClick={() => handleViewChange(option.key)}
                    className={`flex items-center space-x-2 border-b-2 px-6 py-4 font-medium transition-all duration-200 ${
                      selectedView === option.key
                        ? 'border-blue-500 bg-blue-50 text-blue-600'
                        : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                    }`}
                  >
                    <span>{option.label}</span>
                  </button>
                )
            )}
            {radarEnabled && (
              <button
                key={viewOptions[2].key}
                onClick={() => handleViewChange(viewOptions[2].key)}
                className={`flex items-center space-x-2 border-b-2 px-6 py-4 font-medium transition-all duration-200 ${
                  selectedView === viewOptions[2].key
                    ? 'border-blue-500 bg-blue-50 text-blue-600'
                    : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                }`}
              >
                <span>{viewOptions[2].label}</span>
              </button>
            )}
          </div>
        </div>

        {/* 선택된 뷰 컨텐츠 */}
        <div className="flex-1 overflow-hidden">
          {selectedView === 'camera' && <CameraView />}
          {selectedView === 'map' && <MapView />}
          {selectedView === 'radar' && <RadarView />}
        </div>
      </div>

      {/* 오른쪽 패널 */}
      <RightSidePanel
        isOpen={showRightPanel}
        onToggle={handleToggleRightPanel}
      />
    </div>
  );
}
