"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Bell, BellOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useGetVapidPublicKeyQuery,
  useSubscribePushMutation,
  useUnsubscribePushMutation,
} from "@/store/api/pushApi";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export function PushNotificationBell() {
  const [subscribed, setSubscribed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [supported, setSupported] = useState(false);
  const { data: vapidData } = useGetVapidPublicKeyQuery();
  const [subscribePush] = useSubscribePushMutation();
  const [unsubscribePush] = useUnsubscribePushMutation();

  const vapidPublicKey = vapidData?.data?.publicKey ?? null;

  // Check if push API is available & register SW
  useEffect(() => {
    const ok =
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      "Notification" in window;
    setSupported(ok);

    if (ok) {
      // Register the service worker (no-op if already registered)
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => reg.pushManager.getSubscription())
        .then((sub) => setSubscribed(!!sub))
        .catch(() => {});
    }
  }, []);

  const handleToggle = useCallback(async () => {
    if (!supported || !vapidPublicKey) return;
    setBusy(true);

    try {
      const reg = await navigator.serviceWorker.ready;
      const existingSub = await reg.pushManager.getSubscription();

      if (existingSub) {
        // Unsubscribe
        await existingSub.unsubscribe();
        await unsubscribePush({ endpoint: existingSub.endpoint }).unwrap();
        setSubscribed(false);
      } else {
        // Request permission
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          setBusy(false);
          return;
        }
        // Subscribe
        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        });
        await subscribePush(sub.toJSON()).unwrap();
        setSubscribed(true);
      }
    } catch (err) {
      console.error("[Push] toggle error:", err);
    } finally {
      setBusy(false);
    }
  }, [supported, vapidPublicKey, subscribePush, unsubscribePush]);

  // Don't render if push not supported or VAPID not configured
  if (!supported || !vapidPublicKey) return null;

  return (
    <button
      onClick={handleToggle}
      disabled={busy}
      title={subscribed ? "Disable push notifications" : "Enable push notifications"}
      className={cn(
        "relative p-2 rounded-lg transition-colors",
        subscribed
          ? "text-[#20659C] dark:text-[#55B9EA] hover:bg-[#20659C]/10 dark:hover:bg-[#20659C]/20"
          : "text-[#9CA3AF] hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-[#5E5E5E] dark:hover:text-gray-300"
      )}
    >
      {busy ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : subscribed ? (
        <Bell className="w-5 h-5" />
      ) : (
        <BellOff className="w-5 h-5" />
      )}
      {subscribed && (
        <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-gray-900" />
      )}
    </button>
  );
}
