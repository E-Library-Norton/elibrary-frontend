// store/api/feedbackApi.ts
import { baseApi } from "./baseApi";

// ── Types ─────────────────────────────────────────────────────────────────────
export interface FeedbackPayload {
  type?: "general" | "bug" | "feature" | "content" | "account";
  subject: string;
  message: string;
  name?: string;
  email?: string;
  rating?: number;
}

export interface FeedbackResponse {
  success: boolean;
  data: {
    id: number;
    type: string;
    subject: string;
    status: string;
  };
  message: string;
}

export interface Testimonial {
  id: number;
  name: string;
  avatar: string | null;
  message: string;
  rating: number;
  type: string;
  createdAt: string;
}

export interface TestimonialsResponse {
  success: boolean;
  data: Testimonial[];
  message: string;
}

// ── Endpoints ─────────────────────────────────────────────────────────────────
export const feedbackApi = baseApi.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    submitFeedback: builder.mutation<FeedbackResponse, FeedbackPayload>({
      query: (body) => ({
        url: "/feedback",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Feedback"],
    }),

    getPublicTestimonials: builder.query<TestimonialsResponse, void>({
      query: () => "/feedback/public",
      providesTags: ["Feedback"],
    }),
  }),
});

export const { useSubmitFeedbackMutation, useGetPublicTestimonialsQuery } =
  feedbackApi;
