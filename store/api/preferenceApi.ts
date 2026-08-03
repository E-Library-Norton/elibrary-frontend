import { baseApi } from "./baseApi";
import type {
  ApiResponse,
  BookDepartment,
  ReadingPreference,
  ReadingPreferenceInput,
  RecommendationData,
} from "@/types";

export const preferenceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getReadingPreferences: builder.query<
      ApiResponse<ReadingPreference | null>,
      void
    >({
      query: () => "/user/preferences",
      providesTags: ["Preferences"],
    }),
    saveReadingPreferences: builder.mutation<
      ApiResponse<ReadingPreference>,
      { values: ReadingPreferenceInput; exists: boolean }
    >({
      query: ({ values, exists }) => ({
        url: "/user/preferences",
        method: exists ? "PATCH" : "POST",
        body: values,
      }),
      invalidatesTags: ["Preferences", "Recommendations"],
    }),
    getDepartments: builder.query<ApiResponse<BookDepartment[]>, void>({
      query: () => "/departments",
      providesTags: ["Departments"],
      keepUnusedDataFor: 3600,
    }),
    getRecommendations: builder.query<
      ApiResponse<RecommendationData>,
      { page?: number; limit?: number }
    >({
      query: ({ page = 1, limit = 12 } = {}) =>
        `/books/recommendations?page=${page}&limit=${limit}`,
      providesTags: ["Recommendations"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetReadingPreferencesQuery,
  useSaveReadingPreferencesMutation,
  useGetDepartmentsQuery,
  useGetRecommendationsQuery,
} = preferenceApi;
