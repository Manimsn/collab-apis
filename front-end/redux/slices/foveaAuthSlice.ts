

// redux/slices/modelsSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface TokenState {
  accessToken: string | null;
  tokenCreatedAt: number | null;
  expiresIn: number | null;
}

const initialState: TokenState = {
  accessToken: null,
  tokenCreatedAt: null,
  expiresIn: null,
};

const modelsSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken(state, action: PayloadAction<{ accessToken: string; expiresIn: number }>) {
      state.accessToken = action.payload.accessToken;
      state.expiresIn = action.payload.expiresIn;
      state.tokenCreatedAt = Date.now();
    },
  },
});

export const { setToken } = modelsSlice.actions;
export default modelsSlice.reducer;


