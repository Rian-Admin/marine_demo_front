import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import {
  type Detection,
  createPlaybackSessionForAnalysis,
  fetchDetectionsForAnalysis,
  formatDateTime,
  generatePageNumbers,
  getDefaultDateFilter,
} from '@/api/videoAnalysis/analysis';
import {
  type PlaybackSession,
  stopNVRPlayback,
} from '@/api/videoAnalysis/videoPlay';

import VideoPlayer from './VideoPlayer';

/**
 * 동영상 분석 페이지
 * 동영상 분석 탭 (감지 기록 분석)
 */

const Analysis = () => {
  // 상태 관리
  const [detections, setDetections] = useState<Detection[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDetections, setTotalDetections] = useState(0);

  // 필터 상태
  const { dateFrom: defaultDateFrom, dateTo: defaultDateTo } =
    getDefaultDateFilter();
  const [dateFrom, setDateFrom] = useState(defaultDateFrom);
  const [dateTo, setDateTo] = useState(defaultDateTo);

  // 비디오 플레이어 상태
  const [loadingDetectionId, setLoadingDetectionId] = useState<number | null>(
    null
  );
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [activeSession, setActiveSession] = useState<PlaybackSession | null>(
    null
  );

  // 감지 기록 조회 함수
  const fetchDetections = async (pageNum = 1, showSuccessToast = false) => {
    setLoading(true);
    setError(null);

    try {
      const filters = {
        page: pageNum,
        per_page: 20,
        sort_by: 'date_desc',
        ...(dateFrom && { date_from: dateFrom }),
        ...(dateTo && { date_to: dateTo }),
      };

      const data = await fetchDetectionsForAnalysis(filters);

      if (data.detections) {
        setDetections(data.detections);
        setTotalPages(data.total_pages || 1);
        setPage(data.current_page || 1);
        setTotalDetections(data.total_records || 0);

        // 성공 토스트 표시 (첫 로드나 필터 적용 시에만)
        if (showSuccessToast) {
          toast.success(
            `${data.total_records || 0}개의 감지 기록을 불러왔습니다.`
          );
        }
      }
    } catch (err) {
      // interceptor에서 URL별 맞춤 에러 토스트가 표시됨
      console.error('Error fetching detections:', err);
      // UI에는 간단한 에러 상태만 표시
      setError('데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 초기 데이터 로드
  useEffect(() => {
    fetchDetections(1, true);
  }, []);

  // 영상 재생 핸들러
  const handlePlayVideo = async (detection: Detection) => {
    setLoadingDetectionId(detection.detection_id);
    try {
      const nvrConfig = {
        ip: '192.168.219.102',
        port: 80,
        username: 'admin',
        password: 'admin1234',
      };

      // API 호출하여 재생 세션 생성
      const session = await createPlaybackSessionForAnalysis(
        detection,
        nvrConfig
      );

      setActiveSession(session);
      setVideoModalOpen(true);

      // 성공 메시지 표시
      toast.success(
        `감지 시간: ${formatDateTime(detection.detection_time)} 영상을 재생합니다.`
      );
    } catch (error) {
      // interceptor에서 URL별 맞춤 에러 토스트가 표시되므로 여기서는 로깅만
      console.error('Video playback error:', error);
    } finally {
      setLoadingDetectionId(null);
    }
  };

  // 영상 재생 모달 닫기
  const handleCloseVideo = async () => {
    if (activeSession) {
      try {
        await stopNVRPlayback(activeSession.id);
        toast.info('영상 재생을 중지했습니다.');
      } catch (error) {
        // interceptor에서 에러 토스트가 표시됨
        console.error('Error stopping playback:', error);
      }
    }
    setVideoModalOpen(false);
    setActiveSession(null);
  };

  return (
    <div className="flex h-full flex-col p-6">
      {/* 헤더 */}
      <div className="mb-6 flex-shrink-0">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">
          감지 기록 분석
        </h1>
      </div>

      {/* 필터 섹션 */}
      <div className="mb-6 flex-shrink-0 rounded-lg bg-white p-4 shadow">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              시작일
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              종료일
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => fetchDetections(1, true)}
              className="flex w-full items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-white transition-colors duration-200 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
            >
              <svg
                className="mr-2 h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
              필터 적용
            </button>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => fetchDetections(page)}
              className="flex w-full items-center justify-center rounded-md bg-gray-600 px-4 py-2 text-white transition-colors duration-200 hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:outline-none"
            >
              <svg
                className="mr-2 h-4 w-4"
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
              새로고침
            </button>
          </div>
        </div>
      </div>

      {/* 통계 정보 */}
      <div className="mb-6 flex-shrink-0 rounded-lg bg-white p-4 shadow">
        <p className="text-gray-700">
          총{' '}
          <span className="font-semibold text-blue-600">{totalDetections}</span>
          개의 감지 기록
        </p>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="mb-6 flex-shrink-0 rounded-md border border-red-200 bg-red-50 p-4">
          <div className="flex">
            <svg
              className="h-5 w-5 text-red-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <span className="ml-2 text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* 감지 기록 테이블 */}
      <div className="flex min-h-0 flex-1 flex-col rounded-lg bg-white shadow">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            <div
              className="flex-1 overflow-auto"
              style={{ maxHeight: 'calc(100vh - 400px)' }}
            >
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="sticky top-0 z-10 bg-blue-600">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-white uppercase">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-white uppercase">
                      감지 시간
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-white uppercase">
                      바운딩 박스 수
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-white uppercase">
                      카메라 ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-white uppercase">
                      영상보기
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {detections.length > 0 ? (
                    detections.map((detection) => (
                      <tr
                        key={detection.detection_id}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                          {detection.detection_id}
                        </td>
                        <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                          {formatDateTime(detection.detection_time)}
                        </td>
                        <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                          {detection.bb_count}
                        </td>
                        <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                          {detection.camera_id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div
                            className="relative h-14 w-24 cursor-pointer overflow-hidden rounded border-2 border-transparent bg-gray-800 transition-all duration-200 hover:border-blue-500"
                            onClick={() =>
                              !loadingDetectionId && handlePlayVideo(detection)
                            }
                            title={`${formatDateTime(detection.detection_time)} 영상 재생`}
                          >
                            {detection.thumbnail_url ? (
                              <img
                                src={detection.thumbnail_url}
                                alt={`Detection ${detection.detection_id}`}
                                className="h-full w-full object-cover opacity-70"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display =
                                    'none';
                                }}
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center">
                                <svg
                                  className="h-8 w-8 text-gray-600"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M2 6a2 2 0 012-2h6l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                                </svg>
                              </div>
                            )}

                            <div className="bg-opacity-50 absolute inset-0 flex items-center justify-center bg-black opacity-80 transition-opacity hover:opacity-100">
                              {loadingDetectionId === detection.detection_id ? (
                                <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-white"></div>
                              ) : (
                                <svg
                                  className="h-9 w-9 text-white"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-12 text-center text-gray-500"
                      >
                        감지 기록이 없습니다.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="flex flex-shrink-0 items-center justify-between border-t border-gray-200 bg-white px-4 py-3">
                <div className="flex flex-1 justify-between sm:hidden">
                  <button
                    onClick={() => fetchDetections(page - 1)}
                    disabled={page <= 1}
                    className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    이전
                  </button>
                  <button
                    onClick={() => fetchDetections(page + 1)}
                    disabled={page >= totalPages}
                    className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    다음
                  </button>
                </div>
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      총 <span className="font-medium">{totalDetections}</span>
                      개 중{' '}
                      <span className="font-medium">{(page - 1) * 20 + 1}</span>
                      -
                      <span className="font-medium">
                        {Math.min(page * 20, totalDetections)}
                      </span>
                      개 표시
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex -space-x-px rounded-md shadow-sm">
                      <button
                        onClick={() => fetchDetections(1)}
                        disabled={page <= 1}
                        className="relative inline-flex items-center rounded-l-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        처음
                      </button>
                      <button
                        onClick={() => fetchDetections(page - 1)}
                        disabled={page <= 1}
                        className="relative inline-flex items-center border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        이전
                      </button>

                      {generatePageNumbers(page, totalPages).map((pageNum) => (
                        <button
                          key={pageNum}
                          onClick={() => fetchDetections(pageNum)}
                          className={`relative inline-flex items-center border px-4 py-2 text-sm font-medium ${
                            page === pageNum
                              ? 'z-10 border-blue-500 bg-blue-50 text-blue-600'
                              : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      ))}

                      <button
                        onClick={() => fetchDetections(page + 1)}
                        disabled={page >= totalPages}
                        className="relative inline-flex items-center border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        다음
                      </button>
                      <button
                        onClick={() => fetchDetections(totalPages)}
                        disabled={page >= totalPages}
                        className="relative inline-flex items-center rounded-r-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        마지막
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* 비디오 재생 모달 */}
      {videoModalOpen && activeSession && (
        <VideoPlayer session={activeSession} onClose={handleCloseVideo} />
      )}
    </div>
  );
};

export default Analysis;
