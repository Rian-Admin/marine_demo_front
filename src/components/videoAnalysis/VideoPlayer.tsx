import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';

// 재생 세션 타입
interface PlaybackSession {
  id: string;
  url: string;
  channel: number;
  start_time: string;
  status: 'active' | 'stopped';
}

interface VideoPlayerProps {
  session: PlaybackSession;
  onClose: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ session, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (videoRef.current && session.url) {
      videoRef.current.src = session.url;
      videoRef.current.play().catch((err) => {
        console.error('Video play error:', err);
        setError('영상 재생 중 오류가 발생했습니다.');
        toast.error('영상 재생 중 오류가 발생했습니다.');
      });
    }
  }, [session]);

  // ESC 키로 닫기
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // 전체화면 토글
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // 전체화면 상태 감지
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () =>
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div className="bg-opacity-75 fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="relative flex h-full w-full max-w-6xl flex-col bg-white md:h-5/6 md:rounded-lg">
        {/* 헤더 */}
        <div className="flex items-center justify-between border-b border-gray-200 p-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">영상 재생</h2>
            <p className="text-sm text-gray-600">
              채널 {session.channel} •{' '}
              {new Date(session.start_time).toLocaleString('ko-KR')}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {/* 전체화면 버튼 */}
            <button
              onClick={toggleFullscreen}
              className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              title="전체화면"
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
                  d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                />
              </svg>
            </button>

            {/* 닫기 버튼 */}
            <button
              onClick={onClose}
              className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              title="닫기 (ESC)"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* 비디오 영역 */}
        <div className="flex-1 p-4">
          <div className="flex h-full items-center justify-center rounded-lg bg-gray-900">
            {error ? (
              <div className="text-center text-white">
                <svg
                  className="mx-auto mb-4 h-16 w-16 text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-lg font-medium">{error}</p>
                <p className="mt-2 text-sm text-gray-400">
                  네트워크 연결이나 영상 파일을 확인해주세요.
                </p>
              </div>
            ) : (
              <video
                ref={videoRef}
                controls
                autoPlay
                className="h-full max-h-full w-full max-w-full object-contain"
                onError={() => {
                  setError('영상을 불러올 수 없습니다.');
                  toast.error('영상을 불러올 수 없습니다.');
                }}
                onLoadStart={() => setError(null)}
              >
                <source src={session.url} type="video/mp4" />
                <source src={session.url} type="video/webm" />
                <source src={session.url} type="video/ogg" />
                영상을 지원하지 않는 브라우저입니다.
              </video>
            )}
          </div>
        </div>

        {/* 하단 정보 */}
        <div className="border-t border-gray-200 bg-gray-50 p-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-4">
              <span>세션 ID: {session.id}</span>
              <span className="flex items-center">
                <div className="mr-1 h-2 w-2 rounded-full bg-green-400"></div>
                재생 중
              </span>
            </div>

            <div className="text-xs text-gray-500">ESC 키를 눌러 닫기</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
