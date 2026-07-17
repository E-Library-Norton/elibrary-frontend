// store/api/reviewApi.ts
import { baseApi } from "./baseApi";
import type { ApiResponse } from "@/types";

// ── Types 
export interface ReviewUser {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  avatar: string | null;
}

export interface Review {
  id: number | string;
  bookId: number | string;
  userId: number | string;
  rating: number; // 1–5
  comment: string | null;
  createdAt?: string;
  updatedAt?: string;
  created_at?: string;
  updated_at?: string;
  User?: ReviewUser;
}

export interface ReviewsResponse {
  reviews: Review[];
  averageRating: number | null;
  totalReviews: number;
  totalPages: number;
  currentPage: number;
}

export interface MyReviewsResponse {
  reviews: (Review & { Book?: { id: number; title: string; titleKh?: string; coverUrl?: string | null } })[];
  total: number;
  totalPages: number;
  currentPage: number;
}

export interface PublicReview {
  id: number;
  rating: number;
  comment: string;
  created_at: string;
  User: {
    id: number;
    firstName: string | null;
    lastName: string | null;
    username: string;
    avatar: string | null;
  } | null;
  Book: {
    id: number;
    title: string;
  } | null;
}

export interface CreateReviewPayload {
  rating: number;
  comment?: string;
}

export interface UpdateReviewPayload {
  rating?: number;
  comment?: string;
}

// ── API 
export const reviewApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /api/books/:bookId/reviews
    getBookReviews: builder.query<ApiResponse<ReviewsResponse>, { bookId: string | number; page?: number; limit?: number }>({
      query: ({ bookId, page = 1, limit = 20 }) =>
        `/books/${bookId}/reviews?page=${page}&limit=${limit}`,
      providesTags: (_result, _error, { bookId }) => [
        { type: "Review" as const, id: `book-${bookId}` },
      ],
    }),

    // POST /api/books/:bookId/reviews
    createReview: builder.mutation<ApiResponse<Review>, { bookId: string | number } & CreateReviewPayload>({
      query: ({ bookId, ...body }) => ({
        url: `/books/${bookId}/reviews`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, { bookId }) => [
        { type: "Review" as const, id: `book-${bookId}` },
        { type: "Review" as const, id: "MY" },
      ],
    }),

    // PUT /api/reviews/:id
    updateReview: builder.mutation<ApiResponse<Review>, { id: number; bookId?: string | number } & UpdateReviewPayload>({
      query: ({ id, bookId: _b, ...body }) => ({
        url: `/reviews/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_r, _e, { bookId }) => [
        { type: "Review" as const, id: "MY" },
        ...(bookId ? [{ type: "Review" as const, id: `book-${bookId}` }] : []),
      ],
    }),

    // DELETE /api/reviews/:id
    deleteReview: builder.mutation<ApiResponse<null>, { id: number; bookId?: string | number }>({
      query: ({ id }) => ({
        url: `/reviews/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_r, _e, { bookId }) => [
        { type: "Review" as const, id: "MY" },
        ...(bookId ? [{ type: "Review" as const, id: `book-${bookId}` }] : []),
      ],
    }),

    // GET /api/reviews/public (no auth — homepage testimonials)
    getPublicReviews: builder.query<ApiResponse<PublicReview[]>, { limit?: number } | void>({
      query: (params) => {
        const limit = params?.limit ?? 50;
        return `/reviews/public?limit=${limit}`;
      },
    }),

    // GET /api/reviews/my
    getMyReviews: builder.query<ApiResponse<MyReviewsResponse>, { page?: number; limit?: number } | void>({
      query: (params = {}) => {
        const { page = 1, limit = 20 } = params ?? {};
        return `/reviews/my?page=${page}&limit=${limit}`;
      },
      providesTags: [{ type: "Review" as const, id: "MY" }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetBookReviewsQuery,
  useCreateReviewMutation,
  useUpdateReviewMutation,
  useDeleteReviewMutation,
  useGetMyReviewsQuery,
  useGetPublicReviewsQuery,
} = reviewApi;
