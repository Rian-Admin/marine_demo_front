import { extractTimeFromTimestamp } from '@/utils/extractTimeFromTimestamp';

import { api } from '@/api/axios';

// API 응답 타입 정의
interface CameraApiResponse {
  status: string;
  cameras: CameraItem[];
}

interface CameraDetailApiResponse {
  status: string;
  camera: CameraItem;
}

interface PresetApiResponse {
  status: string;
  presets: PresetItem[];
}

interface DetectionApiResponse {
  status: string;
  detections: DetectionItem[];
  total: number;
  page: number;
  per_page: number;
}

interface PTZControlApiResponse {
  status: string;
  message: string;
}

// 카메라 데이터 타입 정의
export interface CameraItem {
  id: number;
  name: string;
  location: string;
  status: 'active' | 'inactive' | 'maintenance';
  stream_url: string;
  ptz_enabled: boolean;
  resolution: string;
  last_seen: string;
}

// PTZ 제어 관련 타입
export interface PTZDirection {
  direction:
    | 'up'
    | 'down'
    | 'left'
    | 'right'
    | 'zoom_in'
    | 'zoom_out'
    | 'focus_near'
    | 'focus_far';
}

export interface PTZControlData {
  camera_id: number;
  direction: PTZDirection['direction'];
  is_continuous?: boolean;
  speed?: number;
}

export interface PTZStopData {
  camera_id: number;
  direction: PTZDirection['direction'];
}

// 프리셋 관련 타입
export interface PresetItem {
  id: number;
  name: string;
  pan: number;
  tilt: number;
  zoom: number;
  created_at: string;
}

export interface PresetCreateData {
  name: string;
  pan: number;
  tilt: number;
  zoom: number;
}

// 카메라 설정 타입
export interface CameraSettings {
  name?: string;
  location?: string;
  resolution?: string;
  frame_rate?: number;
  quality?: number;
  night_mode?: boolean;
  motion_detection?: boolean;
}

// 감지 결과 타입
export interface DetectionItem {
  id: number;
  camera_id: number;
  species: string;
  confidence: number;
  bounding_box: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  timestamp: string;
  image_url: string;
}

// 감지 결과 조회 파라미터
export interface DetectionParams {
  date_from?: string;
  date_to?: string;
  species?: string;
  confidence_min?: number;
  page?: number;
  per_page?: number;
  sort_by?: 'timestamp_asc' | 'timestamp_desc' | 'confidence_desc';
}

// 바운딩 박스 상세 정보 타입
export interface BoundingBoxInfo {
  record_id: number;
  class_name: string;
  bb_left: number;
  bb_right: number;
  bb_top: number;
  bb_bottom: number;
  confidence?: number;
}

// Detection 상세 정보 API 응답 타입
interface DetectionDetailApiResponse {
  status: string;
  bb_info: BoundingBoxInfo[];
}

/**
 * 스트림 URL 생성 함수
 */
export const getStreamUrl = (id: number): string => {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  return `${baseUrl}/camera/${id}/`;
};

/**
 * 카메라 목록을 가져오는 API 함수
 */
export const getCameras = async (): Promise<CameraItem[]> => {
  try {
    const response = (await api.get('/api/cameras/')) as CameraApiResponse;

    if (response && response.status === 'success') {
      console.log('카메라 목록 가져오기 성공:', response.cameras);
      return response.cameras;
    }

    // API 응답이 없는 경우 기본값 반환
    return [];
  } catch (error) {
    console.error('카메라 목록 가져오기 오류:', error);
    return [];
  }
};

/**
 * 특정 카메라의 상세 정보를 가져오는 API 함수
 */
export const getCameraById = async (id: number): Promise<CameraItem | null> => {
  try {
    const response = (await api.get(`/camera/${id}/`, {
      timeout: 600000,
    })) as CameraDetailApiResponse;

    if (response && response.status === 'success') {
      console.log('카메라 상세 정보 가져오기 성공:', response.camera);
      return response.camera;
    }

    return null;
  } catch (error) {
    console.error(`카메라 ${id} 상세 정보 가져오기 오류:`, error);
    return null;
  }
};

/**
 * 카메라 설정 업데이트 API 함수
 */
export const updateCameraSettings = async (
  id: number,
  settings: CameraSettings
): Promise<boolean> => {
  try {
    const response = await api.put(`/api/cameras/${id}/settings/`, settings);

    if (response) {
      console.log('카메라 설정 업데이트 성공');
      return true;
    }

    return false;
  } catch (error) {
    console.error(`카메라 ${id} 설정 업데이트 오류:`, error);
    return false;
  }
};

/**
 * PTZ 제어 시작 API 함수
 */
export const controlPTZ = async (
  cameraId: number,
  direction: PTZDirection['direction'],
  isContinuous: boolean = true,
  speed: number = 0.7
): Promise<boolean> => {
  try {
    const response = (await api.post('/api/ptz/control/', {
      camera_id: cameraId,
      direction: direction,
      is_continuous: isContinuous,
      speed: speed,
    })) as PTZControlApiResponse;

    if (response && response.status === 'success') {
      console.log('PTZ 제어 시작 성공:', response.message);
      return true;
    }

    return false;
  } catch (error) {
    console.error(`카메라 ${cameraId} PTZ 제어 시작 오류:`, error);
    return false;
  }
};

