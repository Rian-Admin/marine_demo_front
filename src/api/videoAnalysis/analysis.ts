import { api } from '../axios';
import {
  type NVRConfig,
  type PlaybackSession,
  createPlaybackSessionForDetection as baseCreatePlaybackSession,
} from './videoPlay';

// 분석 관련 타입 정의
export interface Detection {
  detection_id: number;
  detection_time: string;
  bb_count: number;
  camera_id: string;
  thumbnail_url?: string;
}

export interface DetectionsResponse {
  detections: Detection[];
  total_pages: number;
  current_page: number;
  total_records: number;
}

export interface DetectionFilters {
  page?: number;
  per_page?: number;
  sort_by?: string;
  date_from?: string;
  date_to?: string;
}

export interface AnalysisResult {
  success: boolean;
  message: string;
  data?: DetectionsResponse;
}

// 기본 NVR 설정 (분석용)
const DEFAULT_ANALYSIS_NVR_CONFIG = {
  ip: '192.168.219.102',
  port: 80,
  username: 'admin',
  password: 'admin1234',
};

// 감지 기록 조회 (분석 페이지 전용)
export const fetchDetectionsForAnalysis = async (
  filters: DetectionFilters = {}
): Promise<DetectionsResponse> => {
  try {
    const params = {
      page: 1,
      per_page: 20,
      sort_by: 'date_desc',
      ...filters,
    };

    const response = await api.get<DetectionsResponse>(
      '/api/detections/filtered/',
      { params }
    );

    return response;
  } catch (error) {
    console.error('Failed to fetch detections for analysis:', error);
    throw error;
  }
};

// 감지 기록의 영상 재생을 위한 세션 생성 (분석 페이지 전용)
export const createPlaybackSessionForAnalysis = async (
  detection: Detection,
  customNvrConfig?: Partial<NVRConfig>
): Promise<PlaybackSession> => {
  try {
    const nvrConfig = {
      ...DEFAULT_ANALYSIS_NVR_CONFIG,
      ...customNvrConfig,
    };

    const session = await baseCreatePlaybackSession(detection, nvrConfig);
    return session;
  } catch (error) {
    console.error('Failed to create playback session for analysis:', error);
    throw error;
  }
};

// 날짜/시간 포맷팅 (한국 시간대 전용)
export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

// 날짜 범위 검증
export const validateDateRange = (
  dateFrom: string,
  dateTo: string
): boolean => {
  if (!dateFrom || !dateTo) return true; // 빈 값은 허용

  const fromDate = new Date(dateFrom);
  const toDate = new Date(dateTo);
  const now = new Date();

  // 시작일이 종료일보다 늦으면 안됨
  if (fromDate > toDate) return false;

  // 미래 날짜는 허용하지 않음
  if (fromDate > now || toDate > now) return false;

  return true;
};

// 기본 날짜 필터 생성 (최근 1개월)
export const getDefaultDateFilter = () => {
  const dateTo = new Date().toISOString().split('T')[0];
  const dateFrom = new Date();
  dateFrom.setMonth(dateFrom.getMonth() - 1);

  return {
    dateFrom: dateFrom.toISOString().split('T')[0],
    dateTo,
  };
};

// 감지 기록 통계 계산
export const calculateDetectionStats = (detections: Detection[]) => {
  if (!detections.length) {
    return {
      totalDetections: 0,
      averageBoundingBoxes: 0,
      mostActiveCameraId: null,
      detectionsByHour: {},
    };
  }

  const totalBoundingBoxes = detections.reduce(
    (sum, detection) => sum + detection.bb_count,
    0
  );
  const averageBoundingBoxes =
    Math.round((totalBoundingBoxes / detections.length) * 100) / 100;

  // 가장 활성도가 높은 카메라 찾기
  const cameraStats: Record<string, number> = {};
  detections.forEach((detection) => {
    cameraStats[detection.camera_id] =
      (cameraStats[detection.camera_id] || 0) + 1;
  });

  const mostActiveCameraId =
    Object.entries(cameraStats).sort(([, a], [, b]) => b - a)[0]?.[0] || null;

  // 시간별 감지 통계
  const detectionsByHour: Record<number, number> = {};
  detections.forEach((detection) => {
    const hour = new Date(detection.detection_time).getHours();
    detectionsByHour[hour] = (detectionsByHour[hour] || 0) + 1;
  });

  return {
    totalDetections: detections.length,
    averageBoundingBoxes,
    mostActiveCameraId,
    detectionsByHour,
  };
};

// 페이지네이션 헬퍼
export const generatePageNumbers = (
  currentPage: number,
  totalPages: number,
  maxVisiblePages: number = 5
): number[] => {
  const pages = [];
  const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }
  return pages;
};
