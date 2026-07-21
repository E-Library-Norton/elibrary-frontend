"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { useAppDispatch } from "@/lib/hooks";
import { setCredentials } from "@/store/slices/authSlice";
import { hydrateLibrary } from "@/store/slices/librarySlice";
import {
  consumeOAuthReturnPath,
  getSafeAuthRedirect,
  withAuthRedirect,
} from "@/lib/auth-navigation";

function OAuthCallbackInner() {
  const router       = useRouter();
  const params       = useSearchParams();
  const dispatch     = useAppDispatch();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const error        = params.get("error");
    const accessToken  = params.get("accessToken");
    const refreshToken = params.get("refreshToken");
    const storedReturnPath = consumeOAuthReturnPath();
    const returnPath = getSafeAuthRedirect(
      params.get("next") ?? storedReturnPath
    );
    const signInPath = withAuthRedirect("/auth/signin", returnPath);

    if (error || !accessToken || !refreshToken) {
      setStatus("error");
      setMessage("OAuth sign-in was cancelled or failed. Please try again.");
      setTimeout(() => router.replace(signInPath), 3000);
      return;
    }

    (async () => {
      try {
        const res = await fetch("/api/auth/oauth-callback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accessToken, refreshToken }),
        });
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.message || "Failed to set session");
        }

        // Hydrate Redux auth store
        dispatch(setCredentials(data.data));
        if (data.data?.id) dispatch(hydrateLibrary(data.data.id));

        setStatus("success");
        setMessage("Signed in successfully! Redirecting…");
        setTimeout(() => router.replace(returnPath), 1000);
      } catch (err: unknown) {
        const e = err as Error;
        setStatus("error");
        setMessage(e.message || "Something went wrong. Please try again.");
        setTimeout(() => router.replace(signInPath), 3000);
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0d3a61] via-[#1a5287] to-[#20659C]">
      <div className="bg-white rounded-2xl shadow-xl p-10 max-w-sm w-full mx-4 text-center">
        {status === "loading" && (
          <>
            <Loader2 className="w-12 h-12 text-[#20659C] animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-bold text-[#1A1A1A] mb-1">Signing you in…</h2>
            <p className="text-sm text-[#5E5E5E]">Please wait while we set up your session.</p>
          </>
        )}
        {status === "success" && (
          <>
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-[#1A1A1A] mb-1">Welcome!</h2>
            <p className="text-sm text-[#5E5E5E]">{message}</p>
          </>
        )}
        {status === "error" && (
          <>
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-[#1A1A1A] mb-1">Sign-in failed</h2>
            <p className="text-sm text-[#5E5E5E]">{message}</p>
            <p className="text-xs text-[#9CA3AF] mt-2">Redirecting back to sign-in…</p>
          </>
        )}
      </div>
    </div>
  );
}

export default function OAuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0d3a61] via-[#1a5287] to-[#20659C]">
        <div className="bg-white rounded-2xl shadow-xl p-10 max-w-sm w-full mx-4 text-center">
          <Loader2 className="w-12 h-12 text-[#20659C] animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[#1A1A1A] mb-1">Signing you in…</h2>
          <p className="text-sm text-[#5E5E5E]">Please wait while we set up your session.</p>
        </div>
      </div>
    }>
      <OAuthCallbackInner />
    </Suspense>
  );
}