/**
 * PTZ 제어 중지 API 함수
 */
export const stopPTZ = async (
  cameraId: number,
  direction: PTZDirection['direction']
): Promise<boolean> => {
  try {
    const response = (await api.post('/api/ptz/stop/', {
      camera_id: cameraId,
      direction: direction,
    })) as PTZControlApiResponse;

    if (response && response.status === 'success') {
      console.log('PTZ 제어 중지 성공:', response.message);
      return true;
    }

    return false;
  } catch (error) {
    console.error(`카메라 ${cameraId} PTZ 제어 중지 오류:`, error);
    return false;
  }
};

/**
 * PTZ 프리셋 목록을 가져오는 API 함수
 */
export const getPresets = async (id: number): Promise<PresetItem[]> => {
  try {
    const response = (await api.get(
      `/api/cameras/${id}/presets/`
    )) as PresetApiResponse;

    if (response && response.status === 'success') {
      console.log('프리셋 목록 가져오기 성공:', response.presets);
      return response.presets;
    }

    return [];
  } catch (error) {
    console.error(`카메라 ${id} 프리셋 목록 가져오기 오류:`, error);
    return [];
  }
};

/**
 * PTZ 프리셋 저장 API 함수
 */
export const savePreset = async (
  id: number,
  preset: PresetCreateData
): Promise<boolean> => {
  try {
    const response = await api.post(`/api/cameras/${id}/presets/`, preset);

    if (response) {
      console.log('프리셋 저장 성공');
      return true;
    }

    return false;
  } catch (error) {
    console.error(`카메라 ${id} 프리셋 저장 오류:`, error);
    return false;
  }
};

/**
 * PTZ 프리셋으로 이동 API 함수
 */
export const moveToPreset = async (
  id: number,
  presetId: number
): Promise<boolean> => {
  try {
    const response = await api.post(
      `/api/cameras/${id}/presets/${presetId}/move/`
    );

    if (response) {
      console.log('프리셋 이동 성공');
      return true;
    }

    return false;
  } catch (error) {
    console.error(`카메라 ${id} 프리셋 ${presetId}로 이동 오류:`, error);
    return false;
  }
};

/**
 * PTZ 프리셋 삭제 API 함수
 */
export const deletePreset = async (
  id: number,
  presetId: number
): Promise<boolean> => {
  try {
    await api.delete(`/api/cameras/${id}/presets/${presetId}/`);

    console.log('프리셋 삭제 성공');
    return true;
  } catch (error) {
    console.error(`카메라 ${id} 프리셋 ${presetId} 삭제 오류:`, error);
    return false;
  }
};

/**
 * 특정 카메라의 감지 결과를 가져오는 API 함수
 */
export const getCameraDetections = async (
  cameraId: number,
  params?: DetectionParams
): Promise<DetectionItem[]> => {
  try {
    const response = (await api.get(`/cameras/${cameraId}/detections`, {
      params,
    })) as DetectionApiResponse;

    if (response && response.status === 'success') {
      console.log('카메라 감지 결과 가져오기 성공:', response.detections);
      return response.detections;
    }

    return [];
  } catch (error) {
    console.error(`카메라 ${cameraId} 감지 결과 가져오기 오류:`, error);
    return [];
  }
};

/**
 * 탐지기록을 가져오는 API 함수 (재시도 로직 포함)
 */
export const fetchDetectionsFiltered = async (params?: {
  per_page?: number;
  sort_by?: string;
  date_from?: string;
  date_to?: string;
}): Promise<ApiDetectionItem[]> => {
  const maxRetries = 3;
  let retries = 0;
  let response;

  // 기본 파라미터 설정
  const defaultParams = {
    per_page: 20,
    sort_by: 'date_desc',
    ...params,
  };

  // 쿼리 문자열 생성
  const queryParams = new URLSearchParams();
  Object.entries(defaultParams).forEach(([key, value]) => {
    if (value !== undefined) {
      queryParams.append(key, value.toString());
    }
  });

  while (retries < maxRetries) {
    try {
      response = (await api.get(
        `/api/detections/filtered/?${queryParams.toString()}`,
        {
          timeout: 30000, // 30초 타임아웃 설정 (LTE 환경 고려)
        }
      )) as DetectionApiResponse;
      break; // 성공하면 루프 종료
    } catch (retryError) {
      retries++;
      console.warn(
        `로그 데이터 가져오기 재시도 (${retries}/${maxRetries})`,
        retryError
      );
      if (retries >= maxRetries) {
        console.error('최대 재시도 횟수 초과:', retryError);
        throw retryError;
      }
      await new Promise((r) => setTimeout(r, 2000)); // 2초 후 재시도 (LTE 환경 고려)
    }
  }

  // 응답 처리
  if (response && response.status === 'success' && response.detections) {
    // detection_time에서 시간만 추출해서 반환
    const processedDetections = response.detections.map((detection) => {
      const apiDetection = detection as ApiDetectionItem;
      return {
        ...apiDetection,
        timestamp: extractTimeFromTimestamp(
          apiDetection.timestamp || apiDetection.detection_time || ''
        ),
      };
    });
    return processedDetections;
  }

  return [];
};

