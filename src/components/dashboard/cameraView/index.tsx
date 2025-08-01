import React, { useEffect, useState } from 'react';

import CameraStream from '@/components/common/cameraStream';

import {
  DetectionWithBboxInfo,
  fetchDetectionsWithBboxInfo,
} from '@/api/dashboard/cameraView';

import DetectionItem from './DetectionItem';

/**
 * 중앙 메인 대시보드 그리드 컴포넌트
 * 카메라 스트림 3개와 최근 활동을 4칸 그리드로 표시
 */
const CameraView: React.FC = () => {
  const [detections, setDetections] = useState<DetectionWithBboxInfo[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const getDetections = async (showLoading = false) => {
    if (showLoading) {
      setIsRefreshing(true);
    }
    try {
      const detections = await fetchDetectionsWithBboxInfo();
      console.log('detections', detections);
      setDetections(detections);
    } catch (error) {
      console.error('탐지 기록 가져오기 실패:', error);
    } finally {
      if (showLoading) {
        setIsRefreshing(false);
      }
    }
  };

  const handleRefresh = () => {
    getDetections(true);
  };

  useEffect(() => {
    // 초기 로드
    getDetections();

    // 30초마다 자동 새로고침 (로딩 표시 없이)
    const interval = setInterval(() => {
      getDetections(false);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-full flex-1 p-6 transition-all duration-300 ease-in-out">
      <div className="grid h-full grid-cols-2 grid-rows-2 gap-6">
        {/* 카메라 1 - 좌상단 */}
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-lg">
          <div className="flex h-full flex-col">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">카메라 1</h3>
            </div>
            <div className="min-h-0 flex-1">
              <CameraStream
                cameraId={1}
                showControls={true}
                className="h-full w-full"
              />
            </div>
          </div>
        </div>

        {/* 카메라 2 - 우상단 */}
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-lg">
          <div className="flex h-full flex-col">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">카메라 2</h3>
            </div>
            <div className="min-h-0 flex-1">
              <CameraStream
                cameraId={2}
                showControls={true}
                className="h-full w-full"
              />
            </div>
          </div>
        </div>

        {/* 카메라 3 - 좌하단 */}
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-lg">
          <div className="flex h-full flex-col">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">카메라 3</h3>
            </div>
            <div className="min-h-0 flex-1">
              <CameraStream
                cameraId={3}
                showControls={true}
                className="h-full w-full"
              />
            </div>
          </div>
        </div>

        {/* 최근 활동 - 우하단 */}
        <div className="flex flex-col rounded-lg border border-gray-200 bg-white p-6 shadow-lg">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">최근 활동</h3>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center justify-center rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
              title="새로고침"
            >
              <svg
                className={`h-5 w-5 transition-transform ${
                  isRefreshing ? 'animate-spin' : ''
                }`}
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
          <div className="flex-1 space-y-3 overflow-y-auto">
            {detections.length > 0 ? (
              detections.map((detection) => (
                <DetectionItem
                  key={detection.detection_id || detection.id}
                  detection={detection}
                />
              ))
            ) : (
              <p className="py-4 text-center text-sm text-gray-500">
                탐지 기록이 없습니다.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CameraView;
