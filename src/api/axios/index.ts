// axios 인스턴스
export { default as axiosInstance } from '@/api/axios/axios';

// 개별 메서드 함수들 (AxiosResponse 전체 반환)
export {
  getRequest,
  postRequest,
  putRequest,
  patchRequest,
  deleteRequest,
} from '@/api/axios/axios.methods';

// 간편 API 함수들 (data만 반환)
export { api } from '@/api/axios/axios.methods';
