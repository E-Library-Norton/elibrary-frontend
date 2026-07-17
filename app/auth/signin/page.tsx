// src/app/auth/signin/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, AlertCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 2 * 60 * 1000; // 2 minutes — mirrors backend window

function getLockoutKey(identifier: string) {
  return `login_lockout_${identifier.toLowerCase().trim()}`;
}
function getStoredLockout(identifier: string): { until: number; attempts: number } | null {
  try { const raw = sessionStorage.getItem(getLockoutKey(identifier)); return raw ? JSON.parse(raw) : null; }
  catch { return null; }
}
function setStoredLockout(identifier: string, attempts: number, until: number) {
  try { sessionStorage.setItem(getLockoutKey(identifier), JSON.stringify({ until, attempts })); }
  catch { }
}
function clearStoredLockout(identifier: string) {
  try { sessionStorage.removeItem(getLockoutKey(identifier)); } catch { }
}

export default function SignInPage() {
  const router = useRouter();
  const { login, isLoginLoading } = useAuth();

  const [form, setForm] = useState({ identifier: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");

  // ── Client-side brute-force lockout 
  const [attemptCount, setAttemptCount] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [countdown, setCountdown] = useState(0);

  // Restore lockout from sessionStorage when identifier changes
  useEffect(() => {
    const stored = getStoredLockout(form.identifier);
    if (stored && stored.until > Date.now()) {
      setLockedUntil(stored.until);
      setAttemptCount(stored.attempts);
    } else {
      setLockedUntil(null);
    }
  }, [form.identifier]);

  // Countdown ticker
  useEffect(() => {
    if (!lockedUntil) return;
    const tick = () => {
      const remaining = Math.ceil((lockedUntil - Date.now()) / 1000);
      if (remaining <= 0) { setLockedUntil(null); setAttemptCount(0); setError(""); }
      else setCountdown(remaining);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [lockedUntil]);

  const recordFailure = useCallback((identifier: string) => {
    const stored = getStoredLockout(identifier);
    const newCount = (stored?.attempts ?? 0) + 1;
    const until = newCount >= MAX_ATTEMPTS ? Date.now() + LOCKOUT_MS : (stored?.until ?? 0);
    setAttemptCount(newCount);
    if (newCount >= MAX_ATTEMPTS) setLockedUntil(until);
    setStoredLockout(identifier, newCount, until);
  }, []);

  const isLocked = !!lockedUntil && lockedUntil > Date.now();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (isLocked) return;
    try {
      await login(form);
      clearStoredLockout(form.identifier);
      setAttemptCount(0);
      router.push("/");
    } catch (err: unknown) {
      const e = err as { status?: number; data?: { message?: string; error?: { message?: string } } };
      if (e?.status === 429) {
        // Backend rate-limited — lock the UI for the full window
        const until = Date.now() + LOCKOUT_MS;
        setLockedUntil(until);
        setAttemptCount(MAX_ATTEMPTS);
        setStoredLockout(form.identifier, MAX_ATTEMPTS, until);
        setError("");
        return;
      }
      recordFailure(form.identifier);
      const msg =
        e?.data?.error?.message ??
        e?.data?.message ??
        "Something went wrong. Please try again.";
      setError(msg);
    }
  };

  return (
    <div className="relative min-h-screen flex overflow-hidden">
      {/* Full-page background */}
      <img src="/nu-building.jpg" alt="Norton University" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-br from-[#0d3a61]/85 via-[#1a5287]/75 to-[#20659C]/65" />

      {/* ── Left panel (decorative) ── */}
      <div className="hidden lg:flex lg:w-1/2 relative z-10 flex-col items-center justify-center p-12">

        <div className="relative z-10 text-center text-white max-w-sm">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-10">
            <div className="w-12 h-12 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center">
              <img src="/logo.webp" alt="E-Library Norton" width={40} height={40} className="w-full h-full object-contain" />

            </div>
            <span className="text-2xl font-extrabold">
              E-Library<span className="text-[#DF900A]"> Norton</span>
            </span>
          </div>

          <h2 className="text-4xl font-extrabold leading-tight mb-4">
            Welcome Back to Your Library
          </h2>
          <p className="text-white/70 leading-relaxed mb-10">
            Access 15,000+ academic books, journals and research papers — all
            in one place, free for Norton University students.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-2">
            {["15,000+ Books", "24/7 Access", "Free Downloads", "All Departments"].map(
              (f) => (
                <span
                  key={f}
                  className="px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-medium text-white/90"
                >
                  {f}
                </span>
              )
            )}
          </div>
        </div>
      </div>

      {/* ── Right panel (form) ── */}
      <div className="flex-1 relative z-10 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center justify-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-lg bg-[#20659C] flex items-center justify-center">
              <img src="/logo.webp" alt="E-Library Norton" width={40} height={40} className="w-full h-full object-contain" />
            </div>
            <span className="text-xl font-bold text-[#20659C]">
              E-Library<span className="text-[#DF900A]"> Norton</span>
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-8">
            <div className="mb-7">
              <h1 className="text-2xl font-extrabold text-[#1A1A1A]">Sign In</h1>
              <p className="text-sm text-[#5E5E5E] mt-1">
                Don&apos;t have an account?{" "}
                <Link
                  href="/auth/signup"
                  className="text-[#20659C] font-semibold hover:text-[#55B9EA] transition-colors"
                >
                  Sign up free
                </Link>
              </p>
            </div>

            {/* Lockout banner */}
            {isLocked && (
              <div className="flex items-start gap-2.5 mb-5 px-4 py-3 rounded-xl bg-orange-50 border border-orange-200 text-orange-700 text-sm">
                <Clock className="w-4 h-4 mt-0.5 shrink-0" />
                <span>
                  Too many failed attempts. Try again in{" "}
                  <span className="font-semibold">
                    {Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, "0")}
                  </span>.
                </span>
              </div>
            )}

            {/* Failed-attempt warning */}
            {!isLocked && attemptCount > 0 && attemptCount < MAX_ATTEMPTS && (
              <p className="text-center text-yellow-600 text-xs mb-4">
                {MAX_ATTEMPTS - attemptCount} attempt{MAX_ATTEMPTS - attemptCount !== 1 ? "s" : ""} remaining before lockout
              </p>
            )}

            {/* Error banner */}
            {error && (
              <div className="flex items-start gap-2.5 mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Identifier */}
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">
                  Username / Email / Student ID
                </label>
                <Input
                  required
                  autoFocus
                  placeholder="Enter your username, email or student ID"
                  value={form.identifier}
                  onChange={(e) => setForm({ ...form, identifier: e.target.value })}
                />
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-medium text-[#1A1A1A]">
                    Password
                  </label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-xs text-[#20659C] hover:text-[#55B9EA] transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    required
                    type={showPw ? "text" : "password"}
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#5E5E5E] transition-colors"
                  >
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                size="lg"
                className="w-full mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoginLoading || isLocked}
              >
                {isLoginLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing in...
                  </>
                ) : isLocked ? (
                  <>
                    <Clock className="w-4 h-4" />
                    Locked — {Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, "0")}
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            {/* ── Divider ── */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-[#E2E8F0]" />
              <span className="text-xs text-[#9CA3AF] font-medium">Or continue with</span>
              <div className="flex-1 h-px bg-[#E2E8F0]" />
            </div>

            {/* ── Social Login Buttons ── */}
            <div className="grid grid-cols-3 gap-3">
              {/* Google */}
              <button
                type="button"
                onClick={() => window.location.href = "/api/auth/google"}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] hover:border-[#D1D5DB] transition-all duration-200 shadow-sm group"
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                <span className="text-xs font-semibold text-[#374151] hidden sm:block">Google</span>
              </button>

              {/* Facebook */}
              <button
                type="button"
                onClick={() => window.location.href = "/api/auth/facebook"}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[#E2E8F0] bg-white hover:bg-[#F0F7FF] hover:border-[#1877F2]/30 transition-all duration-200 shadow-sm group"
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="#1877F2">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span className="text-xs font-semibold text-[#374151] hidden sm:block">Facebook</span>
              </button>

              {/* GitHub */}
              <button
                type="button"
                onClick={() => window.location.href = "/api/auth/github"}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[#E2E8F0] bg-white hover:bg-[#F6F8FA] hover:border-[#24292E]/30 transition-all duration-200 shadow-sm group"
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="#24292E">
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                </svg>
                <span className="text-xs font-semibold text-[#374151] hidden sm:block">GitHub</span>
              </button>
            </div>

            <p className="text-xs text-center text-[#9CA3AF] mt-6">
              Copyright © 2026 E-Library. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
