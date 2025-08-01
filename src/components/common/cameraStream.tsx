import React, { useCallback, useEffect, useRef, useState } from 'react';

import Image from 'next/image';

import {
  CameraItem,
  PTZDirection,
  controlPTZ,
  getCameraById,
  getStreamUrl,
  stopPTZ,
} from '@/api/dashboard/cameraView';

interface CameraStreamProps {
  cameraId: number;
  showControls?: boolean;
  autoPlay?: boolean;
  className?: string;
}

/**
 * 카메라 스트림 컴포넌트
 * 실시간 카메라 영상을 표시하고 PTZ 제어 기능을 제공
 */
const CameraStream: React.FC<CameraStreamProps> = ({
  cameraId,
  showControls = true,
  autoPlay = true,
  className = '',
}) => {
  // 카메라 정보 상태
  const [camera, setCamera] = useState<CameraItem | null>(null);
  const [cameraInfoLoading, setCameraInfoLoading] = useState(true);
  const [cameraInfoError, setCameraInfoError] = useState<string>('');

  // 스트림 상태
  const [streamUrl, setStreamUrl] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamLoading, setStreamLoading] = useState(true);
  const [streamError, setStreamError] = useState<string>('');

  // PTZ 상태
  const [isPTZActive, setIsPTZActive] = useState<string | null>(null);

  // 비디오 참조
  const videoRef = useRef<HTMLVideoElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // 카메라 정보 로드 (독립적)
  useEffect(() => {
    const loadCameraInfo = async () => {
      setCameraInfoLoading(true);
      setCameraInfoError('');

      try {
        const cameraData = await getCameraById(cameraId);
        if (cameraData) {
          setCamera(cameraData);
        } else {
          setCameraInfoError('카메라 정보를 찾을 수 없습니다');
        }
      } catch (error) {
        console.error('카메라 정보 로드 오류:', error);
        setCameraInfoError(
          error instanceof Error
            ? `정보 로드 실패: ${error.message}`
            : '카메라 정보 서버에 연결할 수 없습니다'
        );
      } finally {
        setCameraInfoLoading(false);
      }
    };

    if (cameraId) {
      loadCameraInfo();
    }
  }, [cameraId]);

  // 스트림 연결 (독립적)
  useEffect(() => {
    const connectStream = async () => {
      setStreamLoading(true);
      setStreamError('');
      setIsStreaming(false);

      try {
        // 스트림 URL 생성
        const url = getStreamUrl(cameraId);
        setStreamUrl(url);
        setIsStreaming(true);
      } catch (error) {
        console.error('스트림 연결 오류:', error);
        setStreamError(
          error instanceof Error
            ? `스트림 연결 실패: ${error.message}`
            : '스트림 서버에 연결할 수 없습니다'
        );
      } finally {
        setStreamLoading(false);
      }
    };

    if (cameraId) {
      connectStream();
    }
  }, [cameraId]);

  // 카메라 정보 재연결
  const reconnectCameraInfo = useCallback(async () => {
    setCameraInfoLoading(true);
    setCameraInfoError('');

    try {
      const cameraData = await getCameraById(cameraId);
      if (cameraData) {
        setCamera(cameraData);
      } else {
        setCameraInfoError('카메라 정보를 찾을 수 없습니다');
      }
    } catch (error) {
      console.error('카메라 정보 재연결 오류:', error);
      setCameraInfoError(
        error instanceof Error
          ? `정보 재연결 실패: ${error.message}`
          : '카메라 정보 서버에 연결할 수 없습니다'
      );
    } finally {
      setCameraInfoLoading(false);
    }
  }, [cameraId]);

  // 스트림 재연결
  const reconnectStream = useCallback(async () => {
    setStreamLoading(true);
    setStreamError('');
    setIsStreaming(false);

    try {
      const url = getStreamUrl(cameraId);
      setStreamUrl(url);
      setIsStreaming(true);
    } catch (error) {
      console.error('스트림 재연결 오류:', error);
      setStreamError(
        error instanceof Error
          ? `스트림 재연결 실패: ${error.message}`
          : '스트림 서버에 연결할 수 없습니다'
      );
    } finally {
      setStreamLoading(false);
    }
  }, [cameraId]);

  // 전체 재연결
  const reconnectAll = useCallback(() => {
    reconnectCameraInfo();
    reconnectStream();
  }, [reconnectCameraInfo, reconnectStream]);

  // PTZ 제어 함수
  const handlePTZControl = useCallback(
    async (direction: string) => {
      if (!camera?.ptz_enabled) return;

      try {
        setIsPTZActive(direction);
        await controlPTZ(
          cameraId,
          direction as PTZDirection['direction'],
          true,
          0.7
        );
      } catch (error) {
        console.error('PTZ 제어 오류:', error);
        setIsPTZActive(null);
      }
    },
    [cameraId, camera?.ptz_enabled]
  );

  // PTZ 제어 중지
  const handlePTZStop = useCallback(
    async (direction: string) => {
      if (!camera?.ptz_enabled) return;

      try {
        await stopPTZ(cameraId, direction as PTZDirection['direction']);
        setIsPTZActive(null);
      } catch (error) {
        console.error('PTZ 제어 중지 오류:', error);
        setIsPTZActive(null);
      }
    },
    [cameraId, camera?.ptz_enabled]
  );

  // 비디오 로드 에러 처리
  const handleVideoError = useCallback(() => {
    setStreamError('비디오 스트림을 로드할 수 없습니다');
    setIsStreaming(false);
  }, []);

  // 이미지 로드 에러 처리
  const handleImageError = useCallback(() => {
    setStreamError('이미지 스트림을 로드할 수 없습니다');
    setIsStreaming(false);
  }, []);

  // 전체 로딩 상태 (둘 다 로딩 중)
  if (cameraInfoLoading && streamLoading) {
    return (
      <div
        className={`flex size-full items-center justify-center rounded-lg bg-gray-900 ${className}`}
      >
        <div className="text-center text-white">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-white"></div>
          <p>카메라 {cameraId} 연결 중...</p>
        </div>
      </div>
    );
  }

  // 전체 에러 상태 (둘 다 실패)
  if (cameraInfoError && streamError && !camera && !isStreaming) {
    return (
      <div
        className={`flex size-full flex-col items-center justify-center rounded-lg bg-gray-900 ${className}`}
      >
        <div className="text-center text-white">
          <div className="mb-4 text-6xl">⚠️</div>
          <h3 className="mb-2 text-lg font-semibold">카메라 연결 실패</h3>
          <p className="mb-2 text-gray-400">카메라 {cameraId}</p>
          <div className="mb-4 space-y-1 text-sm text-red-400">
            <p>• {cameraInfoError}</p>
            <p>• {streamError}</p>
          </div>
          <button
            onClick={reconnectAll}
            className="rounded bg-blue-600 px-4 py-2 transition-colors hover:bg-blue-700"
          >
            전체 다시 연결
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden rounded-lg bg-black ${className}`}
    >
      {/* 카메라 정보 헤더 */}
      <div className="absolute top-0 right-0 left-0 z-10 bg-gradient-to-b from-black/70 to-transparent p-4">
        <div className="flex items-center justify-between text-white">
          <div>
            {cameraInfoLoading ? (
              <div className="animate-pulse">
                <div className="mb-2 h-4 w-32 rounded bg-gray-600"></div>
                <div className="h-3 w-24 rounded bg-gray-700"></div>
              </div>
            ) : camera ? (
              <>
                <h3 className="font-semibold">{camera.name}</h3>
                <p className="text-sm text-gray-300">{camera.location}</p>
              </>
            ) : (
              <>
                <h3 className="font-semibold">카메라 {cameraId}</h3>
                <p className="text-sm text-red-400">정보 로드 실패</p>
              </>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {cameraInfoLoading ? (
              <div className="animate-pulse">
                <div className="h-2 w-2 rounded-full bg-gray-600"></div>
              </div>
            ) : camera ? (
              <>
                <div
                  className={`h-2 w-2 rounded-full ${
                    camera.status === 'active'
                      ? 'bg-green-500'
                      : camera.status === 'inactive'
                        ? 'bg-red-500'
                        : 'bg-yellow-500'
                  }`}
                ></div>
                <span className="text-sm">{camera.status}</span>
              </>
            ) : (
              <>
                <div className="h-2 w-2 rounded-full bg-red-500"></div>
                <span className="text-sm">오프라인</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 스트림 영역 */}
      <div className="relative size-full">
        {streamLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
            <div className="text-center text-white">
              <div className="mb-2 text-4xl">📡</div>
              <p>스트림 연결 중...</p>
            </div>
          </div>
        ) : streamError || !isStreaming ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
            <div className="text-center text-white">
              <div className="mb-4 text-6xl">📷</div>
              <h3 className="mb-2 text-lg font-semibold">스트림 연결 실패</h3>
              <p className="mb-4 text-sm text-red-400">{streamError}</p>
              <button
                onClick={reconnectStream}
                className="rounded bg-blue-600 px-4 py-2 transition-colors hover:bg-blue-700"
              >
                스트림 다시 연결
              </button>
            </div>
          </div>
        ) : (
          /* 스트림 표시 */
          <>
            {streamUrl.includes('.m3u8') || streamUrl.includes('webrtc') ? (
              <video
                ref={videoRef}
                src={streamUrl}
                autoPlay={autoPlay}
                muted
                playsInline
                onError={handleVideoError}
                className="h-full w-full object-contain"
              />
            ) : (
              <Image
                ref={imgRef}
                src={streamUrl}
                alt={`카메라 ${cameraId} 스트림`}
                onError={handleImageError}
                className="h-full w-full object-contain"
                unoptimized={true}
                fill
              />
            )}
          </>
        )}

        {/* PTZ 제어 버튼들 */}
        {showControls && camera?.ptz_enabled && isStreaming && (
          <div className="absolute right-4 bottom-4 z-10">
            <div className="rounded-lg bg-black/70 p-2">
              {/* 상하좌우 제어 */}
              <div className="grid grid-cols-3 gap-1">
                {/* 위쪽 */}
                <div></div>
                <button
                  onMouseDown={() => handlePTZControl('up')}
                  onMouseUp={() => handlePTZStop('up')}
                  onMouseLeave={() => handlePTZStop('up')}
                  className={`rounded p-2 text-white transition-colors ${
                    isPTZActive === 'up'
                      ? 'bg-blue-600'
                      : 'bg-gray-600 hover:bg-gray-500'
                  }`}
                >
                  ↑
                </button>
                <div></div>

                {/* 좌우 */}
                <button
                  onMouseDown={() => handlePTZControl('left')}
                  onMouseUp={() => handlePTZStop('left')}
                  onMouseLeave={() => handlePTZStop('left')}
                  className={`rounded p-2 text-white transition-colors ${
                    isPTZActive === 'left'
                      ? 'bg-blue-600'
                      : 'bg-gray-600 hover:bg-gray-500'
                  }`}
                >
                  ←
                </button>
                <div className="p-2"></div>
                <button
                  onMouseDown={() => handlePTZControl('right')}
                  onMouseUp={() => handlePTZStop('right')}
                  onMouseLeave={() => handlePTZStop('right')}
                  className={`rounded p-2 text-white transition-colors ${
                    isPTZActive === 'right'
                      ? 'bg-blue-600'
                      : 'bg-gray-600 hover:bg-gray-500'
                  }`}
                >
                  →
                </button>

                {/* 아래쪽 */}
                <div></div>
                <button
                  onMouseDown={() => handlePTZControl('down')}
                  onMouseUp={() => handlePTZStop('down')}
                  onMouseLeave={() => handlePTZStop('down')}
                  className={`rounded p-2 text-white transition-colors ${
                    isPTZActive === 'down'
                      ? 'bg-blue-600'
                      : 'bg-gray-600 hover:bg-gray-500'
                  }`}
                >
                  ↓
                </button>
                <div></div>
              </div>

              {/* 줌 제어 */}
              <div className="mt-2 flex space-x-1">
                <button
                  onMouseDown={() => handlePTZControl('zoom_out')}
                  onMouseUp={() => handlePTZStop('zoom_out')}
                  onMouseLeave={() => handlePTZStop('zoom_out')}
                  className={`rounded px-2 py-1 text-xs text-white transition-colors ${
                    isPTZActive === 'zoom_out'
                      ? 'bg-blue-600'
                      : 'bg-gray-600 hover:bg-gray-500'
                  }`}
                >
                  Z-
                </button>
                <button
                  onMouseDown={() => handlePTZControl('zoom_in')}
                  onMouseUp={() => handlePTZStop('zoom_in')}
                  onMouseLeave={() => handlePTZStop('zoom_in')}
                  className={`rounded px-2 py-1 text-xs text-white transition-colors ${
                    isPTZActive === 'zoom_in'
                      ? 'bg-blue-600'
                      : 'bg-gray-600 hover:bg-gray-500'
                  }`}
                >
                  Z+
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 하단 정보 */}
      <div className="absolute right-0 bottom-0 left-0 z-10 bg-gradient-to-t from-black/70 to-transparent p-4">
        <div className="flex items-center justify-between text-sm text-white">
          <div>
            {camera ? <>해상도: {camera.resolution}</> : <>카메라 {cameraId}</>}
          </div>
          <div className="flex items-center space-x-4">
            {camera?.ptz_enabled && (
              <span className="text-green-400">PTZ 지원</span>
            )}
            {cameraInfoError && (
              <button
                onClick={reconnectCameraInfo}
                className="text-xs text-yellow-400 transition-colors hover:text-yellow-300"
                title="카메라 정보 새로고침"
              >
                📋 정보
              </button>
            )}
            {streamError && (
              <button
                onClick={reconnectStream}
                className="text-xs text-red-400 transition-colors hover:text-red-300"
                title="스트림 새로고침"
              >
                📡 스트림
              </button>
            )}
            <button
              onClick={reconnectAll}
              className="text-gray-300 transition-colors hover:text-white"
              title="전체 새로고침"
            >
              🔄
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CameraStream;
