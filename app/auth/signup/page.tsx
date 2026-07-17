"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, BookOpen, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";

const passwordRules = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "Contains a number", test: (p: string) => /\d/.test(p) },
  { label: "Contains uppercase", test: (p: string) => /[A-Z]/.test(p) },
];

export default function SignUpPage() {
  const router = useRouter();
  const { register, isRegisterLoading } = useAuth();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    studentId: "",
    password: "",
    confirmPassword: "",
  });
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<1 | 2>(1);

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.firstName || !form.lastName || !form.studentId) {
      setError("Please fill in all fields.");
      return;
    }
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    try {
      const { confirmPassword, ...payload } = form;
      void confirmPassword;
      await register(payload);
      router.push("/auth/signin?registered=1");
    } catch (err: unknown) {
      const e = err as { data?: { message?: string; error?: { message?: string } } };
      const msg =
        e?.data?.error?.message ??
        e?.data?.message ??
        "Registration failed. Please try again.";
      setError(msg);
    }
  };

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

          <h2 className="text-4xl font-extrabold leading-tight mb-4">
            Join the Norton University Library
          </h2>
          <p className="text-white/70 leading-relaxed mb-10">
            Create your free student account and get instant access to thousands
            of academic resources.
          </p>

          {/* Step indicators on left panel */}
          <div className="space-y-4 text-left">
            {[
              { n: 1, title: "Personal Info", sub: "Name & Student ID" },
              { n: 2, title: "Account Setup", sub: "Email & Password" },
            ].map(({ n, title, sub }) => (
              <div
                key={n}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${step === n
                    ? "bg-white/15 border-white/30"
                    : step > n
                      ? "bg-white/10 border-white/15"
                      : "bg-transparent border-white/10 opacity-50"
                  }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${step > n
                      ? "bg-green-400 text-white"
                      : step === n
                        ? "bg-[#DF900A] text-white"
                        : "bg-white/10 text-white/60"
                    }`}
                >
                  {step > n ? <CheckCircle2 className="w-4 h-4" /> : n}
                </div>
                <div>
                  <p className="font-semibold text-sm text-white">{title}</p>
                  <p className="text-xs text-white/60">{sub}</p>
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

          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-8">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">
                  Step {step} of 2
                </span>
                <div className="flex-1 h-1 rounded-full bg-[#E2E8F0]">
                  <div
                    className="h-full rounded-full bg-[#20659C] transition-all duration-500"
                    style={{ width: step === 1 ? "50%" : "100%" }}
                  />
                </div>
              </div>
              <h1 className="text-2xl font-extrabold text-[#1A1A1A] mt-3">
                {step === 1 ? "Personal Information" : "Account Setup"}
              </h1>
              <p className="text-sm text-[#5E5E5E] mt-1">
                Already have an account?{" "}
                <Link
                  href="/auth/signin"
                  className="text-[#20659C] font-semibold hover:text-[#55B9EA] transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>

            {/* Error banner */}
            {error && (
              <div className="flex items-start gap-2.5 mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* ── Step 1 ── */}
            {step === 1 && (
              <form onSubmit={handleNext} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      required
                      autoFocus
                      placeholder="Sokha"
                      value={form.firstName}
                      onChange={(e) => update("firstName", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      required
                      placeholder="Chan"
                      value={form.lastName}
                      onChange={(e) => update("lastName", e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">
                    Student ID <span className="text-red-500">*</span>
                  </label>
                  <Input
                    required
                    placeholder="e.g. NU2024001"
                    value={form.studentId}
                    onChange={(e) => update("studentId", e.target.value)}
                  />
                  <p className="text-xs text-[#9CA3AF] mt-1">
                    Found on your student card or university portal.
                  </p>
                </div>

                <Button type="submit" size="lg" className="w-full mt-2">
                  Continue →
                </Button>
              </form>
            )}

            {/* ── Step 2 ── */}
            {step === 2 && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">
                    Username <span className="text-red-500">*</span>
                  </label>
                  <Input
                    required
                    autoFocus
                    placeholder="sokha_chan"
                    value={form.username}
                    onChange={(e) => update("username", e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <Input
                    required
                    type="email"
                    placeholder="sokha@student.norton.edu.kh"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Input
                      required
                      type={showPw ? "text" : "password"}
                      placeholder="Create a strong password"
                      value={form.password}
                      onChange={(e) => update("password", e.target.value)}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#5E5E5E]"
                    >
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {/* Password strength indicators */}
                  {form.password && (
                    <div className="mt-2 space-y-1">
                      {passwordRules.map(({ label, test }) => (
                        <div key={label} className="flex items-center gap-2">
                          <CheckCircle2
                            className={`w-3.5 h-3.5 ${test(form.password)
                                ? "text-green-500"
                                : "text-[#E2E8F0]"
                              }`}
                          />
                          <span
                            className={`text-xs ${test(form.password)
                                ? "text-green-600"
                                : "text-[#9CA3AF]"
                              }`}
                          >
                            {label}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Input
                      required
                      type={showConfirm ? "text" : "password"}
                      placeholder="Repeat your password"
                      value={form.confirmPassword}
                      onChange={(e) => update("confirmPassword", e.target.value)}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#5E5E5E]"
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {form.confirmPassword && form.password !== form.confirmPassword && (
                    <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                  )}
                </div>

                <div className="flex gap-3 mt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="flex-1"
                    onClick={() => { setStep(1); setError(""); }}
                  >
                    ← Back
                  </Button>
                  <Button
                    type="submit"
                    size="lg"
                    className="flex-1"
                    disabled={isRegisterLoading}
                  >
                    {isRegisterLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </div>
              </form>
            )}

            <p className="text-xs text-center text-[#9CA3AF] mt-6">
              Copyright © 2026 E-Library. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
