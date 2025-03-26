import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithAuth } from './baseQuery';
// import { ModelsResponse } from '@/types/modelTypes';
import { ModelsResponse } from '@/types/modelTypes';

export const modelsApi = createApi({
  reducerPath: 'modelsApi',
  baseQuery: baseQueryWithAuth,
  endpoints: (builder) => ({
    getModels: builder.query<ModelsResponse, { userId: string; page?: number; per_page?: number; search?: string; order_by?: string }>({
      query: ({ userId, page = 1, per_page = 10, search = '', order_by = 'CREATED_NEW_TO_OLD' }) =>
        `/users/${userId}/models?page=${page}&per_page=${per_page}&search=${search}&order_by=${order_by}`,
    }),
  }),
});

export const { useGetModelsQuery } = modelsApi;
