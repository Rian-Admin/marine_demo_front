import { AxiosRequestConfig, AxiosResponse } from 'axios';

import axiosInstance from '@/api/axios/axios';

// GET 요청 - 응답 타입만 필요
export const getRequest = async <TResponse = unknown>(
  url: string,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<TResponse>> => {
  const response = await axiosInstance.get<TResponse>(url, config);
  return response;
};

// POST 요청 - 요청 본문과 응답 타입이 다를 수 있음
export const postRequest = async <TRequest = unknown, TResponse = TRequest>(
  url: string,
  data?: TRequest,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<TResponse>> => {
  const response = await axiosInstance.post<TResponse>(url, data, config);
  return response;
};

// PUT 요청 - 전체 리소스 교체
export const putRequest = async <TRequest = unknown, TResponse = TRequest>(
  url: string,
  data: TRequest,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<TResponse>> => {
  const response = await axiosInstance.put<TResponse>(url, data, config);
  return response;
};

// PATCH 요청 - 부분 업데이트
export const patchRequest = async <TRequest = unknown, TResponse = TRequest>(
  url: string,
  data: Partial<TRequest>,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<TResponse>> => {
  const response = await axiosInstance.patch<TResponse>(url, data, config);
  return response;
};

// DELETE 요청 - 보통 응답이 없거나 간단한 메시지
export const deleteRequest = async <TResponse = void>(
  url: string,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<TResponse>> => {
  const response = await axiosInstance.delete<TResponse>(url, config);
  return response;
};

// Response에서 data만 추출하는 헬퍼 함수들
export const api = {
  get: async <TResponse = unknown>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<TResponse> => {
    const response = await getRequest<TResponse>(url, config);
    return response.data;
  },

  post: async <TRequest = unknown, TResponse = TRequest>(
    url: string,
    data?: TRequest,
    config?: AxiosRequestConfig
  ): Promise<TResponse> => {
    const response = await postRequest<TRequest, TResponse>(url, data, config);
    return response.data;
  },

  put: async <TRequest = unknown, TResponse = TRequest>(
    url: string,
    data: TRequest,
    config?: AxiosRequestConfig
  ): Promise<TResponse> => {
    const response = await putRequest<TRequest, TResponse>(url, data, config);
    return response.data;
  },

  patch: async <TRequest = unknown, TResponse = TRequest>(
    url: string,
    data: Partial<TRequest>,
    config?: AxiosRequestConfig
  ): Promise<TResponse> => {
    const response = await patchRequest<TRequest, TResponse>(url, data, config);
    return response.data;
  },

  delete: async <TResponse = void>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<TResponse> => {
    const response = await deleteRequest<TResponse>(url, config);
    return response.data;
  },
};
