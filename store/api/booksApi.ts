import { baseApi } from "./baseApi";
import type { ApiResponse, Book, BookCategory, BooksQuery, PaginatedData } from "@/types";

export interface SiteStats {
  total_books: number;
  total_members: number;
  total_categories: number;
}

export const booksApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ── GET /api/books?page=&limit=&search=&category= ───────────────────────
    getBooks: builder.query<ApiResponse<PaginatedData<Book>>, BooksQuery>({
      query: (params = {}) => {
        const sp = new URLSearchParams();
        (Object.entries(params) as [string, unknown][]).forEach(([k, v]) => {
          if (v !== undefined && v !== "") sp.set(k, String(v));
        });
        const qs = sp.toString();
        return `/books${qs ? `?${qs}` : ""}`;
      },
      providesTags: (result) =>
        result?.data?.books
          ? [
              ...result.data.books.map(({ id }) => ({
                type: "Book" as const,
                id: String(id),
              })),
              { type: "Books" as const, id: "LIST" },
            ]
          : [{ type: "Books" as const, id: "LIST" }],
    }),

    // ── GET /api/books/:id ──────────────────────────────────────────────────
    getBookById: builder.query<ApiResponse<Book>, string>({
      query: (id) => `/books/${id}`,
      providesTags: (_, __, id) => [{ type: "Book", id }],
    }),

    // ── GET /api/categories ─────────────────────────────────────────────────
    getCategories: builder.query<ApiResponse<BookCategory[]>, void>({
      query: () => "/categories",
      keepUnusedDataFor: 3600, // 1 hour — categories rarely change
    }),

    // ── GET /api/stats ──────────────────────────────────────────────────────
    getStats: builder.query<ApiResponse<SiteStats>, void>({
      query: () => "/stats",
      keepUnusedDataFor: 1800, // 30 min — public stats are stable
    }),

    // ── GET /api/books/:id/video-url ────────────────────────────────────────
    getVideoUrl: builder.query<ApiResponse<{ url: string; expiresIn: number }>, string>({
      query: (id) => `/books/${id}/video-url`,
    }),

    // ── GET /api/books/:id/audio-url ────────────────────────────────────────
    getAudioUrl: builder.query<ApiResponse<{ url: string; expiresIn: number }>, string>({
      query: (id) => `/books/${id}/audio-url`,
    }),

    // ── POST /api/books/:id/share ───────────────────────────────────────────
    shareBook: builder.mutation<ApiResponse<{ shares: number }>, string>({
      query: (id) => ({
        url: `/books/${id}/share`,
        method: "POST",
      }),
      invalidatesTags: (_, __, id) => [{ type: "Book", id }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetBooksQuery,
  useGetBookByIdQuery,
  useGetCategoriesQuery,
  useGetStatsQuery,
  useGetVideoUrlQuery,
  useGetAudioUrlQuery,
  useShareBookMutation,
} = booksApi;
