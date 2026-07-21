"use client";

import React, { Suspense, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { FormFieldError } from "@/components/auth/FormFieldError";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { getSafeAuthRedirect, withAuthRedirect } from "@/lib/auth-navigation";
import {
  getFieldErrors,
  signUpPersonalSchema,
  signUpSchema,
  type FieldErrors,
  type SignUpField,
  type SignUpValues,
} from "@/lib/auth-schemas";
import { cn } from "@/lib/utils";

const passwordRules = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "Contains a number", test: (p: string) => /\d/.test(p) },
  { label: "Contains uppercase", test: (p: string) => /[A-Z]/.test(p) },
];

function SignUpPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register, isRegisterLoading } = useAuth();
  const returnPath = getSafeAuthRedirect(searchParams.get("next"));
  const signInHref = withAuthRedirect("/auth/signin", returnPath);

  const [form, setForm] = useState<SignUpValues>({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    studentId: "",
    password: "",
    confirmPassword: "",
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<SignUpField>>({});
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<1 | 2>(1);

  const update = (field: SignUpField, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
    setError("");
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const result = signUpPersonalSchema.safeParse(form);

    if (!result.success) {
      setFieldErrors((current) => ({
        ...current,
        ...getFieldErrors<SignUpField>(result.error),
      }));
      return;
    }

    setFieldErrors((current) => ({
      ...current,
      firstName: undefined,
      lastName: undefined,
      studentId: undefined,
    }));
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const result = signUpSchema.safeParse(form);

    if (!result.success) {
      setFieldErrors(getFieldErrors<SignUpField>(result.error));
      return;
    }

    setFieldErrors({});
    try {
      const { confirmPassword, ...payload } = result.data;
      void confirmPassword;
      await register(payload);
      router.replace(
        withAuthRedirect("/auth/signin?registered=1", returnPath)
      );
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
      <Image
        src="/nu-building.jpg"
        alt="Norton University"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-[#0d3a61]/85 via-[#1a5287]/75 to-[#20659C]/65" />

      {/* ── Left decorative panel ── */}
      <div className="hidden lg:flex lg:w-1/2 relative z-10 flex-col items-center justify-center p-12">

        <div className="relative z-10 text-center text-white max-w-sm">
          <div className="flex items-center justify-center gap-3 mb-10">
            <div className="w-12 h-12 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center">
              <Image
                src="/logo.webp"
                alt="E-Library Norton"
                width={48}
                height={48}
                className="h-full w-full object-contain"
              />
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
              <Image
                src="/logo.webp"
                alt="E-Library Norton"
                width={36}
                height={36}
                className="h-full w-full object-contain"
              />
            </div>
            <span className="text-xl font-bold text-white">
              E-Library<span className="text-[#DF900A]"> Norton</span>
            </span>
          </div>

          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-900/95 dark:shadow-2xl dark:shadow-black/30">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#9CA3AF] dark:text-gray-400">
                  Step {step} of 2
                </span>
                <div className="h-1 flex-1 rounded-full bg-[#E2E8F0] dark:bg-gray-700">
                  <div
                    className="h-full rounded-full bg-[#20659C] transition-all duration-500"
                    style={{ width: step === 1 ? "50%" : "100%" }}
                  />
                </div>
              </div>
              <h1 className="mt-3 text-2xl font-extrabold text-[#1A1A1A] dark:text-white">
                {step === 1 ? "Personal Information" : "Account Setup"}
              </h1>
              <p className="mt-1 text-sm text-[#5E5E5E] dark:text-gray-400">
                Already have an account?{" "}
                <Link
                  href={signInHref}
                  className="font-semibold text-[#20659C] transition-colors hover:text-[#55B9EA] dark:text-[#55B9EA] dark:hover:text-sky-300"
                >
                  Sign in
                </Link>
              </p>
            </div>

            {/* Error banner */}
            {error && (
              <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/70 dark:bg-red-950/40 dark:text-red-300">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* ── Step 1 ── */}
            {step === 1 && (
              <form onSubmit={handleNext} noValidate className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-[#1A1A1A] dark:text-gray-100">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      autoFocus
                      placeholder="Sokha"
                      value={form.firstName}
                      onChange={(e) => update("firstName", e.target.value)}
                      aria-invalid={Boolean(fieldErrors.firstName)}
                      aria-describedby={
                        fieldErrors.firstName ? "signup-first-name-error" : undefined
                      }
                      className={cn(
                        fieldErrors.firstName &&
                          "border-red-500 focus-visible:ring-red-500/20"
                      )}
                    />
                    <FormFieldError
                      id="signup-first-name-error"
                      message={fieldErrors.firstName}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-[#1A1A1A] dark:text-gray-100">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="Chan"
                      value={form.lastName}
                      onChange={(e) => update("lastName", e.target.value)}
                      aria-invalid={Boolean(fieldErrors.lastName)}
                      aria-describedby={
                        fieldErrors.lastName ? "signup-last-name-error" : undefined
                      }
                      className={cn(
                        fieldErrors.lastName &&
                          "border-red-500 focus-visible:ring-red-500/20"
                      )}
                    />
                    <FormFieldError
                      id="signup-last-name-error"
                      message={fieldErrors.lastName}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#1A1A1A] dark:text-gray-100">
                    Student ID <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="e.g. NU2024001"
                    value={form.studentId}
                    onChange={(e) => update("studentId", e.target.value)}
                    aria-invalid={Boolean(fieldErrors.studentId)}
                    aria-describedby={
                      fieldErrors.studentId ? "signup-student-id-error" : undefined
                    }
                    className={cn(
                      fieldErrors.studentId &&
                        "border-red-500 focus-visible:ring-red-500/20"
                    )}
                  />
                  <FormFieldError
                    id="signup-student-id-error"
                    message={fieldErrors.studentId}
                  />
                  <p className="mt-1 text-xs text-[#9CA3AF] dark:text-gray-500">
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
              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#1A1A1A] dark:text-gray-100">
                    Username <span className="text-red-500">*</span>
                  </label>
                  <Input
                    autoFocus
                    placeholder="sokha_chan"
                    value={form.username}
                    onChange={(e) => update("username", e.target.value)}
                    aria-invalid={Boolean(fieldErrors.username)}
                    aria-describedby={
                      fieldErrors.username ? "signup-username-error" : undefined
                    }
                    className={cn(
                      fieldErrors.username &&
                        "border-red-500 focus-visible:ring-red-500/20"
                    )}
                  />
                  <FormFieldError
                    id="signup-username-error"
                    message={fieldErrors.username}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#1A1A1A] dark:text-gray-100">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="email"
                    placeholder="sokha@student.norton.edu.kh"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    aria-invalid={Boolean(fieldErrors.email)}
                    aria-describedby={
                      fieldErrors.email ? "signup-email-error" : undefined
                    }
                    className={cn(
                      fieldErrors.email &&
                        "border-red-500 focus-visible:ring-red-500/20"
                    )}
                  />
                  <FormFieldError
                    id="signup-email-error"
                    message={fieldErrors.email}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#1A1A1A] dark:text-gray-100">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Input
                      type={showPw ? "text" : "password"}
                      placeholder="Create a strong password"
                      value={form.password}
                      onChange={(e) => update("password", e.target.value)}
                      aria-invalid={Boolean(fieldErrors.password)}
                      aria-describedby={
                        fieldErrors.password ? "signup-password-error" : undefined
                      }
                      className={cn(
                        "pr-10",
                        fieldErrors.password &&
                          "border-red-500 focus-visible:ring-red-500/20"
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] transition-colors hover:text-[#5E5E5E] dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <FormFieldError
                    id="signup-password-error"
                    message={fieldErrors.password}
                  />
                  {/* Password strength indicators */}
                  {form.password && (
                    <div className="mt-2 space-y-1">
                      {passwordRules.map(({ label, test }) => (
                        <div key={label} className="flex items-center gap-2">
                          <CheckCircle2
                            className={`w-3.5 h-3.5 ${test(form.password)
                                ? "text-green-500 dark:text-green-400"
                                : "text-[#E2E8F0] dark:text-gray-600"
                              }`}
                          />
                          <span
                            className={`text-xs ${test(form.password)
                                ? "text-green-600 dark:text-green-400"
                                : "text-[#9CA3AF] dark:text-gray-500"
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
                  <label className="mb-1.5 block text-sm font-medium text-[#1A1A1A] dark:text-gray-100">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Input
                      type={showConfirm ? "text" : "password"}
                      placeholder="Repeat your password"
                      value={form.confirmPassword}
                      onChange={(e) => update("confirmPassword", e.target.value)}
                      aria-invalid={Boolean(fieldErrors.confirmPassword)}
                      aria-describedby={
                        fieldErrors.confirmPassword
                          ? "signup-confirm-password-error"
                          : undefined
                      }
                      className={cn(
                        "pr-10",
                        fieldErrors.confirmPassword &&
                          "border-red-500 focus-visible:ring-red-500/20"
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] transition-colors hover:text-[#5E5E5E] dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <FormFieldError
                    id="signup-confirm-password-error"
                    message={fieldErrors.confirmPassword}
                  />
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

            <p className="mt-6 text-center text-xs text-[#9CA3AF] dark:text-gray-500">
              Copyright © 2026 E-Library. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#0d3a61]">
          <Loader2 className="w-10 h-10 text-white animate-spin" />
        </div>
      }
    >
      <SignUpPageContent />
    </Suspense>
  );
}
