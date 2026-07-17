import { configureStore } from "@reduxjs/toolkit";
import { baseApi } from "@/store/api/baseApi";
import authReducer from "@/store/slices/authSlice";
import uiReducer from "@/store/slices/uiSlice";
import libraryReducer from "@/store/slices/librarySlice";

export const store = configureStore({
  reducer: {
    // RTK Query — single API slice
    [baseApi.reducerPath]: baseApi.reducer,
    // Auth state (user, isAuthenticated)
    auth: authReducer,
    // UI state (toasts)
    ui: uiReducer,
    // Library state (favorites, reading progress, history)
    library: libraryReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
  devTools: process.env.NODE_ENV !== "production",
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
