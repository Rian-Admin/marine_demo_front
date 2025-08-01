import { useCallback, useEffect, useState } from 'react';

import {
  DailyCameraStats,
  DirectionBboxData,
  SpeciesStatsItem,
  fetchAllRightPanelData,
  fetchDailyCameraStats,
  fetchDirectionBboxData,
  fetchSpeciesStats,
} from '@/api/dashboard/rightSidePannel';

import DirectionDistribution from './directionDistribution';

interface RightSidePanelProps {
  isOpen: boolean;
  onToggle: () => void;
}

const RightSidePanel: React.FC<RightSidePanelProps> = ({
  isOpen,
  onToggle,
}) => {
  const [dailyStats, setDailyStats] = useState<DailyCameraStats>({
    total: 0,
    camera1: 0,
    camera2: 0,
    camera3: 0,
  });
  const [speciesStats, setSpeciesStats] = useState<SpeciesStatsItem[]>([
    { name: '까마귀', count: 15, color: '#4caf50' },
    { name: '매', count: 12, color: '#ff9800' },
    { name: '갈매기', count: 10, color: '#2196f3' },
    { name: '독수리', count: 8, color: '#f44336' },
    { name: '기타', count: 2, color: '#9c27b0' },
  ]);
  const [directionBboxData, setDirectionBboxData] = useState<DirectionBboxData>(
    {
      N: [],
      NE: [],
      E: [],
      SE: [],
      S: [],
      SW: [],
      W: [],
      NW: [],
    }
  );

  // 로딩 상태
  const [dailyStatsLoading, setDailyStatsLoading] = useState(false);
  const [speciesStatsLoading, setSpeciesStatsLoading] = useState(false);
  const [directionStatsLoading, setDirectionStatsLoading] = useState(false);

  // 초기 데이터 로드
  useEffect(() => {
    const loadInitialData = async () => {
      const { dailyCameraStats, speciesStats } = await fetchAllRightPanelData();
      const directionBboxData = await fetchDirectionBboxData();

      setDailyStats(dailyCameraStats);
      setSpeciesStats(speciesStats);
      setDirectionBboxData(directionBboxData);
    };

    loadInitialData();

    // 정기적 데이터 갱신 (5분마다)
    const interval = setInterval(
      async () => {
        const { dailyCameraStats, speciesStats } =
          await fetchAllRightPanelData();
        const directionBboxData = await fetchDirectionBboxData();
        setDailyStats(dailyCameraStats);
        setSpeciesStats(speciesStats);
        setDirectionBboxData(directionBboxData);
      },
      5 * 60 * 1000
    );

    return () => clearInterval(interval);
  }, []);

  // 일일 카메라별 누적 현황 데이터 새로고침
  const getDailyCameraStats = useCallback(async () => {
    setDailyStatsLoading(true);
    try {
      const data = await fetchDailyCameraStats();
      setDailyStats(data);
    } catch (error) {
      console.error('일일 카메라별 누적 현황 데이터 새로고침 오류:', error);
    } finally {
      setDailyStatsLoading(false);
    }
  }, []);

  // 종별 통계 데이터 새로고침
  const getSpeciesStats = useCallback(async () => {
    setSpeciesStatsLoading(true);
    try {
      const data = await fetchSpeciesStats();
      setSpeciesStats(data);
    } catch (error) {
      console.error('종별 통계 데이터 새로고침 오류:', error);
    } finally {
      setSpeciesStatsLoading(false);
    }
  }, []);

  // 전체 데이터 새로고침
  const refreshStats = useCallback(async () => {
    setDailyStatsLoading(true);
    setSpeciesStatsLoading(true);
    setDirectionStatsLoading(true);

    try {
      const { dailyCameraStats, speciesStats } = await fetchAllRightPanelData();
      const directionBboxData = await fetchDirectionBboxData();

      setDailyStats(dailyCameraStats);
      setSpeciesStats(speciesStats);
      setDirectionBboxData(directionBboxData);
    } catch (error) {
      console.error('전체 데이터 새로고침 오류:', error);
    } finally {
      setDailyStatsLoading(false);
      setSpeciesStatsLoading(false);
      setDirectionStatsLoading(false);
    }
  }, []);

  return (
    <>
      {/* 오른쪽 패널 토글 버튼 */}
      <div className="relative z-50 flex w-6 items-center justify-center">
        <button
          onClick={onToggle}
          className="absolute h-20 w-6 rounded-l-lg border border-r-0 border-white/10 text-white shadow-lg transition-all duration-200 hover:shadow-xl"
          style={{
            background: 'linear-gradient(90deg, #2c4f7c 0%, #1e3a5a 100%)',
            right: 0,
            top: '50%',
            transform: 'translateY(-50%)',
          }}
          onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
            e.currentTarget.style.background =
              'linear-gradient(90deg, #3a6ca5 0%, #254a75 100%)';
            e.currentTarget.style.boxShadow = '0 0 8px rgba(33, 150, 243, 0.5)';
          }}
          onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
            e.currentTarget.style.background =
              'linear-gradient(90deg, #2c4f7c 0%, #1e3a5a 100%)';
            e.currentTarget.style.boxShadow = '-3px 0 6px rgba(0,0,0,0.25)';
          }}
        >
          {isOpen ? (
            <svg
              className="h-4 w-4"
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
          ) : (
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          )}
        </button>
      </div>

      {/* 오른쪽 패널 */}
      <div
        className={`${isOpen ? 'w-80' : 'w-0'} flex-shrink-0 overflow-hidden transition-all duration-300 ease-in-out`}
        style={{
          backgroundColor: 'rgba(10, 25, 41, 0.95)',
          borderLeft: '1px solid rgba(30, 58, 90, 0.5)',
          boxShadow: '-2px 0 8px rgba(0, 0, 0, 0.2)',
        }}
      >
        {isOpen && (
          <div className="flex h-full flex-col p-4">
            {/* 패널 헤더 */}
            <div className="mb-4 flex justify-end">
              <button
                onClick={refreshStats}
                disabled={
                  dailyStatsLoading ||
                  speciesStatsLoading ||
                  directionStatsLoading
                }
                className="rounded p-2 text-white/70 transition-colors hover:text-white/90 disabled:opacity-50"
                title="통계 데이터 새로고침"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>
            </div>

            <div className="flex h-full flex-col justify-between space-y-4">
              {/* 일일 누적 현황 위젯 */}
              {/* TODO: 세로 그래프로 변경하기 */}
              <div
                className="relative h-1/3 rounded-lg border p-4"
                style={{
                  backgroundColor: 'rgba(10, 25, 41, 0.95)',
                  borderColor: 'rgba(30, 58, 90, 0.8)',
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                }}
              >
                <h3 className="mb-3 font-semibold text-white">
                  일일 누적 현황
                </h3>
                {dailyStatsLoading ? (
                  <div className="py-4 text-center text-gray-400">
                    데이터 로딩 중...
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">전체</span>
                      <span className="text-xl font-bold text-blue-400">
                        {dailyStats.total}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">카메라 1</span>
                        <span className="text-blue-300">
                          {dailyStats.camera1}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">카메라 2</span>
                        <span className="text-green-300">
                          {dailyStats.camera2}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">카메라 3</span>
                        <span className="text-purple-300">
                          {dailyStats.camera3}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                {/* 일일 누적 현황 새로고침 버튼 */}
                <button
                  onClick={getDailyCameraStats}
                  disabled={dailyStatsLoading}
                  className="absolute top-2 right-2 p-1 text-white/50 hover:text-white/80 disabled:opacity-30"
                  title="일일 누적 현황 새로고침"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                </button>
              </div>

              {/* 종별 누적 현황 위젯 */}
              <div
                className="relative h-1/3 rounded-lg border p-4"
                style={{
                  backgroundColor: 'rgba(10, 25, 41, 0.95)',
                  borderColor: 'rgba(30, 58, 90, 0.8)',
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                }}
              >
                <h3 className="mb-3 font-semibold text-white">
                  종별 누적 현황
                </h3>
                {speciesStatsLoading ? (
                  <div className="py-4 text-center text-gray-400">
                    데이터 로딩 중...
                  </div>
                ) : speciesStats.length > 0 ? (
                  <div className="space-y-2">
                    {speciesStats.map((species) => (
                      <div
                        key={species.name}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-2">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: species.color }}
                          ></div>
                          <span className="text-sm text-gray-300">
                            {species.name}
                          </span>
                        </div>
                        <span className="font-medium text-white">
                          {species.count}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-4 text-center text-gray-400">
                    종별 데이터 없음
                  </div>
                )}
                {/* 종별 통계 새로고침 버튼 */}
                <button
                  onClick={getSpeciesStats}
                  disabled={speciesStatsLoading}
                  className="absolute top-2 right-2 p-1 text-white/50 hover:text-white/80 disabled:opacity-30"
                  title="종별 통계 새로고침"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                </button>
              </div>

              {/* 방위별 출현현황 위젯 */}
              <DirectionDistribution
                directionBboxData={directionBboxData}
                directionStatsLoading={directionStatsLoading}
                onDataUpdate={setDirectionBboxData}
                onLoadingUpdate={setDirectionStatsLoading}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default RightSidePanel;
