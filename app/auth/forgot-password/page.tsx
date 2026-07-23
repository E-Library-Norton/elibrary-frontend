"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Mail, Lock, Eye, EyeOff,
  ArrowLeft, Loader2, AlertCircle, CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { passwordSchema } from "@/lib/auth-schemas";

type Step = "email" | "otp" | "password" | "done";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [step, setStep]                 = useState<Step>("email");
  const [email, setEmail]               = useState("");
  const [sessionToken, setSessionToken] = useState("");
  const [resetToken, setResetToken]     = useState("");
  const [otp, setOtp]                   = useState(["", "", "", "", "", ""]);
  const [password, setPassword]         = useState("");
  const [confirm, setConfirm]           = useState("");
  const [showPw, setShowPw]             = useState(false);
  const [showCpw, setShowCpw]           = useState(false);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState("");
  const [emailStatus, setEmailStatus]   = useState<"idle" | "checking" | "exists" | "missing">("idle");
  const [resendCooldown, setResendCooldown] = useState(0);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  useEffect(() => {
    if (step === "otp") otpRefs.current[0]?.focus();
  }, [step]);

  useEffect(() => {
    if (step !== "email") return;
    const value = email.trim();
    setError("");
    if (!/^\S+@\S+\.\S+$/.test(value)) { setEmailStatus("idle"); return; }

    const controller = new AbortController();
    setEmailStatus("checking");
    const timer = setTimeout(async () => {
      try {
        const res = await fetch("/api/auth/check-reset-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: value }),
          signal: controller.signal,
        });
        const data = await res.json();
        setEmailStatus(res.ok && data.data?.exists ? "exists" : "missing");
      } catch (err) {
        if (!(err instanceof Error && err.name === "AbortError")) setEmailStatus("missing");
      }
    }, 500);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [email, step]);

  // Password strength
  const strength = (() => {
    if (!password) return 0;
    let s = 0;
    if (password.length >= 8 && password.length <= 20) s++;
    if (/[a-z]/.test(password))          s++;
    if (/[A-Z]/.test(password))          s++;
    if (/[0-9]/.test(password))          s++;
    if (/[^A-Za-z0-9\s]/.test(password)) s++;
    return s;
  })();
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong", "Very Strong"][strength];
  const strengthColor = ["", "bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-green-400", "bg-green-500"][strength];

  // OTP input helpers
  const handleOtpChange = (i: number, val: string) => {
    const digit = val.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[i] = digit;
    setOtp(next);
    if (digit && i < 5) otpRefs.current[i + 1]?.focus();
  };
  const handleOtpKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus();
  };
  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) { setOtp(pasted.split("")); otpRefs.current[5]?.focus(); }
    e.preventDefault();
  };

  // Step 1: Send OTP
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res  = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Failed to send code."); return; }
      const token = data.data?.sessionToken ?? "";
      if (!token) { setError("This email is not registered."); return; }
      setSessionToken(token);
      setStep("otp");
      setResendCooldown(60);
    } catch { setError("Network error. Please try again."); }
    finally   { setLoading(false); }
  };

  // Resend
  const handleResend = async () => {
    if (resendCooldown > 0 || loading) return;
    setError("");
    setOtp(["", "", "", "", "", ""]);
    setLoading(true);
    try {
      const res  = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      const token = data.data?.sessionToken ?? "";
      if (!res.ok || !token) { setError(data.message || "This email is not registered."); return; }
      setSessionToken(token);
      setResendCooldown(60);
      otpRefs.current[0]?.focus();
    } catch { setError("Network error. Please try again."); }
    finally { setLoading(false); }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 6) { setError("Enter the full 6-digit code."); return; }
    if (!sessionToken) {
      setError("No code was sent to this email. Please go back and use a registered email address.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res  = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionToken, otp: code }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Invalid or expired code."); return; }
      setResetToken(data.data?.resetToken ?? "");
      setStep("password");
    } catch { setError("Network error. Please try again."); }
    finally   { setLoading(false); }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError("Passwords do not match."); return; }
    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      setError(passwordResult.error.issues[0].message);
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res  = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resetToken, password, confirmPassword: confirm }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Failed to reset password."); return; }
      setStep("done");
    } catch { setError("Network error. Please try again."); }
    finally   { setLoading(false); }
  };

  // Step labels for progress bar
  const steps = [
    { key: "email",    label: "Email" },
    { key: "otp",      label: "Verify" },
    { key: "password", label: "Password" },
  ];
  const stepIndex = ({ email: 0, otp: 1, password: 2, done: 3 } as Record<Step, number>)[step];

  return (
    <div className="relative min-h-screen flex overflow-hidden">
      {/* Full-page background */}
      <img src="/nu-building.jpg" alt="Norton University" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-br from-[#0d3a61]/85 via-[#1a5287]/75 to-[#20659C]/65" />

      {/* ── Left decorative panel ── */}
      <div className="hidden lg:flex lg:w-1/2 relative z-10 flex-col items-center justify-center p-12">

        <div className="relative z-10 text-center text-white max-w-sm">
          <div className="flex items-center justify-center gap-3 mb-10">
            <div className="w-12 h-12 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center">
                         <img src="/logo.webp" alt="E-Library Norton" width={40} height={40} className="w-full h-full object-contain" />
            </div>
            <span className="text-2xl font-extrabold">
              E-Library<span className="text-[#DF900A]"> Norton</span>
            </span>
          </div>

          <h2 className="text-3xl font-extrabold leading-tight mb-3">Reset Your Password</h2>
          <p className="text-white/70 leading-relaxed mb-10">
            We&apos;ll send a 6-digit verification code to your email. It only takes a minute.
          </p>

          <div className="space-y-3 text-left">
            {[
              { num: 1, title: "Enter your email",        sub: "We'll send a 6-digit code" },
              { num: 2, title: "Enter verification code", sub: "Check your inbox" },
              { num: 3, title: "Set new password",        sub: "Choose a strong one" },
            ].map((s) => (
              <div
                key={s.num}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all ${
                  stepIndex + 1 >= s.num
                    ? "bg-white/15 border border-white/20"
                    : "bg-white/5 border border-white/10 opacity-50"
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                  stepIndex + 1 > s.num  ? "bg-green-400 text-white" :
                  stepIndex + 1 === s.num ? "bg-[#DF900A] text-white" :
                  "bg-white/20 text-white/60"
                }`}>
                  {stepIndex + 1 > s.num ? "✓" : s.num}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{s.title}</p>
                  <p className="text-xs text-white/60">{s.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
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

          {/* Progress steps */}
          {step !== "done" && (
            <div className="flex items-center justify-center gap-2 mb-6">
              {steps.map((s, i) => (
                <React.Fragment key={s.key}>
                  <div className="flex items-center gap-1.5">
                    <div className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center transition-all ${
                      i < stepIndex ? "bg-green-500 text-white" :
                      i === stepIndex ? "bg-[#20659C] text-white" :
                      "bg-gray-200 dark:bg-gray-700 text-gray-400"
                    }`}>
                      {i < stepIndex ? "✓" : i + 1}
                    </div>
                    <span className={`text-xs font-medium hidden sm:block ${
                      i === stepIndex
                        ? "text-[#20659C] dark:text-white"
                        : "text-gray-400 dark:text-gray-600"
                    }`}>{s.label}</span>
                  </div>
                  {i < steps.length - 1 && (
                    <div className={`h-0.5 w-10 sm:w-16 rounded-full transition-all ${
                      i < stepIndex ? "bg-green-500" : "bg-gray-200 dark:bg-gray-700"
                    }`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          )}

          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-[#E2E8F0] dark:border-gray-800 shadow-sm p-8">

            {/* Error banner */}
            {error && (
              <div className="flex items-start gap-2.5 mb-5 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* ── STEP 1: Email ── */}
            {step === "email" && (
              <>
                <div className="mb-7">
                  <h1 className="text-2xl font-extrabold text-[#1A1A1A] dark:text-white">Forgot Password</h1>
                  <p className="text-sm text-[#5E5E5E] dark:text-gray-400 mt-1">
                    Enter your email and we&apos;ll send a 6-digit verification code.
                  </p>
                </div>
                <form onSubmit={handleSendCode} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-[#1A1A1A] dark:text-white mb-1.5">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                      <Input
                        required autoFocus type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    {emailStatus === "checking" && <p className="mt-1.5 text-xs text-[#5E5E5E] dark:text-gray-400">Checking email...</p>}
                    {emailStatus === "exists" && <p className="mt-1.5 text-xs text-green-600">Email found. You can send the code.</p>}
                    {emailStatus === "missing" && <p className="mt-1.5 text-xs text-red-500">This email is not registered.</p>}
                  </div>
                  <Button type="submit" size="lg" className="w-full gap-2" disabled={loading || emailStatus !== "exists"}>
                    {loading
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending Code...</>
                      : <><Mail className="w-4 h-4" /> Send 6-Digit Code</>}
                  </Button>
                </form>
                <div className="mt-6 text-center">
                  <Link href="/auth/signin" className="inline-flex items-center gap-1.5 text-sm text-[#5E5E5E] dark:text-gray-400 hover:text-[#20659C] dark:hover:text-white transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Sign In
                  </Link>
                </div>
              </>
            )}

            {/* ── STEP 2: OTP ── */}
            {step === "otp" && (
              <>
                <div className="mb-7">
                  <h1 className="text-2xl font-extrabold text-[#1A1A1A] dark:text-white">Enter Verification Code</h1>
                  <p className="text-sm text-[#5E5E5E] dark:text-gray-400 mt-1">
                    We sent a 6-digit code to{" "}
                    <span className="font-semibold text-[#20659C]">{email}</span>
                  </p>
                </div>

                <form onSubmit={handleVerifyOtp} className="space-y-6">
                  {/* 6 individual digit boxes */}
                  <div className="flex gap-2 justify-center" onPaste={handleOtpPaste}>
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        ref={(el) => { otpRefs.current[i] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        className={`w-12 h-14 text-center text-xl font-bold rounded-xl border-2 transition-all outline-none
                          ${digit
                            ? "border-[#20659C] bg-[#20659C]/5 dark:bg-[#20659C]/10 text-[#20659C] dark:text-white"
                            : "border-[#E2E8F0] dark:border-gray-700 bg-white dark:bg-gray-800 text-[#1A1A1A] dark:text-white"
                          }
                          focus:border-[#20659C] focus:ring-2 focus:ring-[#20659C]/20`}
                      />
                    ))}
                  </div>

                  <Button
                    type="submit" size="lg" className="w-full gap-2"
                    disabled={loading || otp.join("").length < 6}
                  >
                    {loading
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</>
                      : "Verify Code →"}
                  </Button>
                </form>

                <div className="mt-5 text-center space-y-2">
                  <p className="text-sm text-[#5E5E5E] dark:text-gray-400">
                    Didn&apos;t receive it?{" "}
                    {resendCooldown > 0 ? (
                      <span className="text-[#9CA3AF]">Resend in {resendCooldown}s</span>
                    ) : (
                      <button
                        onClick={handleResend}
                        disabled={loading}
                        className="text-[#20659C] font-semibold hover:text-[#55B9EA] transition-colors"
                      >
                        Resend code
                      </button>
                    )}
                  </p>
                  <button
                    onClick={() => { setStep("email"); setOtp(["","","","","",""]); setError(""); }}
                    className="inline-flex items-center gap-1.5 text-xs text-[#9CA3AF] hover:text-[#5E5E5E] dark:hover:text-gray-300 transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Change email
                  </button>
                </div>
              </>
            )}

            {/* ── STEP 3: New Password ── */}
            {step === "password" && (
              <>
                <div className="mb-7">
                  <h1 className="text-2xl font-extrabold text-[#1A1A1A] dark:text-white">Set New Password</h1>
                  <p className="text-sm text-[#5E5E5E] dark:text-gray-400 mt-1">Choose a strong password for your account.</p>
                </div>
                <form onSubmit={handleResetPassword} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-[#1A1A1A] dark:text-white mb-1.5">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                      <Input
                        required autoFocus
                        type={showPw ? "text" : "password"}
                        placeholder="Enter new password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw(!showPw)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#5E5E5E] transition-colors"
                      >
                        {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {password && (
                      <div className="mt-2 space-y-1">
                        <div className="flex gap-1">
                          {[1,2,3,4,5].map((i) => (
                            <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= strength ? strengthColor : "bg-gray-200 dark:bg-gray-700"}`} />
                          ))}
                        </div>
                        <p className="text-xs text-[#9CA3AF]">Strength: <span className="font-semibold">{strengthLabel}</span></p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#1A1A1A] dark:text-white mb-1.5">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                      <Input
                        required
                        type={showCpw ? "text" : "password"}
                        placeholder="Confirm new password"
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        className={`pl-10 pr-10 ${
                          confirm && password !== confirm ? "border-red-400" :
                          confirm && password === confirm ? "border-green-400" : ""
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowCpw(!showCpw)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#5E5E5E] transition-colors"
                      >
                        {showCpw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {confirm && password !== confirm && (
                      <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                    )}
                    {confirm && password === confirm && (
                      <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Passwords match
                      </p>
                    )}
                  </div>

                  <Button type="submit" size="lg" className="w-full gap-2" disabled={loading}>
                    {loading
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Resetting...</>
                      : <><Lock className="w-4 h-4" /> Reset Password</>}
                  </Button>
                </form>
              </>
            )}

            {/* ── DONE ── */}
            {step === "done" && (
              <div className="text-center py-4">
                <div className="w-20 h-20 rounded-2xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-extrabold text-[#1A1A1A] dark:text-white mb-2">
                  Password Reset!
                </h2>
                <p className="text-[#5E5E5E] dark:text-gray-400 text-sm leading-relaxed mb-8">
                  Your password has been updated successfully. You can now sign in with your new password.
                </p>
                <Button className="w-full gap-2" onClick={() => router.push("/auth/signin")}>
                  <CheckCircle2 className="w-4 h-4" /> Sign In Now
                </Button>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
