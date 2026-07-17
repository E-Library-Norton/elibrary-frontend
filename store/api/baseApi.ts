import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { logout } from "@/store/slices/authSlice";

// ─── Raw base query — all requests go to Next.js /api/* (same-origin proxy) ──
const rawBaseQuery = fetchBaseQuery({
  baseUrl: "/api",
  credentials: "same-origin",
});

// ─── Wrapper: on 401 → try token refresh → retry once, else logout ────────────
const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error?.status === 401) {
    // Attempt silent token refresh via our proxy route
    const refreshResult = await rawBaseQuery(
      { url: "/auth/refresh", method: "POST" },
      api,
      extraOptions
    );

    if (refreshResult.data) {
      // Token refreshed — retry the original request
      result = await rawBaseQuery(args, api, extraOptions);
    } else {
      // Refresh also failed → force logout
      api.dispatch(logout());
    }
  }

  return result;
};

// ─── Single API instance — endpoints injected per-feature ────────────────────
export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  keepUnusedDataFor: 300,      // 5 min default — prevents refetch on back-nav
  refetchOnFocus: false,        // don't spam API on tab switch
  refetchOnReconnect: true,     // do refetch after network recovery
  tagTypes: ["Auth", "Profile", "Books", "Book", "Review", "Feedback"],
  endpoints: () => ({}),
});
