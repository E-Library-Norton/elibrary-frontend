"use client";

import React, { useRef } from "react";
import { Provider } from "react-redux";
import { store } from "@/lib/store";
import { useGetMeQuery } from "@/store/api/authApi";

// ─── Auth Initializer ─────────────────────────────────────────────────────────
// Runs on mount to silently rehydrate user from the HTTP-only cookie.
// If the cookie is valid → /api/auth/me succeeds → user is set in store.
// If not → 401 → user stays null. No flash, no redirect.
function AuthInitializer({ children }: { children: React.ReactNode }) {
  useGetMeQuery(undefined, {
    // Skip on server; runs once client mounts
    refetchOnMountOrArgChange: false,
    refetchOnFocus: false,
    refetchOnReconnect: false,
  });
  return <>{children}</>;
}

// ─── Store Provider ───────────────────────────────────────────────────────────
export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Use a ref to avoid recreating the store on every render
  const storeRef = useRef(store);

  return (
    <Provider store={storeRef.current}>
      <AuthInitializer>{children}</AuthInitializer>
    </Provider>
  );
}
