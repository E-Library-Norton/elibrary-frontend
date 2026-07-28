import { baseApi } from "@/store/api/baseApi";
import type { ApiResponse } from "@/types";
import type {
  Bookmark,
  CreateBookmarkInput,
  CreateReadingNoteInput,
  ReadingLibraryItem,
  ReadingNote,
  ReadingProgress,
  UpdateReadingNoteInput,
  UpdateReadingProgressInput,
} from "@/types/reading";

export const readingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getReadingProgress: builder.query<
      ApiResponse<ReadingProgress | null>,
      string | number
    >({
      query: (bookId) => `/books/${bookId}/reading-progress`,
      providesTags: (_result, _error, bookId) => [
        { type: "ReadingProgress", id: String(bookId) },
      ],
    }),

    updateReadingProgress: builder.mutation<
      ApiResponse<ReadingProgress>,
      UpdateReadingProgressInput
    >({
      query: ({ bookId, currentPage, totalPages }) => ({
        url: `/books/${bookId}/reading-progress`,
        method: "PUT",
        body: { currentPage, totalPages },
      }),
      invalidatesTags: ["ReadingLibrary"],
    }),

    getBookmarks: builder.query<ApiResponse<Bookmark[]>, string | number>({
      query: (bookId) => `/books/${bookId}/bookmarks`,
      providesTags: (_result, _error, bookId) => [
        { type: "Bookmark", id: String(bookId) },
      ],
    }),

    createBookmark: builder.mutation<
      ApiResponse<Bookmark>,
      CreateBookmarkInput
    >({
      query: ({ bookId, ...body }) => ({
        url: `/books/${bookId}/bookmarks`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, { bookId }) => [
        { type: "Bookmark", id: String(bookId) },
        "ReadingLibrary",
      ],
    }),

    deleteBookmark: builder.mutation<
      void,
      { bookId: string | number; bookmarkId: string | number }
    >({
      query: ({ bookId, bookmarkId }) => ({
        url: `/books/${bookId}/bookmarks/${bookmarkId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { bookId }) => [
        { type: "Bookmark", id: String(bookId) },
        "ReadingLibrary",
      ],
    }),

    getReadingNotes: builder.query<
      ApiResponse<ReadingNote[]>,
      string | number
    >({
      query: (bookId) => `/books/${bookId}/notes`,
      providesTags: (_result, _error, bookId) => [
        { type: "ReadingNote", id: String(bookId) },
      ],
    }),

    createReadingNote: builder.mutation<
      ApiResponse<ReadingNote>,
      CreateReadingNoteInput
    >({
      query: ({ bookId, ...body }) => ({
        url: `/books/${bookId}/notes`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, { bookId }) => [
        { type: "ReadingNote", id: String(bookId) },
        "ReadingLibrary",
      ],
    }),

    updateReadingNote: builder.mutation<
      ApiResponse<ReadingNote>,
      UpdateReadingNoteInput
    >({
      query: ({ bookId, noteId, ...body }) => ({
        url: `/books/${bookId}/notes/${noteId}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { bookId }) => [
        { type: "ReadingNote", id: String(bookId) },
      ],
    }),

    deleteReadingNote: builder.mutation<
      void,
      { bookId: string | number; noteId: string | number }
    >({
      query: ({ bookId, noteId }) => ({
        url: `/books/${bookId}/notes/${noteId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { bookId }) => [
        { type: "ReadingNote", id: String(bookId) },
        "ReadingLibrary",
      ],
    }),

    getReadingLibrary: builder.query<
      ApiResponse<{ items: ReadingLibraryItem[] }>,
      void
    >({
      query: () => "/library/reading-progress",
      providesTags: ["ReadingLibrary"],
    }),
  }),
});

export const {
  useGetReadingProgressQuery,
  useUpdateReadingProgressMutation,
  useGetBookmarksQuery,
  useCreateBookmarkMutation,
  useDeleteBookmarkMutation,
  useGetReadingNotesQuery,
  useCreateReadingNoteMutation,
  useUpdateReadingNoteMutation,
  useDeleteReadingNoteMutation,
  useGetReadingLibraryQuery,
} = readingApi;
