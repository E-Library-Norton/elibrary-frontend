// store/api/pushApi.ts
import { baseApi } from "./baseApi";
import type { ApiResponse } from "@/types";

export const pushApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /api/push/vapid-public-key
    getVapidPublicKey: builder.query<ApiResponse<{ publicKey: string | null }>, void>({
      query: () => "/push/vapid-public-key",
    }),

    // POST /api/push/subscribe
    subscribePush: builder.mutation<ApiResponse<{ id: number }>, PushSubscriptionJSON>({
      query: (subscription) => ({
        url: "/push/subscribe",
        method: "POST",
        body: subscription,
      }),
    }),

    // DELETE /api/push/unsubscribe
    unsubscribePush: builder.mutation<ApiResponse<null>, { endpoint: string }>({
      query: (body) => ({
        url: "/push/unsubscribe",
        method: "DELETE",
        body,
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetVapidPublicKeyQuery,
  useSubscribePushMutation,
  useUnsubscribePushMutation,
} = pushApi;
