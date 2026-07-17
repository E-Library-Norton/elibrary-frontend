import { baseApi } from "./baseApi";
import { setCredentials, patchUser, logout, setAuthLoading } from "@/store/slices/authSlice";
import type {
  ApiResponse,
  User,
  LoginInput,
  RegisterInput,
  UpdateProfileInput,
  ChangePasswordInput,
} from "@/types";

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ── POST /api/auth/login 
    login: builder.mutation<ApiResponse<User>, LoginInput>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
      // After successful login: push user into auth slice
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data.success) dispatch(setCredentials(data.data));
        } catch {
          // error handled by component
        }
      },
      invalidatesTags: ["Auth"],
    }),

    // ── POST /api/auth/register 
    register: builder.mutation<ApiResponse<User>, RegisterInput>({
      query: (body) => ({
        url: "/auth/register",
        method: "POST",
        body,
      }),
    }),

    // ── POST /api/auth/logout 
    logout: builder.mutation<ApiResponse<null>, void>({
      query: () => ({ url: "/auth/logout", method: "POST" }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(logout());
        } catch {
          // force local logout even if request failed
          dispatch(logout());
        }
      },
      invalidatesTags: ["Auth", "Profile"],
    }),

    // ── GET /api/auth/me ────
    // Called on app mount to rehydrate user from HTTP-only cookie
    getMe: builder.query<ApiResponse<User>, void>({
      query: () => "/auth/me",
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        // Mark auth as loading — cleared in finally so components never hang
        dispatch(setAuthLoading(true));
        try {
          const { data } = await queryFulfilled;
          if (data.success) dispatch(setCredentials(data.data));
        } catch {
          // No valid session — user stays unauthenticated
          dispatch(setAuthLoading(false));
        }
      },
      providesTags: ["Auth", "Profile"],
    }),

    // ── PATCH /api/auth/profile 
    updateProfile: builder.mutation<ApiResponse<Partial<User>>, UpdateProfileInput>({
      query: (body) => ({
        url: "/auth/profile",
        method: "PATCH",
        body,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data.success && data.data) dispatch(patchUser(data.data));
        } catch {
          // error handled by component
        }
      },
      invalidatesTags: ["Profile"],
    }),

    // ── PUT /api/auth/change-password 
    changePassword: builder.mutation<ApiResponse<null>, ChangePasswordInput>({
      query: (body) => ({
        url: "/auth/change-password",
        method: "PUT",
        body,
      }),
    }),

    // ── POST /api/auth/avatar 
    uploadAvatar: builder.mutation<ApiResponse<{ avatar: string }>, FormData>({
      query: (formData) => ({
        url: "/auth/avatar",
        method: "POST",
        body: formData,
        // Let the browser set Content-Type with multipart boundary
        formData: true,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data.success && data.data?.avatar) {
            dispatch(patchUser({ avatar: data.data.avatar }));
          }
        } catch {
          // error handled by component
        }
      },
      invalidatesTags: ["Profile"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useGetMeQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useUploadAvatarMutation,
} = authApi;