/**
 * Detection ID의 바운딩 박스 상세정보를 가져오는 API 함수 (재시도 로직 포함)
 */
export const getDetectionBoundingBoxInfo = async (
  detectionId: number
): Promise<BoundingBoxInfo[]> => {
  const maxRetries = 3;
  let retries = 0;
  let response;

  while (retries < maxRetries) {
    try {
      response = (await api.get(`/api/detection/bb-info/${detectionId}/`, {
        timeout: 20000, // 20초 타임아웃 (상세정보는 더 오래 걸릴 수 있음)
      })) as DetectionDetailApiResponse;
      break; // 성공하면 루프 종료
    } catch (retryError) {
      retries++;
      console.warn(
        `바운딩 박스 정보 가져오기 재시도 (${retries}/${maxRetries}) - Detection ID: ${detectionId}`,
        retryError
      );
      if (retries >= maxRetries) {
        console.error(
          `Detection ID ${detectionId}의 바운딩 박스 정보 가져오기 최대 재시도 초과:`,
          retryError
        );
        throw retryError;
      }
      await new Promise((r) => setTimeout(r, 2000)); // 2초 후 재시도
    }
  }

  // 응답 처리
  if (response && response.status === 'success' && response.bb_info) {
    return response.bb_info;
  }

  console.warn(`Detection ID ${detectionId}의 바운딩 박스 정보가 없습니다.`);
  return [];
};

// API 응답에서 실제로 사용되는 Detection 타입 (detection_id 포함)
export interface ApiDetectionItem {
  detection_id?: number;
  id?: number;
  camera_id: number;
  species?: string;
  confidence?: number;
  bounding_box?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  timestamp?: string;
  image_url?: string;
  bb_count?: number;
  detection_time?: string;
}

// 통합된 탐지 정보 타입 (DetectionItem + BoundingBoxInfo)
export interface DetectionWithBboxInfo extends ApiDetectionItem {
  bbox_info: BoundingBoxInfo[];
}

/**
 * 탐지기록과 바운딩박스 정보를 통합해서 가져오는 API 함수
 */
export const fetchDetectionsWithBboxInfo = async (params?: {
  per_page?: number;
  sort_by?: string;
  date_from?: string;
  date_to?: string;
}): Promise<DetectionWithBboxInfo[]> => {
  try {
    // 1. 탐지기록 가져오기
    const detections = await fetchDetectionsFiltered(params);

    if (detections.length === 0) {
      console.log('탐지기록이 없습니다.');
      return [];
    }

    // 2. 각 탐지기록의 bbox 정보 가져오기 (병렬 처리)
    const detectionsWithBboxInfo: DetectionWithBboxInfo[] =
      await Promise.allSettled(
        detections.map(async (detection: ApiDetectionItem) => {
          try {
            // API에서는 detection_id를 사용하므로 이를 우선시
            const detectionId = detection.detection_id || detection.id;

            if (!detectionId) {
              console.error('Detection ID가 없습니다:', detection);
              throw new Error('Detection ID가 없습니다');
            }

            const bboxInfo = await getDetectionBoundingBoxInfo(detectionId);
            return {
              ...detection,
              bbox_info: bboxInfo,
            } as DetectionWithBboxInfo;
          } catch (error) {
            const detectionId =
              detection.detection_id || detection.id || 'unknown';
            console.error(
              `Detection ID ${detectionId}의 bbox 정보 가져오기 실패:`,
              error
            );
            return {
              ...detection,
              bbox_info: [],
            } as DetectionWithBboxInfo;
          }
        })
      ).then((results) =>
        results
          .filter(
            (result): result is PromiseFulfilledResult<DetectionWithBboxInfo> =>
              result.status === 'fulfilled'
          )
          .map((result) => result.value)
      );

    // 성공/실패 통계 출력
    const successCount = detectionsWithBboxInfo.filter(
      (d) => d.bbox_info.length > 0
    ).length;
    const failureCount = detectionsWithBboxInfo.length - successCount;

    console.log(
      `BBox 정보 가져오기 결과: 성공 ${successCount}개, bbox 없음 ${failureCount}개`
    );

    return detectionsWithBboxInfo;
  } catch (error) {
    console.error('통합 탐지정보 가져오기 실패:', error);
    return [];
  }
};

/**
 * 전체 카메라 관련 데이터를 한 번에 가져오는 함수
 */
export const fetchAllCameraData = async () => {
  try {
    const cameras = await getCameras();

    return {
      cameras,
    };
  } catch (error) {
    console.error('카메라 관련 전체 데이터 가져오기 오류:', error);
    return {
      cameras: [],
    };
  }
};
