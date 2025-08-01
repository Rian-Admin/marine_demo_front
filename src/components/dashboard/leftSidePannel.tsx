import { useCallback, useEffect, useState } from 'react';

import {
  BirdActivityItem,
  WeatherData,
  fetchAllLeftPanelData,
  fetchBirdActivityData,
  fetchWeatherData,
} from '@/api/dashboard/leftSidePannel';

interface LeftSidePanelProps {
  isOpen: boolean;
  onToggle: () => void;
}

const LeftSidePanel: React.FC<LeftSidePanelProps> = ({ isOpen, onToggle }) => {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [birdActivityData, setBirdActivityData] = useState<BirdActivityItem[]>([
    { id: 'SG-01', count: 0, risk: 'low', timestamp: new Date() },
    { id: 'SG-02', count: 0, risk: 'low', timestamp: new Date() },
    { id: 'SG-03', count: 0, risk: 'low', timestamp: new Date() },
  ]);
  const [birdActivityLoading, setBirdActivityLoading] = useState(false);

  // 시간 업데이트 효과 - 클라이언트에서만 실행
  useEffect(() => {
    // 초기 시간 설정
    setCurrentTime(new Date());

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 초기 데이터 로드
  useEffect(() => {
    const loadInitialData = async () => {
      const { weatherData, birdActivityData } = await fetchAllLeftPanelData();

      if (weatherData) {
        setWeatherData(weatherData);
      }
      setBirdActivityData(birdActivityData);
    };

    loadInitialData();

    // 정기적 데이터 갱신 (30초마다)
    const interval = setInterval(async () => {
      const birdData = await fetchBirdActivityData();
      setBirdActivityData(birdData);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // 시간 포맷 함수
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  // 날씨 데이터 새로고침
  const getWeatherData = useCallback(async () => {
    setWeatherLoading(true);
    try {
      const data = await fetchWeatherData();
      setWeatherData(data);
      console.log('날씨 데이터 새로고침 완료');
    } catch (error) {
      console.error('날씨 데이터 새로고침 오류:', error);
    } finally {
      setWeatherLoading(false);
    }
  }, []);

  // 조류 활동 데이터 새로고침
  const getBirdActivityData = useCallback(async () => {
    setBirdActivityLoading(true);
    try {
      const data = await fetchBirdActivityData();
      setBirdActivityData(data);
      console.log('조류 활동 데이터 새로고침 완료');
    } catch (error) {
      console.error('조류 활동 데이터 새로고침 오류:', error);
    } finally {
      setBirdActivityLoading(false);
    }
  }, []);

  // 전체 데이터 새로고침
  const refreshAllData = useCallback(async () => {
    console.log('왼쪽 패널 전체 데이터 새로고침 시작');

    setWeatherLoading(true);
    setBirdActivityLoading(true);

    try {
      const { weatherData, birdActivityData } = await fetchAllLeftPanelData();

      if (weatherData) {
        setWeatherData(weatherData);
      }
      setBirdActivityData(birdActivityData);

      console.log('왼쪽 패널 전체 데이터 새로고침 완료');
    } catch (error) {
      console.error('전체 데이터 새로고침 오류:', error);
    } finally {
      setWeatherLoading(false);
      setBirdActivityLoading(false);
    }
  }, []);

  return (
    <>
      {/* 왼쪽 패널 */}
      <div
        className={`${isOpen ? 'w-80' : 'w-0'} flex-shrink-0 overflow-hidden transition-all duration-300 ease-in-out`}
        style={{
          backgroundColor: 'rgba(10, 25, 41, 0.95)',
          borderRight: '1px solid rgba(30, 58, 90, 0.5)',
          boxShadow: '2px 0 8px rgba(0, 0, 0, 0.2)',
        }}
      >
        {isOpen && (
          <div className="flex h-full flex-col">
            {/* 패널 헤더 */}
            <div className="flex justify-end p-3">
              <button
                onClick={refreshAllData}
                disabled={weatherLoading || birdActivityLoading}
                className="rounded p-2 text-white/70 transition-colors hover:text-white/90 disabled:opacity-50"
                title="모든 데이터 새로고침"
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

            <div className="flex flex-1 flex-col gap-6 overflow-hidden p-4 pt-0">
              {/* 날씨 정보 위젯 */}
              <div className="relative flex-shrink-0">
                <div
                  className="rounded-lg border p-4"
                  style={{
                    backgroundColor: 'rgba(10, 25, 41, 0.95)',
                    borderColor: 'rgba(30, 58, 90, 0.8)',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                  }}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-semibold text-white">날씨 정보</h3>
                    <span className="text-xs text-gray-400">
                      {currentTime ? formatTime(currentTime) : '--:--:--'}
                    </span>
                  </div>
                  {weatherLoading ? (
                    <div className="py-4 text-center text-gray-400">
                      데이터 로딩 중...
                    </div>
                  ) : weatherData ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">위치</span>
                        <span className="text-sm text-white">
                          {weatherData.location}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">온도</span>
                        <span className="text-lg font-bold text-blue-400">
                          {weatherData.current.temperature}°C
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">습도</span>
                        <span className="text-green-400">
                          {weatherData.current.humidity}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">풍속</span>
                        <span className="text-yellow-400">
                          {weatherData.current.wind_speed}m/s
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">날씨</span>
                        <span className="text-white">
                          {weatherData.current.weather_condition}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="py-4 text-center text-gray-400">
                      날씨 데이터 없음
                    </div>
                  )}
                </div>
                {/* 날씨 새로고침 버튼 */}
                <button
                  onClick={getWeatherData}
                  disabled={weatherLoading}
                  className="absolute top-2 right-2 p-1 text-white/50 hover:text-white/80 disabled:opacity-30"
                  title="날씨 데이터 새로고침"
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

              {/* 조류 근접 현황 */}
              <div className="relative flex-shrink-0">
                <div
                  className="rounded-lg border p-4"
                  style={{
                    backgroundColor: 'rgba(10, 25, 41, 0.95)',
                    borderColor: 'rgba(30, 58, 90, 0.8)',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                  }}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-semibold text-white">조류 근접 현황</h3>
                  </div>
                  {birdActivityLoading ? (
                    <div className="py-4 text-center text-gray-400">
                      데이터 로딩 중...
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {birdActivityData.map((turbine) => (
                        <div
                          key={turbine.id}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center space-x-3">
                            <div
                              className={`h-3 w-3 rounded-full ${turbine.risk === 'high' ? 'bg-red-500' : turbine.risk === 'medium' ? 'bg-yellow-500' : 'bg-green-500'} animate-pulse`}
                            ></div>
                            <span className="text-gray-300">{turbine.id}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-lg font-bold text-white">
                              {turbine.count}
                            </span>
                            <span className="ml-1 text-sm text-gray-400">
                              마리
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {/* 조류 활동 새로고침 버튼 */}
                <button
                  onClick={getBirdActivityData}
                  disabled={birdActivityLoading}
                  className="absolute top-2 right-2 p-1 text-white/50 hover:text-white/80 disabled:opacity-30"
                  title="조류 활동 데이터 새로고침"
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

              {/* AI 조류 행동 패턴 분석 */}
              <div className="min-h-0 flex-1">
                <div
                  className="h-full rounded-lg border p-4"
                  style={{
                    backgroundColor: 'rgba(10, 25, 41, 0.95)',
                    borderColor: 'rgba(30, 58, 90, 0.8)',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                  }}
                >
                  <h3 className="mb-3 font-semibold text-white">
                    AI 행동 패턴 분석
                  </h3>
                  <div className="space-y-4 text-sm">
                    <div className="rounded bg-blue-900/30 p-3">
                      <div className="mb-1 font-medium text-blue-300">
                        위험도 예측
                      </div>
                      <div className="text-gray-300">
                        현재 기상조건에서 조류 활동이 증가할 예정입니다.
                      </div>
                    </div>
                    <div className="rounded bg-green-900/30 p-3">
                      <div className="mb-1 font-medium text-green-300">
                        행동 패턴
                      </div>
                      <div className="text-gray-300">
                        오전 시간대 SG-01 지역 집중 활동 감지
                      </div>
                    </div>
                    <div className="rounded bg-orange-900/30 p-3">
                      <div className="mb-1 font-medium text-orange-300">
                        권장 사항
                      </div>
                      <div className="text-gray-300">
                        카메라 1번의 모니터링 강화가 필요합니다.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 왼쪽 패널 토글 버튼 */}
      <div className="relative z-50 flex w-6 items-center justify-center">
        <button
          onClick={onToggle}
          className="absolute h-20 w-6 rounded-r-lg border border-l-0 border-white/10 text-white shadow-lg transition-all duration-200 hover:shadow-xl"
          style={{
            background: 'linear-gradient(90deg, #1e3a5a 0%, #2c4f7c 100%)',
            left: 0,
            top: '50%',
            transform: 'translateY(-50%)',
          }}
          onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
            e.currentTarget.style.background =
              'linear-gradient(90deg, #254a75 0%, #3a6ca5 100%)';
            e.currentTarget.style.boxShadow = '0 0 8px rgba(33, 150, 243, 0.5)';
          }}
          onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
            e.currentTarget.style.background =
              'linear-gradient(90deg, #1e3a5a 0%, #2c4f7c 100%)';
            e.currentTarget.style.boxShadow = '3px 0 6px rgba(0,0,0,0.25)';
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
                d="M15 19l-7-7 7-7"
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
                d="M9 5l7 7-7 7"
              />
            </svg>
          )}
        </button>
      </div>
    </>
  );
};

export default LeftSidePanel;
