import { api } from '../axios';

// 타입 정의
export interface NVRConfig {
  ip: string;
  port: number;
  username: string;
  password: string;
  channel: number;
  start_time: string;
  end_time?: string;
}

export interface PlaybackSession {
  id: string;
  url: string;
  channel: number;
  start_time: string;
  status: 'active' | 'stopped';
}

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

// NVR 재생 세션 시작
export const startNVRPlayback = async (
  config: NVRConfig
): Promise<PlaybackSession> => {
  try {
    const response = await api.post<NVRConfig, PlaybackSession>(
      '/api/nvr/playback/start',
      config
    );
    return response;
  } catch (error) {
    console.error('Failed to start NVR playback:', error);
    throw error;
  }
};

// NVR 재생 세션 중지
export const stopNVRPlayback = async (sessionId: string): Promise<void> => {
  try {
    await api.post(`/api/nvr/playback/stop/${sessionId}`);
  } catch (error) {
    console.error('Failed to stop NVR playback:', error);
    throw error;
  }
};

// 감지 기록 조회 (필터링 포함)
export const fetchDetections = async (
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
    console.error('Failed to fetch detections:', error);
    throw error;
  }
};

// 특정 감지 기록의 영상 재생을 위한 세션 생성
export const createPlaybackSessionForDetection = async (
  detection: Detection,
  nvrConfig: Partial<NVRConfig> = {}
): Promise<PlaybackSession> => {
  try {
    const playbackData = {
      channel: parseInt(detection.camera_id) || 5,
      start_time: new Date(detection.detection_time).toISOString(),
      ip: nvrConfig.ip || '192.168.219.102',
      port: nvrConfig.port || 80,
      username: nvrConfig.username || 'admin',
      password: nvrConfig.password || 'admin1234',
    };

    const response = await api.post<typeof playbackData, PlaybackSession>(
      '/api/nvr/playback/start',
      playbackData
    );

    return response;
  } catch (error) {
    console.error('Failed to create playback session for detection:', error);
    throw error;
  }
};

// 날짜/시간 포맷팅 유틸리티 함수
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

// 현재 날짜/시간을 input datetime-local 형식으로 반환
export const getCurrentDateTime = (): string => {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  const localTime = new Date(now.getTime() - offset);
  return localTime.toISOString().slice(0, 16);
};

// 기본 NVR 설정 반환
export const getDefaultNVRConfig = (): NVRConfig => ({
  ip: '192.168.219.102',
  port: 80,
  username: 'admin',
  password: 'admin1234',
  channel: 5,
  start_time: getCurrentDateTime(),
  end_time: '',
});
