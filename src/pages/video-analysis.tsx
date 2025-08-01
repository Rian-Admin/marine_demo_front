import { useCallback, useState } from 'react';

import Analysis from '@/components/videoAnalysis/analysis';
import VideoPlay from '@/components/videoAnalysis/videoPlay';

// 탭 타입 정의
type TabType = 'video-analysis' | 'video-playback';

/**
 * 동영상 분석 메인 페이지
 * 동영상 분석과 영상 재생 시스템 기능을 제공
 */
export default function VideoAnalysis() {
  // 선택된 탭 상태 관리
  const [selectedTab, setSelectedTab] = useState<TabType>('video-analysis');

  // 탭 변경 핸들러
  const handleTabChange = useCallback((tab: TabType) => {
    setSelectedTab(tab);
  }, []);

  // 탭 옵션 정의
  const tabOptions = [
    { key: 'video-analysis' as TabType, label: '동영상 분석' },
    { key: 'video-playback' as TabType, label: '영상 재생 시스템' },
  ];

  return (
    <div className="flex h-full flex-col bg-gray-50">
      {/* 상단 탭 영역 */}
      <div className="flex-shrink-0 border-b border-gray-200 bg-white shadow-sm">
        <div className="flex">
          {tabOptions.map((option) => (
            <button
              key={option.key}
              onClick={() => handleTabChange(option.key)}
              className={`flex items-center space-x-2 border-b-2 px-6 py-4 font-medium transition-all duration-200 ${
                selectedTab === option.key
                  ? 'border-blue-500 bg-blue-50 text-blue-600'
                  : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-800'
              }`}
            >
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 컨텐츠 영역 */}
      <div className="min-h-0 flex-1 overflow-hidden">
        {selectedTab === 'video-analysis' && <Analysis />}
        {selectedTab === 'video-playback' && <VideoPlay />}
      </div>
    </div>
  );
}
