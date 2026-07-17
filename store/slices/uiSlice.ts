import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { UiState, Toast, ToastType } from "@/types";

const initialState: UiState = {
  toasts: [],
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    addToast: (
      state,
      action: PayloadAction<{ type: ToastType; message: string; duration?: number }>
    ) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      state.toasts.push({ ...action.payload, id });
    },
    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
    clearToasts: (state) => {
      state.toasts = [];
    },
  },
});

export const { addToast, removeToast, clearToasts } = uiSlice.actions;
export default uiSlice.reducer;

// ─── Convenience toast creators ──────────────────────────────────────────────
export const toast = {
  success: (message: string, duration?: number) =>
    addToast({ type: "success", message, duration }),
  error: (message: string, duration?: number) =>
    addToast({ type: "error", message, duration }),
  info: (message: string, duration?: number) =>
    addToast({ type: "info", message, duration }),
  warning: (message: string, duration?: number) =>
    addToast({ type: "warning", message, duration }),
};
