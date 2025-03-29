// redux/slices/modelsSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type OptionType = {
  value: string;
  label: string;
};

interface TokenState {
  accessToken: string | null;
  tokenCreatedAt: number | null;
  expiresIn: number | null;
  tags?: string[];
  selectedTags?: string[];
  selectedOptions?: OptionType[];
  searchParam: string;
  isLoggingIn: boolean;
  isModelsLoading: boolean; // ← Add this
}

const initialState: TokenState = {
  accessToken: null,
  tokenCreatedAt: null,
  expiresIn: null,
  tags: undefined,
  selectedOptions: [],
  selectedTags: [],
  searchParam: "",
  isLoggingIn: false,
  isModelsLoading: false, // ← Add this
};

const modelsSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setToken(
      state,
      action: PayloadAction<{ accessToken: string; expiresIn: number }>
    ) {
      state.accessToken = action.payload.accessToken;
      state.expiresIn = action.payload.expiresIn;
      state.tokenCreatedAt = Date.now();
    },
    setTags: (state, action: PayloadAction<string[]>) => {
      state.tags = Array.isArray(action.payload) ? action.payload : [];
    },
    setSelectedTags: (state, action: PayloadAction<string[]>) => {
      state.selectedTags = Array.isArray(action.payload) ? action.payload : [];
    },
    setSelectedOptions: (state, action: PayloadAction<OptionType[]>) => {
      state.selectedOptions = action.payload;
    },
    setSearchParam: (state, action: PayloadAction<string>) => {
      state.searchParam = action.payload;
    },
    setIsLoggingIn: (state, action: PayloadAction<boolean>) => {
      state.isLoggingIn = action.payload;
    },
    setIsModelsLoading: (state, action: PayloadAction<boolean>) => {
      state.isModelsLoading = action.payload;
    },
  },
});

export const {
  setToken,
  setTags,
  setSelectedOptions,
  setSelectedTags,
  setSearchParam,
  setIsLoggingIn,
  setIsModelsLoading,
} = modelsSlice.actions;
export default modelsSlice.reducer;
