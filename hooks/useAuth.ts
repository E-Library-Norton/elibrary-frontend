"use client";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  useLoginMutation,
  useLogoutMutation,
  useRegisterMutation,
} from "@/store/api/authApi";
import { logout as logoutAction } from "@/store/slices/authSlice";
import {
  selectCurrentUser,
  selectIsAuthenticated,
  selectIsAuthLoading,
  selectIsAdmin,
  selectIsLibrarian,
} from "@/store/slices/authSlice";
import { toast } from "@/store/slices/uiSlice";
import type { LoginInput, RegisterInput } from "@/types";

export function useAuth() {
  const dispatch = useAppDispatch();

  // ── State ──────────────────────────────────────────────────────────────────
  const user = useAppSelector(selectCurrentUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isAuthLoading = useAppSelector(selectIsAuthLoading);
  const isAdmin = useAppSelector(selectIsAdmin);
  const isLibrarian = useAppSelector(selectIsLibrarian);

  // ── Mutations ──────────────────────────────────────────────────────────────
  const [loginMutation, { isLoading: isLoginLoading, error: loginError }] =
    useLoginMutation();
  const [logoutMutation, { isLoading: isLogoutLoading }] = useLogoutMutation();
  const [registerMutation, { isLoading: isRegisterLoading }] =
    useRegisterMutation();

  // ── Actions ────────────────────────────────────────────────────────────────
  const login = async (credentials: LoginInput) => {
    const result = await loginMutation(credentials).unwrap();
    dispatch(toast.success("Welcome back!"));
    return result;
  };

  const register = async (data: RegisterInput) => {
    const result = await registerMutation(data).unwrap();
    dispatch(toast.success("Account created successfully!"));
    return result;
  };

  const logout = async () => {
    try {
      await logoutMutation().unwrap();
    } catch {
      // Even if API fails, clear local state
      dispatch(logoutAction());
    }
    dispatch(toast.info("Logged out."));
  };

  return {
    // State
    user,
    isAuthenticated,
    isAuthLoading,
    isAdmin,
    isLibrarian,
    // Loading flags
    isLoginLoading,
    isLogoutLoading,
    isRegisterLoading,
    loginError,
    // Actions
    login,
    register,
    logout,
  };
}
