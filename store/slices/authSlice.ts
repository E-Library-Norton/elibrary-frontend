import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AuthState, User } from "@/types";

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  // Starts true so components wait for the /api/auth/me rehydration before
  // deciding the user is logged out.
  isAuthLoading: true,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.isAuthLoading = false;
    },
    patchUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isAuthLoading = false;
    },
    setAuthLoading: (state, action: PayloadAction<boolean>) => {
      state.isAuthLoading = action.payload;
    },
  },
});

export const { setCredentials, patchUser, logout, setAuthLoading } = authSlice.actions;
export default authSlice.reducer;

// ─── Selectors ────────────────────────────────────────────────────────────────
export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) =>
  state.auth.isAuthenticated;
export const selectIsAuthLoading = (state: { auth: AuthState }) =>
  state.auth.isAuthLoading;
export const selectIsAdmin = (state: { auth: AuthState }) =>
  state.auth.user?.roles.includes("admin") ?? false;
export const selectIsLibrarian = (state: { auth: AuthState }) =>
  state.auth.user?.roles.some((r) => ["admin", "librarian"].includes(r)) ?? false;
