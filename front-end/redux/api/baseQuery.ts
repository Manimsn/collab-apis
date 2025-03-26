import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../store";
import { foveaAuthApi } from "./foveaAuthApi";

export const baseQueryWithAuth = async (args, api, extraOptions) => {
  const state = api.getState() as RootState;
  const { accessToken, expiresAt } = state.auth;

  if (!accessToken || Date.now() >= expiresAt!) {
    console.log("Token expired, refreshing...");
    const refreshResult = await api.dispatch(
      foveaAuthApi.endpoints.getAccessToken.initiate()
    );

    if (refreshResult.data) {
      args.headers.set(
        "Authorization",
        `Bearer ${refreshResult.data.accessToken}`
      );
    }
  } else {
    args.headers.set("Authorization", `Bearer ${accessToken}`);
  }

  return fetchBaseQuery({ baseUrl: process.env.NEXT_PUBLIC_MODELS_API_BASE })(
    args,
    api,
    extraOptions
  );
};
