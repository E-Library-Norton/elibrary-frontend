"use client";

import React, { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";
import { BookOpen, Pencil, Trash2, Star } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

/**
 * Derives the Socket.IO server URL from the Next.js public backend URL.
 * e.g. "http://localhost:5005/api" → "http://localhost:5005"
 */
function getSocketUrl() {
  const base = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:5005/api";
  // Strip /api suffix to get the socket root
  const url = base.replace(/\/api\/?$/, "");
  // On HTTPS pages, force wss:// to avoid mixed-content browser block
  if (typeof window !== "undefined" && window.location.protocol === "https:") {
    return url.replace(/^http:\/\//, "https://");
  }
  return url;
}

/**
 * SocketProvider — connects once to the backend Socket.IO server and
 * displays sonner toasts whenever book-related events arrive.
 *
 * Rendered inside StoreProvider in layout.tsx so it can access auth state.
 */
export function SocketProvider({ children }: { children: React.ReactNode }) {
  const socketRef = useRef<Socket | null>(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // Don't open WebSocket for anonymous visitors / crawlers
    if (!isAuthenticated) return;

    const url = getSocketUrl();
    const socket = io(url, {
      transports: ["websocket", "polling"],
      reconnectionAttempts: 10,
      reconnectionDelay: 3000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("[SocketProvider] connected", socket.id);
    });

    // ── Book created ──────────────────────────────────────────
    socket.on("book:created", (data: { book?: { title?: string } }) => {
      const title = data?.book?.title ?? "Untitled";
      toast("📚 New Book Added", {
        description: `"${title}" is now available in the library.`,
        icon: <BookOpen className="w-4 h-4 text-[#20659C]" />,
        duration: 6000,
      });
    });

    // ── Book updated ──────────────────────────────────────────
    socket.on("book:updated", (data: { book?: { title?: string } }) => {
      const title = data?.book?.title ?? "Untitled";
      toast("✏️ Book Updated", {
        description: `"${title}" has been updated.`,
        icon: <Pencil className="w-4 h-4 text-[#DF900A]" />,
        duration: 5000,
      });
    });

    // ── Book deleted ──────────────────────────────────────────
    socket.on("book:deleted", () => {
      toast("🗑️ Book Removed", {
        description: "A book has been removed from the library.",
        icon: <Trash2 className="w-4 h-4 text-red-500" />,
        duration: 5000,
      });
    });

    // ── Review created ────────────────────────────────────────
    socket.on("review:created", (data: { review?: { rating?: number }; bookTitle?: string; userName?: string }) => {
      const stars = "⭐".repeat(data?.review?.rating ?? 0);
      toast("⭐ New Review", {
        description: `${data?.userName ?? "Someone"} rated "${data?.bookTitle ?? "a book"}" ${stars}`,
        icon: <Star className="w-4 h-4 text-[#DF900A] fill-[#DF900A]" />,
        duration: 6000,
      });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated]);

  return <>{children}</>;
}
