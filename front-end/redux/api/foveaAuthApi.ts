import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
// import { setTokens } from '../slices/foveaAuthSlice';
import { setTokens } from '../slices/foveaAuthSlice';
import { AuthResponse } from '@/types/authTypes';

export const foveaAuthApi = createApi({
  reducerPath: 'foveaAuthApi',
  baseQuery: fetchBaseQuery({ baseUrl: process.env.NEXT_PUBLIC_AUTH_API_BASE }),
  endpoints: (builder) => ({
    getAccessToken: builder.query<AuthResponse, void>({
      query: () => `/partners/fovea/login`,
      transformResponse: (response: any) => {
        const parsedBody = JSON.parse(response.body);
        return {
          accessToken: parsedBody.response.access_token,
          refreshToken: parsedBody.response.refresh_token,
          expiresIn: parsedBody.response.expires_in,
        };
      },
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setTokens(data));
        } catch (error) {
          console.error('Login API failed:', error);
        }
      },
    }),
  }),
});

export const { useLazyGetAccessTokenQuery } = foveaAuthApi;
