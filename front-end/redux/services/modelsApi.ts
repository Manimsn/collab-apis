// redux/services/modelsApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../store";

interface TokenResponse {
  access_token: string;
  expires_in: number;
}

export const modelsApi = createApi({
  reducerPath: "modelsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://apidev.archvision.services/",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.accessToken;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    login: builder.mutation<TokenResponse, void>({
      query: () => ({
        url: "https://enkyzxet9a.execute-api.us-east-2.amazonaws.com/staging/partners/fovea/login",
        method: "GET",
      }),
      transformResponse: (response: any) => {
        const body = JSON.parse(response.body);
        return {
          access_token: body.response.access_token,
          expires_in: body.response.expires_in,
        };
      },
    }),
    getModels: builder.query({
      query: (params: any) => ({
        url: `users/397728/models`,
        method: "GET",
        params,
      }),
    }),
  }),
});

export const { useLoginMutation, useGetModelsQuery } = modelsApi;
