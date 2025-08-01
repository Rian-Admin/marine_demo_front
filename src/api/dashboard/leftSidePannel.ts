import { api } from '@/api/axios';

// API 응답 타입 정의
interface WeatherApiResponse {
  timestamp: string;
  current: {
    temperature: number;
    humidity: number;
    wind_speed: number;
    wind_direction: number;
    precipitation: number;
    precipitation_type?: string;
    visibility: number;
  };
  forecast: unknown[];
}

interface DetectionApiResponse {
  status: string;
  detections: DetectionItem[];
}

interface DetectionItem {
  detection_id: number;
  camera_id: number;
  bb_count: number;
  detection_time: string;
}

// 날씨 데이터 타입 정의
export interface WeatherData {
  location: string;
  timestamp: string;
  current: {
    temperature: number;
    feels_like: number | null;
    humidity: number;
    wind_speed: number;
    wind_direction: number;
    precipitation: number;
    weather_condition: string;
    visibility: number;
  };
  forecast: unknown[];
}

// 조류 활동 데이터 타입 정의
export interface BirdActivityItem {
  id: string;
  count: number;
  risk: string;
  timestamp: Date;
  bbox_width?: number;
  bbox_height?: number;
}

/**
 * 날씨 데이터를 가져오는 API 함수
 */
export const fetchWeatherData = async (): Promise<WeatherData | null> => {
  try {
    const response = (await api.get(
      '/api/weather/current/'
    )) as WeatherApiResponse;

    if (response && response.current) {
      const processedData: WeatherData = {
        location: '전라남도 영광군 소각시도',
        timestamp: response.timestamp,
        current: {
          temperature: response.current.temperature || 0,
          feels_like: response.current.temperature
            ? response.current.temperature - 3
            : null,
          humidity: response.current.humidity || 0,
          wind_speed: response.current.wind_speed || 0,
          wind_direction: response.current.wind_direction || 0,
          precipitation: response.current.precipitation || 0,
          weather_condition: response.current.precipitation_type || 'none',
          visibility: response.current.visibility || 0,
        },
        forecast: response.forecast || [],
      };

      console.log('날씨 데이터 가져오기 성공:', processedData);
      return processedData;
    }

    return null;
  } catch (error) {
    console.error('날씨 데이터 가져오기 오류:', error);
    return null;
  }
};

/**
 * 조류 활동 데이터를 가져오는 API 함수
 */
export const fetchBirdActivityData = async (): Promise<BirdActivityItem[]> => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const response = (await api.get('/api/detections/filtered/', {
      params: {
        date_from: today,
        date_to: today,
        sort_by: 'date_desc',
        per_page: 10,
      },
    })) as DetectionApiResponse;

    if (response && response.status === 'success' && response.detections) {
      const detections = response.detections;

      // 카메라별로 가장 최근 탐지 데이터 찾기
      const camera1Detection = detections.find(
        (d: DetectionItem) => d.camera_id === 1
      );
      const camera2Detection = detections.find(
        (d: DetectionItem) => d.camera_id === 2
      );
      const camera3Detection = detections.find(
        (d: DetectionItem) => d.camera_id === 3
      );

      const turbineData: BirdActivityItem[] = [
        {
          id: 'SG-01',
          count: camera1Detection ? camera1Detection.bb_count : 0,
          risk: 'low',
          timestamp: new Date(),
          bbox_width: 0,
          bbox_height: 0,
        },
        {
          id: 'SG-02',
          count: camera2Detection ? camera2Detection.bb_count : 0,
          risk: 'low',
          timestamp: new Date(),
          bbox_width: 0,
          bbox_height: 0,
        },
        {
          id: 'SG-03',
          count: camera3Detection ? camera3Detection.bb_count : 0,
          risk: 'low',
          timestamp: new Date(),
          bbox_width: 0,
          bbox_height: 0,
        },
      ];

      console.log('조류 활동 데이터 가져오기 성공:', turbineData);
      return turbineData;
    }

    // API 응답이 없는 경우 기본값 반환
    return [
      { id: 'SG-01', count: 0, risk: 'low', timestamp: new Date() },
      { id: 'SG-02', count: 0, risk: 'low', timestamp: new Date() },
      { id: 'SG-03', count: 0, risk: 'low', timestamp: new Date() },
    ];
  } catch (error) {
    console.error('조류 활동 데이터 가져오기 오류:', error);

    // 오류 시에도 UI를 유지하기 위해 기본 데이터 반환
    return [
      { id: 'SG-01', count: 0, risk: 'low', timestamp: new Date() },
      { id: 'SG-02', count: 0, risk: 'low', timestamp: new Date() },
      { id: 'SG-03', count: 0, risk: 'low', timestamp: new Date() },
    ];
  }
};

/**
 * 전체 데이터를 한 번에 가져오는 함수
 */
export const fetchAllLeftPanelData = async () => {
  try {
    const [weatherData, birdActivityData] = await Promise.all([
      fetchWeatherData(),
      fetchBirdActivityData(),
    ]);

    console.log('왼쪽 패널 전체 데이터 새로고침 완료');

    return {
      weatherData,
      birdActivityData,
    };
  } catch (error) {
    console.error('왼쪽 패널 전체 데이터 가져오기 오류:', error);
    return {
      weatherData: null,
      birdActivityData: [],
    };
  }
};
