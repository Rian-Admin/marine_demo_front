import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from 'axios';

import { toast } from 'react-toastify';

// API 기본 URL 설정 (환경변수 또는 기본값)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// axios 인스턴스 생성
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30초 타임아웃
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 토큰이 있다면 헤더에 추가
    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('accessToken')
        : null;

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => {
    console.error('Request Error:', error);
    toast.error('요청 처리 중 오류가 발생했습니다.');
    return Promise.reject(error);
  }
);

// Response Interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // 토스트 메시지 표시
    const showErrorToast = (message: string) => {
      if (typeof window !== 'undefined') {
        // 토스트 표시를 여러 번 시도하는 함수
        const tryShowToast = (retryCount = 0) => {
          try {
            // toast가 정의되어 있는지 확인
            if (typeof toast !== 'undefined' && toast.error) {
              toast.error(message);
            } else if (retryCount < 3) {
              // 최대 3번까지 재시도
              setTimeout(() => tryShowToast(retryCount + 1), 500);
            } else {
              // 토스트가 실패하면 콘솔에 에러 메시지 출력
              console.error('Toast failed to load. Error message:', message);
            }
          } catch (toastError) {
            if (retryCount < 3) {
              setTimeout(() => tryShowToast(retryCount + 1), 500);
            } else {
              console.error('Toast error after retries:', toastError);
              console.error('Original error message:', message);
            }
          }
        };

        // 첫 번째 시도는 약간의 딜레이 후에
        setTimeout(() => tryShowToast(), 100);
      }
    };

    // 401 에러 처리 (토큰 만료)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // 리프레시 토큰으로 새 액세스 토큰 요청
        const refreshToken = localStorage.getItem('refreshToken');

        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });

          const { accessToken } = response.data;
          localStorage.setItem('accessToken', accessToken);

          // 원래 요청 재시도
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        // 리프레시 실패 시 로그인 페이지로 리다이렉트
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');

        showErrorToast('로그인이 만료되었습니다. 다시 로그인해주세요.');

        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    // 기타 HTTP 에러 처리
    const status = error.response?.status;
    const data = error.response?.data as { message?: string };
    const message = data?.message || error.message;
    const url = error.config?.url || '';

    // URL별 맞춤 에러 메시지 처리
    const getCustomErrorMessage = (
      status: number,
      url: string,
      defaultMessage: string
    ): string => {
      // NVR 영상 재생 관련 API
      if (url.includes('/nvr/playback/start')) {
        switch (status) {
          case 404:
            return 'NVR 영상 재생 서비스를 찾을 수 없습니다. 서버 상태를 확인해주세요.';
          case 401:
            return 'NVR 시스템 인증에 실패했습니다. 로그인 정보를 확인해주세요.';
          case 403:
            return 'NVR 영상 재생 권한이 없습니다.';
          case 500:
            return 'NVR 서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.';
          case 503:
            return 'NVR 서비스를 일시적으로 사용할 수 없습니다.';
          default:
            return '영상 재생을 시작할 수 없습니다. 네트워크 상태를 확인해주세요.';
        }
      }

      // NVR 영상 재생 중지 관련 API
      if (url.includes('/nvr/playback/stop')) {
        switch (status) {
          case 404:
            return '중지할 재생 세션을 찾을 수 없습니다.';
          case 500:
            return '영상 재생 중지 중 서버 오류가 발생했습니다.';
          default:
            return '영상 재생을 중지할 수 없습니다.';
        }
      }

      // 감지 기록 조회 관련 API
      if (url.includes('/detections/filtered') || url.includes('/detections')) {
        switch (status) {
          case 404:
            return '감지 기록 서비스를 찾을 수 없습니다.';
          case 401:
            return '감지 기록 조회 권한이 없습니다. 로그인을 확인해주세요.';
          case 403:
            return '감지 기록에 접근할 권한이 없습니다.';
          case 500:
            return '감지 기록 서버에 문제가 발생했습니다.';
          default:
            return '감지 기록을 불러올 수 없습니다. 잠시 후 다시 시도해주세요.';
        }
      }

      // 인증 관련 API
      if (url.includes('/auth/')) {
        switch (status) {
          case 401:
            return '로그인 정보가 올바르지 않습니다.';
          case 403:
            return '접근이 거부되었습니다.';
          case 429:
            return '로그인 시도가 너무 많습니다. 잠시 후 다시 시도해주세요.';
          default:
            return '인증 처리 중 오류가 발생했습니다.';
        }
      }

      // 기본 메시지 반환
      return defaultMessage;
    };

    switch (status) {
      case 400:
        showErrorToast(
          getCustomErrorMessage(400, url, '잘못된 요청입니다: ' + message)
        );
        break;
      case 401:
        showErrorToast(getCustomErrorMessage(401, url, '인증이 필요합니다.'));
        break;
      case 403:
        showErrorToast(
          getCustomErrorMessage(403, url, '접근 권한이 없습니다.')
        );
        break;
      case 404:
        showErrorToast(
          getCustomErrorMessage(404, url, '요청한 리소스를 찾을 수 없습니다.')
        );
        break;
      case 500:
        showErrorToast(
          getCustomErrorMessage(500, url, '서버 내부 오류가 발생했습니다.')
        );
        break;
      case 502:
        showErrorToast(
          getCustomErrorMessage(502, url, '서버 연결에 문제가 있습니다.')
        );
        break;
      case 503:
        showErrorToast(
          getCustomErrorMessage(
            503,
            url,
            '서비스를 일시적으로 사용할 수 없습니다.'
          )
        );
        break;
      default:
        if (error.code === 'ECONNABORTED') {
          showErrorToast(
            getCustomErrorMessage(0, url, '요청 시간이 초과되었습니다.')
          );
        } else if (error.code === 'ERR_NETWORK') {
          showErrorToast(
            getCustomErrorMessage(0, url, '네트워크 연결을 확인해주세요.')
          );
        } else {
          showErrorToast(
            getCustomErrorMessage(
              status || 0,
              url,
              '오류가 발생했습니다: ' + message
            )
          );
        }
    }

    // 에러 응답 로깅
    if (process.env.NODE_ENV === 'development') {
      console.error('API Error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        url: error.config?.url,
      });
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
