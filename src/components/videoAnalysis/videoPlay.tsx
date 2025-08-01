import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';

import {
  type NVRConfig,
  type PlaybackSession,
  getCurrentDateTime,
  getDefaultNVRConfig,
  startNVRPlayback,
  stopNVRPlayback,
} from '@/api/videoAnalysis/videoPlay';

const VideoPlay = () => {
  // 상태 관리
  const [config, setConfig] = useState<NVRConfig>(getDefaultNVRConfig());

  const [session, setSession] = useState<PlaybackSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);

  // 재생 세션 시작
  const startPlayback = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await startNVRPlayback(config);
      setSession(response);
      setIsPlaying(true);

      // 실제 구현에서는 스트리밍 URL을 받아서 비디오 요소에 설정
      if (videoRef.current) {
        videoRef.current.src = response.url;
        videoRef.current.play();
      }

      // 성공 메시지 표시
      toast.success('영상 재생을 시작했습니다.');
    } catch (err) {
      // interceptor에서 URL별 맞춤 에러 토스트가 표시됨
      console.error('Failed to start playback:', err);
      setError('영상 재생을 시작할 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 재생 중지
  const stopPlayback = async () => {
    if (!session) return;

    try {
      await stopNVRPlayback(session.id);
      setSession(null);
      setIsPlaying(false);

      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.src = '';
      }

      // 성공 메시지 표시
      toast.info('영상 재생을 중지했습니다.');
    } catch (err) {
      // interceptor에서 에러 토스트가 표시됨
      console.error('Failed to stop playback:', err);
      setError('영상 재생을 중지할 수 없습니다.');
    }
  };

  // 컴포넌트 언마운트 시 재생 세션 정리
  useEffect(() => {
    return () => {
      if (session) {
        stopPlayback();
      }
    };
  }, [session]);

  return (
    <div className="flex h-full flex-col p-6">
      {/* 헤더 */}
      <div className="mb-6 flex-shrink-0">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">
          영상 재생 시스템
        </h1>
        <p className="text-gray-600">
          NVR 시스템에서 특정 시간대의 영상을 재생합니다.
        </p>
      </div>

      <div className="flex min-h-0 flex-1 gap-6">
        {/* 설정 패널 */}
        <div className="w-80 flex-shrink-0">
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              재생 설정
            </h2>

            {/* NVR 연결 정보 */}
            <div className="mb-6 space-y-4">
              <h3 className="text-sm font-medium text-gray-700">
                NVR 연결 정보
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">
                    IP 주소
                  </label>
                  <input
                    type="text"
                    value={config.ip}
                    onChange={(e) =>
                      setConfig({ ...config, ip: e.target.value })
                    }
                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    placeholder="192.168.1.100"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">
                    포트
                  </label>
                  <input
                    type="number"
                    value={config.port}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        port: parseInt(e.target.value) || 80,
                      })
                    }
                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">
                    사용자명
                  </label>
                  <input
                    type="text"
                    value={config.username}
                    onChange={(e) =>
                      setConfig({ ...config, username: e.target.value })
                    }
                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">
                    비밀번호
                  </label>
                  <input
                    type="password"
                    value={config.password}
                    onChange={(e) =>
                      setConfig({ ...config, password: e.target.value })
                    }
                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 재생 설정 */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-700">재생 설정</h3>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">
                  채널 번호
                </label>
                <select
                  value={config.channel}
                  onChange={(e) =>
                    setConfig({ ...config, channel: parseInt(e.target.value) })
                  }
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((ch) => (
                    <option key={ch} value={ch}>
                      채널 {ch}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">
                  시작 시간
                </label>
                <input
                  type="datetime-local"
                  value={config.start_time}
                  onChange={(e) =>
                    setConfig({ ...config, start_time: e.target.value })
                  }
                  max={getCurrentDateTime()}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">
                  종료 시간 (선택사항)
                </label>
                <input
                  type="datetime-local"
                  value={config.end_time}
                  onChange={(e) =>
                    setConfig({ ...config, end_time: e.target.value })
                  }
                  min={config.start_time}
                  max={getCurrentDateTime()}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* 컨트롤 버튼 */}
            <div className="mt-6 space-y-3">
              {!isPlaying ? (
                <button
                  onClick={startPlayback}
                  disabled={loading}
                  className="flex w-full items-center justify-center rounded-md bg-blue-600 px-4 py-3 text-white transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      연결 중...
                    </>
                  ) : (
                    <>
                      <svg
                        className="mr-2 h-5 w-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                          clipRule="evenodd"
                        />
                      </svg>
                      재생 시작
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={stopPlayback}
                  className="flex w-full items-center justify-center rounded-md bg-red-600 px-4 py-3 text-white transition-colors hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none"
                >
                  <svg
                    className="mr-2 h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z"
                      clipRule="evenodd"
                    />
                  </svg>
                  재생 중지
                </button>
              )}
            </div>

            {/* 연결 상태 */}
            {session && (
              <div className="mt-4 rounded-md bg-green-50 p-3">
                <div className="flex items-center">
                  <svg
                    className="h-4 w-4 text-green-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="ml-2 text-sm font-medium text-green-800">
                    연결됨
                  </span>
                </div>
                <p className="mt-1 text-xs text-green-700">
                  세션 ID: {session.id}
                </p>
              </div>
            )}

            {/* 에러 메시지 */}
            {error && (
              <div className="mt-4 rounded-md bg-red-50 p-3">
                <div className="flex items-center">
                  <svg
                    className="h-4 w-4 text-red-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="ml-2 text-sm font-medium text-red-800">
                    오류
                  </span>
                </div>
                <p className="mt-1 text-xs text-red-700">{error}</p>
              </div>
            )}
          </div>
        </div>

        {/* 비디오 플레이어 */}
        <div className="min-w-0 flex-1">
          <div className="flex h-full flex-col rounded-lg bg-white shadow">
            <div className="border-b border-gray-200 p-4">
              <h2 className="text-lg font-semibold text-gray-900">영상 화면</h2>
              {session && (
                <p className="mt-1 text-sm text-gray-600">
                  채널 {config.channel} •{' '}
                  {new Date(config.start_time).toLocaleString('ko-KR')}
                </p>
              )}
            </div>

            <div className="flex-1 p-4">
              <div className="flex h-full items-center justify-center rounded-lg bg-gray-900">
                {session ? (
                  <video
                    ref={videoRef}
                    controls
                    className="h-full max-h-full w-full max-w-full object-contain"
                    onError={() => setError('영상을 불러올 수 없습니다.')}
                  >
                    영상을 지원하지 않는 브라우저입니다.
                  </video>
                ) : (
                  <div className="text-center">
                    <svg
                      className="mx-auto h-16 w-16 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                    <p className="mt-4 text-gray-500">
                      {loading
                        ? '영상을 불러오는 중...'
                        : '재생할 영상이 없습니다'}
                    </p>
                    {!loading && (
                      <p className="mt-2 text-sm text-gray-400">
                        좌측 설정 패널에서 재생 설정을 확인하고 재생 시작 버튼을
                        클릭하세요.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlay;
