// redux/store.ts
import { configureStore } from "@reduxjs/toolkit";
import { modelsApi } from "./services/modelsApi";
import themeReducer from "@/redux/slices/themeSlice"; // Import the theme slice
import modelsReducer from "./slices/foveaAuthSlice";
import storage from "redux-persist/lib/storage";
import { persistReducer, persistStore } from "redux-persist";
import { combineReducers } from "redux";

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["theme", "auth"],
};

const rootReducer = combineReducers({
  theme: themeReducer,
  auth: modelsReducer,
  [modelsApi.reducerPath]: modelsApi.reducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }).concat(
      modelsApi.middleware
    ),
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
