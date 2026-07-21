"use client";

import React, { useState } from "react";
import { Send, Loader2, MessageSquare, AlertCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useGetBookReviewsQuery,
  useCreateReviewMutation,
  useDeleteReviewMutation,
} from "@/store/api/reviewApi";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";
import { StarRating } from "@/components/ui/star-rating";

// Review form
function ReviewForm({ bookId, onSuccess }: { bookId: string; onSuccess?: () => void }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [createReview, { isLoading, error }] = useCreateReviewMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;
    try {
      await createReview({ bookId, rating, comment: comment.trim() || undefined }).unwrap();
      setRating(0);
      setComment("");
      onSuccess?.();
    } catch {
      // error state handled by RTK Query
    }
  };

  const errMsg =
    error && "data" in error
      ? ((error.data as { message?: string })?.message ?? "Failed to submit review")
      : error
        ? "Failed to submit review"
        : null;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-[#1A1A1A] dark:text-white mb-2">
          Your Rating
        </label>
        <StarRating value={rating} onChange={setRating} />
        {rating === 0 && (
          <p className="text-xs text-[#9CA3AF] mt-1">Click a star to rate</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-[#1A1A1A] dark:text-white mb-2">
          Your Comment <span className="font-normal text-[#9CA3AF]">(optional)</span>
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your thoughts about this book…"
          rows={3}
          maxLength={1000}
          className="w-full rounded-xl border border-[#E2E8F0] dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 px-4 py-3 text-sm placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#20659C]/30 focus:border-[#20659C] transition-all resize-none"
        />
        <p className="text-xs text-[#9CA3AF] mt-1 text-right">{comment.length}/1000</p>
      </div>

      {errMsg && (
        <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {errMsg}
        </div>
      )}

      <Button
        type="submit"
        disabled={rating === 0 || isLoading}
        className="gap-2 bg-[#20659C] hover:bg-[#55B9EA] text-white rounded-xl"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Send className="w-4 h-4" />
        )}
        Submit Review
      </Button>
    </form>
  );
}

// Single review card
function ReviewCard({
  review,
  currentUserId,
  bookId,
}: {
  review: {
    id: number | string;
    rating: number;
    comment: string | null;
    createdAt?: string;
    created_at?: string;
    User?: { id: number | string; firstName: string; lastName: string; username: string; avatar: string | null };
  };
  currentUserId?: number;
  bookId: string;
}) {
  const [deleteReview, { isLoading: deleting }] = useDeleteReviewMutation();
  const u = review.User;
  const initials = u
    ? (u.firstName?.[0] ?? "") + (u.lastName?.[0] ?? "")
    : "??";
  const name = u ? `${u.firstName} ${u.lastName}` : "Anonymous";
  const isOwn = currentUserId != null && String(u?.id) === String(currentUserId);

  return (
    <div className="flex gap-3 py-4 border-b border-[#E2E8F0]/60 dark:border-gray-800/60 last:border-0">
      {/* Avatar */}
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#20659C] to-[#55B9EA] flex items-center justify-center text-white text-xs font-bold shrink-0 ring-2 ring-white dark:ring-gray-950 shadow-sm">
        {u?.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/api/users/${u.id}/avatar`}
            alt={name}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          initials.toUpperCase()
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-[#1A1A1A] dark:text-white">{name}</span>
          <StarRating value={review.rating} readOnly size="sm" />
          <span className="text-xs text-[#9CA3AF]">
            {(() => {
              const raw = review.createdAt || review.created_at;
              if (!raw) return "";
              const d = new Date(raw);
              return isNaN(d.getTime()) ? "" : formatDistanceToNow(d, { addSuffix: true });
            })()}
          </span>
        </div>
        {review.comment && (
          <p className="text-sm text-[#5E5E5E] dark:text-gray-400 mt-1.5 leading-relaxed">
            {review.comment}
          </p>
        )}
        {isOwn && (
          <button
            disabled={deleting}
            onClick={() => deleteReview({ id: Number(review.id), bookId })}
            className="mt-2 flex items-center gap-1 text-xs text-red-500 hover:text-red-600 transition-colors"
          >
            {deleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
            Delete my review
          </button>
        )}
      </div>
    </div>
  );
}

// Main section
export default function ReviewSection({
  bookId,
  onRequestSignIn,
}: {
  bookId: string;
  onRequestSignIn: () => void;
}) {
  const { user, isAuthenticated } = useAuth();
  const { data, isLoading, refetch } = useGetBookReviewsQuery({ bookId });

  const reviews = data?.data?.reviews ?? [];
  const avgRating = data?.data?.averageRating ?? null;
  const totalReviews = data?.data?.totalReviews ?? 0;

  // Check if user already reviewed
  const alreadyReviewed = reviews.some((r) => r.User?.id === user?.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-lg font-bold text-[#1A1A1A] dark:text-white flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-[#20659C]" />
          Reviews & Ratings
        </h2>

        {avgRating !== null && (
          <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl px-4 py-2 border border-amber-200/60 dark:border-amber-800/40">
            <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {avgRating}
            </span>
            <div>
              <StarRating value={Math.round(avgRating)} readOnly size="sm" />
              <p className="text-xs text-[#9CA3AF] mt-0.5">
                {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Write review — only if logged in & hasn't reviewed yet */}
      {isAuthenticated && !alreadyReviewed && (
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-xl border border-[#E2E8F0]/60 dark:border-gray-800/60 p-5">
          <h3 className="text-sm font-semibold text-[#1A1A1A] dark:text-white mb-4">
            Write a Review
          </h3>
          <ReviewForm bookId={bookId} onSuccess={() => refetch()} />
        </div>
      )}

      {isAuthenticated && alreadyReviewed && (
        <div className="text-sm text-[#9CA3AF] bg-[#20659C]/5 dark:bg-[#20659C]/10 rounded-xl px-4 py-3 border border-[#20659C]/10 dark:border-[#20659C]/20">
          ✅ You&apos;ve already reviewed this book. You can delete your review above to submit a new one.
        </div>
      )}

      {!isAuthenticated && (
        <div className="text-sm text-[#9CA3AF] bg-gray-50 dark:bg-gray-900/50 rounded-xl px-4 py-3 border border-[#E2E8F0] dark:border-gray-800">
          <button
            type="button"
            onClick={onRequestSignIn}
            className="text-[#20659C] hover:underline font-medium"
          >
            Sign in
          </button>{" "}
          to leave a review
        </div>
      )}

      {/* Review list */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3 py-4 animate-pulse">
              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded" />
                <div className="h-3 w-3/4 bg-gray-200 dark:bg-gray-800 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-[#9CA3AF] py-6 text-center">
          No reviews yet. Be the first to share your thoughts!
        </p>
      ) : (
        <div>
          {reviews.map((r) => (
            <ReviewCard key={r.id} review={r} currentUserId={user?.id} bookId={bookId} />
          ))}
        </div>
      )}
    </div>
  );
}
