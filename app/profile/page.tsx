"use client";

import { Suspense, useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  User,
  Mail,
  GraduationCap,
  Settings,
  Shield,
  Key,
  Eye,
  EyeOff,
  Camera,
  Pencil,
  Save,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import {
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useUploadAvatarMutation,
  useGetMeQuery,
} from "@/store/api/authApi";
import { toast } from "sonner";
import { passwordSchema, profileSchema } from "@/lib/auth-schemas";

type ApiError = {
  data?: {
    error?: { message?: string };
    message?: string;
  };
};

function getInitials(
  firstName?: string,
  lastName?: string,
  username?: string
) {
  if (firstName && lastName) return (firstName[0] + lastName[0]).toUpperCase();
  if (username) return username.slice(0, 2).toUpperCase();
  return "NU";
}

function ProfilePageContent() {
  const router = useRouter();
  const { user, isAuthenticated, isAuthLoading } = useAuth();
  const [updateProfile, { isLoading: isSaving }] = useUpdateProfileMutation();
  const [changePassword, { isLoading: isChangingPw }] =
    useChangePasswordMutation();
  const [uploadAvatar, { isLoading: isUploadingAvatar }] =
    useUploadAvatarMutation();
  // ── Avatar upload state 
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState("");
  const [avatarSuccess, setAvatarSuccess] = useState(false);
  const [avatarVersion, setAvatarVersion] = useState(0);

  const handleAvatarSelect = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarError("");

    // Validate type
    if (!file.type.startsWith("image/")) {
      setAvatarError("Only image files are allowed.");
      return;
    }
    // Validate size (max 5 MB)
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError("Image must be smaller than 5 MB.");
      return;
    }

    // Local preview
    const objectUrl = URL.createObjectURL(file);
    setAvatarPreview(objectUrl);

    // Upload
    try {
      const fd = new FormData();
      fd.append("avatar", file);
      await uploadAvatar(fd).unwrap();
      setAvatarVersion((v) => v + 1);
      setAvatarPreview(null);
      setAvatarSuccess(true);
      setTimeout(() => setAvatarSuccess(false), 4000);
    } catch (err: unknown) {
      setAvatarError(
        (err as { data?: { message?: string } })?.data?.message ??
          "Avatar upload failed."
      );
      setAvatarPreview(null);
    } finally {
      // Reset input so the same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const searchParams = useSearchParams();
  const { refetch: refetchProfile } = useGetMeQuery();

  // Detect email_verified=success redirect from backend and show toast
  useEffect(() => {
    const status = searchParams.get("email_verified");
    if (!status) return;
    // Remove the param from URL without reload
    const url = new URL(window.location.href);
    url.searchParams.delete("email_verified");
    window.history.replaceState({}, "", url.toString());
    if (status === "success") {
      refetchProfile();
      toast.success("Email verified successfully! 🎉");
    } else if (status === "expired") {
      toast.error("Verification link has expired. Please request a new one.");
    } else {
      toast.error("Invalid verification link.");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Redirect only once auth rehydration has completed and user is not logged in
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.replace("/auth/signin");
    }
  }, [isAuthLoading, isAuthenticated, router]);

  // ── Profile edit state ─
  const [editMode, setEditMode] = useState(false);
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    studentId: "",
  });
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Sync form when user loads
  useEffect(() => {
    if (user) {
      setProfile({
        firstName: user.firstName ?? "",
        lastName: user.lastName ?? "",
        email: user.email ?? "",
        studentId: user.studentId ?? "",
      });
    }
  }, [user]);

  // ── Password state ─────
  const [pw, setPw] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPw, setShowPw] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState(false);

  const handleSaveProfile = async () => {
    setProfileError("");
    const profileResult = profileSchema.safeParse(profile);
    if (!profileResult.success) {
      setProfileError(profileResult.error.issues[0].message);
      return;
    }

    try {
      await updateProfile(profileResult.data).unwrap();
      setProfileSuccess(true);
      setEditMode(false);
      setTimeout(() => setProfileSuccess(false), 4000);
    } catch (err: unknown) {
      const data = (err as ApiError)?.data;
      setProfileError(
        data?.error?.message ??
        data?.message ??
        "Failed to update profile."
      );
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError("");
    if (pw.newPassword !== pw.confirmPassword) {
      setPwError("New passwords do not match.");
      return;
    }
    const passwordResult = passwordSchema.safeParse(pw.newPassword);
    if (!passwordResult.success) {
      setPwError(passwordResult.error.issues[0].message);
      return;
    }
    try {
      await changePassword(pw).unwrap();
      setPw({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPwSuccess(true);
      setTimeout(() => setPwSuccess(false), 4000);
    } catch (err: unknown) {
      const data = (err as ApiError)?.data;
      setPwError(
        data?.error?.message ??
        data?.message ??
        "Failed to change password."
      );
    }
  };

  // ── Loading state ──────
  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#20659C]" />
      </div>
    );
  }

  const initials = getInitials(user.firstName, user.lastName, user.username);
  const displayName =
    user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.username ?? "User";

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      {/* ── Avatar Banner  */}
      <div className="bg-white dark:bg-gray-900 border border-[#E2E8F0] dark:border-gray-800 rounded-2xl p-6 mb-6 flex items-center gap-5 shadow-sm">
        {/* Avatar */}
        <div className="relative shrink-0">
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarSelect}
          />
          <div className="w-[90px] h-[90px] rounded-full ring-4 ring-[#20659C]/20 dark:ring-[#55B9EA]/20 overflow-hidden bg-gradient-to-br from-[#20659C] to-[#55B9EA] flex items-center justify-center shadow-md">
            {isUploadingAvatar ? (
              <div className="w-full h-full flex items-center justify-center bg-black/40">
                <Loader2 className="w-7 h-7 text-white animate-spin" />
              </div>
            ) : avatarPreview || user.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={
                  avatarPreview ?? `/api/auth/avatar?v=${avatarVersion}`
                }
                alt={displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-white text-2xl font-bold select-none">
                {initials}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingAvatar}
            className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[#20659C] hover:bg-[#55B9EA] disabled:opacity-50 transition-colors flex items-center justify-center shadow-md"
            title="Change avatar"
          >
            {isUploadingAvatar ? (
              <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
            ) : (
              <Camera className="w-3.5 h-3.5 text-white" />
            )}
          </button>
        </div>

        {/* Name + ID */}
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-[#1A1A1A] dark:text-white">
            {displayName}
          </h1>
          <div className="flex items-center gap-1.5 mt-1 text-sm text-[#5E5E5E] dark:text-gray-400">
            <GraduationCap className="w-4 h-4" />
            <span>
              Student ID:{" "}
              <strong className="text-[#1A1A1A] dark:text-white font-semibold">
                {user.studentId}
              </strong>
            </span>
          </div>
          {/* Avatar feedback */}
          {avatarSuccess && (
            <div className="flex items-center gap-1.5 mt-2 text-xs text-green-600 dark:text-green-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Avatar updated!
            </div>
          )}
          {avatarError && (
            <div className="flex items-center gap-1.5 mt-2 text-xs text-red-500">
              <AlertCircle className="w-3.5 h-3.5" />
              {avatarError}
            </div>
          )}
          <p className="text-xs text-[#9CA3AF] mt-2">
            Click the camera icon to upload a new photo (max 5 MB).
          </p>
        </div>
      </div>

      {/* ── Two-column grid  */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Account Settings */}
        <div className="bg-white dark:bg-gray-900 border border-[#E2E8F0] dark:border-gray-800 rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-0.5">
            <Settings className="w-5 h-5 text-[#20659C]" />
            <h2 className="text-base font-bold text-[#1A1A1A] dark:text-white">
              Account Settings
            </h2>
          </div>
          <p className="text-sm text-[#5E5E5E] dark:text-gray-400 mb-5">
            Manage your account information
          </p>

          {/* Success / Error banners */}
          {profileSuccess && (
            <div className="flex items-center gap-2 mb-4 px-3 py-2.5 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 text-sm">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              Profile updated successfully!
            </div>
          )}
          {profileError && (
            <div className="flex items-center gap-2 mb-4 px-3 py-2.5 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {profileError}
            </div>
          )}

          {/* Fields */}
          <div className="space-y-0 divide-y divide-[#F1F5F9] dark:divide-gray-800 flex-1">
            {/* Full Name */}
            <div className="flex items-start gap-3 py-4">
              <div className="w-8 h-8 rounded-full bg-[#F8FAFC] dark:bg-gray-800 flex items-center justify-center shrink-0 mt-0.5">
                <User className="w-4 h-4 text-[#9CA3AF]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-1">
                  Full Name
                </p>
                {editMode ? (
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      value={profile.firstName}
                      onChange={(e) =>
                        setProfile((p) => ({
                          ...p,
                          firstName: e.target.value,
                        }))
                      }
                      placeholder="First name"
                      className="h-8 text-sm"
                    />
                    <Input
                      value={profile.lastName}
                      onChange={(e) =>
                        setProfile((p) => ({
                          ...p,
                          lastName: e.target.value,
                        }))
                      }
                      placeholder="Last name"
                      className="h-8 text-sm"
                    />
                  </div>
                ) : (
                  <p className="text-sm font-medium text-[#1A1A1A] dark:text-white">
                    {user.firstName} {user.lastName}
                  </p>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-3 py-4">
              <div className="w-8 h-8 rounded-full bg-[#F8FAFC] dark:bg-gray-800 flex items-center justify-center shrink-0 mt-0.5">
                <Mail className="w-4 h-4 text-[#9CA3AF]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-1">
                  Email
                </p>
                {editMode ? (
                  <Input
                    type="email"
                    value={profile.email}
                    onChange={(e) =>
                      setProfile((p) => ({ ...p, email: e.target.value }))
                    }
                    placeholder="Email address"
                    className="h-8 text-sm"
                  />
                ) : (
                  <div className="space-y-1.5">
                    <p className="text-sm font-medium text-[#1A1A1A] dark:text-white truncate">
                      {user.email}
                    </p>
                    {user.isEmailVerified && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" />
                        Verified
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Student ID */}
            <div className="flex items-start gap-3 py-4">
              <div className="w-8 h-8 rounded-full bg-[#F8FAFC] dark:bg-gray-800 flex items-center justify-center shrink-0 mt-0.5">
                <GraduationCap className="w-4 h-4 text-[#9CA3AF]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-1">
                  Student ID
                </p>
                {editMode ? (
                  <Input
                    value={profile.studentId}
                    onChange={(e) =>
                      setProfile((p) => ({
                        ...p,
                        studentId: e.target.value,
                      }))
                    }
                    placeholder="Student ID"
                    className="h-8 text-sm"
                  />
                ) : (
                  <p className="text-sm font-medium text-[#1A1A1A] dark:text-white">
                    {user.studentId}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-5 pt-4 border-t border-[#F1F5F9] dark:border-gray-800">
            <p className="text-xs text-[#9CA3AF]">Keep your info up to date.</p>
            {editMode ? (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditMode(false);
                    setProfileError("");
                    // Reset to current user values
                    if (user) {
                      setProfile({
                        firstName: user.firstName ?? "",
                        lastName: user.lastName ?? "",
                        email: user.email ?? "",
                        studentId: user.studentId ?? "",
                      });
                    }
                  }}
                  disabled={isSaving}
                >
                  <X className="w-3.5 h-3.5 mr-1" />
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSaveProfile} disabled={isSaving}>
                  {isSaving ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                  ) : (
                    <Save className="w-3.5 h-3.5 mr-1" />
                  )}
                  Save
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditMode(true)}
              >
                <Pencil className="w-3.5 h-3.5 mr-1.5" />
                Edit Profile
              </Button>
            )}
          </div>
        </div>

        {/* ── Security Settings  */}
        <div className="bg-white dark:bg-gray-900 border border-[#E2E8F0] dark:border-gray-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-0.5">
            <Shield className="w-5 h-5 text-[#20659C]" />
            <h2 className="text-base font-bold text-[#1A1A1A] dark:text-white">
              Security Settings
            </h2>
          </div>
          <p className="text-sm text-[#5E5E5E] dark:text-gray-400 mb-5">
            Keep your account secure
          </p>

          {/* Change Password sub-card */}
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#FFF8EC] dark:bg-[#DF900A]/10 border border-[#FFECC7] dark:border-[#DF900A]/20 mb-5">
            <div className="w-9 h-9 rounded-lg bg-[#DF900A]/15 flex items-center justify-center shrink-0">
              <Key className="w-4 h-4 text-[#DF900A]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#1A1A1A] dark:text-white">
                Change Password
              </p>
              <p className="text-xs text-[#5E5E5E] dark:text-gray-400 mt-0.5 leading-relaxed">
                Ensure your account is using a strong, secure password.
              </p>
            </div>
          </div>

          {/* Success / Error */}
          {pwSuccess && (
            <div className="flex items-center gap-2 mb-4 px-3 py-2.5 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 text-sm">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              Password updated successfully!
            </div>
          )}
          {pwError && (
            <div className="flex items-center gap-2 mb-4 px-3 py-2.5 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {pwError}
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            {/* Current Password */}
            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] dark:text-white mb-1.5">
                Current Password
              </label>
              <div className="relative">
                <Input
                  type={showPw.current ? "text" : "password"}
                  placeholder="Enter current password"
                  value={pw.currentPassword}
                  onChange={(e) =>
                    setPw((p) => ({ ...p, currentPassword: e.target.value }))
                  }
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowPw((s) => ({ ...s, current: !s.current }))
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#5E5E5E] dark:hover:text-gray-300"
                >
                  {showPw.current ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] dark:text-white mb-1.5">
                New Password
              </label>
              <div className="relative">
                <Input
                  type={showPw.new ? "text" : "password"}
                  placeholder="Enter new password"
                  value={pw.newPassword}
                  onChange={(e) =>
                    setPw((p) => ({ ...p, newPassword: e.target.value }))
                  }
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => ({ ...s, new: !s.new }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#5E5E5E] dark:hover:text-gray-300"
                >
                  {showPw.new ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-xs text-[#9CA3AF] mt-1">
                Use 8-20 characters with uppercase, lowercase, a number, and a
                special character.
              </p>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] dark:text-white mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <Input
                  type={showPw.confirm ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={pw.confirmPassword}
                  onChange={(e) =>
                    setPw((p) => ({
                      ...p,
                      confirmPassword: e.target.value,
                    }))
                  }
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowPw((s) => ({ ...s, confirm: !s.confirm }))
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#5E5E5E] dark:hover:text-gray-300"
                >
                  {showPw.confirm ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full mt-2"
              disabled={isChangingPw}
            >
              {isChangingPw ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Updating…
                </>
              ) : (
                "Update Password"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#20659C]" />
        </div>
      }
    >
      <ProfilePageContent />
    </Suspense>
  );
}
