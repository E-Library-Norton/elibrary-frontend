"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Menu,
  X,
  LogOut,
  User,
  ChevronDown,
  Heart,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { PushNotificationBell } from "@/components/PushNotificationBell";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { useAppSelector, useAppDispatch } from "@/lib/hooks";
import {
  selectFavoriteCount,
  hydrateLibrary,
  clearLibrary,
} from "@/store/slices/librarySlice";

const navLinks = [
  { href: "/", labelKey: "home" },
  { href: "/books", labelKey: "books" },
  { href: "/videos", labelKey: "videos" },
  { href: "/audios", labelKey: "audios" },
  { href: "/about", labelKey: "about" },
  { href: "/contact", labelKey: "contact" },
] as const;

function getInitials(firstName?: string, lastName?: string, username?: string) {
  if (firstName && lastName) return (firstName[0] + lastName[0]).toUpperCase();
  if (firstName) return firstName.slice(0, 2).toUpperCase();
  if (username) return username.slice(0, 2).toUpperCase();
  return "NU";
}

// ── User Avatar + Dropdown 
function UserMenu({
  pathname,
}: {
  pathname: string;
}) {
  const t = useTranslations("Navbar");
  const { user, logout, isLogoutLoading } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const initials = getInitials(user?.firstName, user?.lastName, user?.username);
  const displayName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.username ?? t("account");
  const roles = user?.roles ?? [];
  const roleLabel = roles[0] ?? "";
  const avatarSrc = user?.avatar ? '/api/auth/avatar' : null;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-xl px-2 py-1.5 font-sans transition-colors hover:bg-[#20659C]/8"
      >
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#20659C] to-[#55B9EA] flex items-center justify-center text-white text-xs font-bold shrink-0 ring-2 ring-white shadow-sm">
          {avatarSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarSrc}
              alt={displayName}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            initials
          )}
        </div>
        <div className="hidden text-left xl:block">
          <p className="max-w-[170px] truncate font-sans text-sm font-semibold leading-none text-[#1A1A1A] dark:text-white">{displayName}</p>
          {roleLabel && (
            <p className="mt-1 max-w-[170px] truncate font-sans text-xs capitalize leading-none text-[#9CA3AF] dark:text-gray-400">{roleLabel}</p>
          )}
        </div>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-[#9CA3AF] transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>

      {/* Dropdown */}
      <div
        className={cn(
          "absolute right-0 mt-2 w-56 rounded-xl border border-[#E2E8F0] dark:border-gray-800 bg-white dark:bg-gray-900 shadow-lg overflow-hidden transition-all duration-200 origin-top-right",
          open
            ? "opacity-100 scale-100 pointer-events-auto"
            : "opacity-0 scale-95 pointer-events-none"
        )}
      >
        {/* User info header */}
        <div className="px-4 py-3 border-b border-[#F1F5F9] dark:border-gray-800">
          <p className="text-sm font-semibold text-[#1A1A1A] dark:text-white truncate">{displayName}</p>
          {user?.email && (
            <p className="text-xs text-[#9CA3AF] truncate mt-0.5">{user.email}</p>
          )}

        </div>

        {/* Menu items */}
        <div className="py-1.5">
          <Link
            href="/library"
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 px-4 py-2.5 text-sm transition-colors",
              pathname === "/library"
                ? "bg-[#20659C]/8 text-[#20659C] dark:bg-[#20659C]/20 dark:text-[#55B9EA]"
                : "text-[#5E5E5E] hover:bg-[#F8FAFC] hover:text-[#20659C] dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-[#55B9EA]",
            )}
          >
            <BookOpen className="h-4 w-4" />
            <span>{t("myLibrary")}</span>
          </Link>
          <Link
            href="/profile"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#5E5E5E] dark:text-gray-400 hover:bg-[#F8FAFC] dark:hover:bg-gray-800 hover:text-[#20659C] dark:hover:text-[#55B9EA] transition-colors"
          >
            <User className="w-4 h-4" />
            {t("myProfile")}
          </Link>
        </div>

        <div className="border-t border-[#F1F5F9] dark:border-gray-800 py-1.5">
          <button
            onClick={() => {
              setOpen(false);
              logout();
            }}
            disabled={isLogoutLoading}
            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            <LogOut className="w-4 h-4" />
            {isLogoutLoading ? t("signingOut") : t("signOut")}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Navbar

export default function Navbar() {
  const t = useTranslations("Navbar");
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const dispatch = useAppDispatch();
  const favCount = useAppSelector(selectFavoriteCount);

  const displayName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.username ?? t("account");

  // Hydrate per-user library data whenever the logged-in user changes
  useEffect(() => {
    if (user?.id) {
      dispatch(hydrateLibrary(user.id));
    } else {
      dispatch(clearLibrary());
    }
  }, [dispatch, user?.id]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b border-slate-200/70 bg-white/90 font-sans backdrop-blur-md transition-shadow duration-300 dark:border-slate-800/80 dark:bg-slate-950/90",
        scrolled
          ? "shadow-md shadow-slate-900/5 dark:shadow-black/20"
          : "shadow-none"
      )}
    >
      <nav className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" onClick={() => setOpen(false)} className="group flex items-center gap-2 font-sans">
          <div className="h-9 w-9 overflow-hidden rounded-lg">
            <Image
              src="/logo.webp"
              alt="E-Library Norton"
              width={40}
              height={40}
              priority
              className="h-full w-full object-contain"
            />
          </div>
          <span className="text-lg font-bold tracking-tight text-[#20659C] transition-colors group-hover:text-[#55B9EA] sm:text-xl">
            E-Library<span className="text-[#DF900A]"> Norton</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <ul className="hidden items-center gap-0.5 font-sans lg:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={cn(
                  "relative rounded-lg px-2.5 py-2 text-sm font-medium transition-all duration-200 xl:px-3",
                  pathname === link.href
                    ? "text-[#20659C] bg-[#20659C]/8 dark:bg-[#20659C]/20"
                    : "text-[#5E5E5E] dark:text-gray-400 hover:text-[#20659C] dark:hover:text-[#55B9EA] hover:bg-[#20659C]/5"
                )}
              >
                {t(link.labelKey)}
                {pathname === link.href && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#20659C]" />
                )}
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-1 lg:flex">
          <LanguageSwitcher />
          <AnimatedThemeToggler useViewTransition={pathname !== "/"} />

          {/* Push notification toggle */}
          {isAuthenticated && <PushNotificationBell />}

          {/* Compact saved-books shortcut */}
          {isAuthenticated && (
            <Link
              href="/library"
              aria-label={t("myLibrary")}
              title={t("myLibrary")}
              className={cn(
                "relative inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors",
                pathname === "/library"
                  ? "bg-red-50 text-red-500 dark:bg-red-950/40 dark:text-red-400"
                  : "text-[#5E5E5E] hover:bg-red-50 hover:text-red-500 dark:text-gray-400 dark:hover:bg-red-950/30 dark:hover:text-red-400",
              )}
            >
              <Heart
                className={cn(
                  "h-5 w-5",
                  favCount > 0 && "fill-red-500 text-red-500",
                )}
              />
              {favCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-white bg-red-500 px-1 text-[9px] font-bold leading-none text-white dark:border-slate-950">
                  {favCount > 99 ? "99+" : favCount}
                </span>
              )}
            </Link>
          )}

          {isAuthenticated ? (
            <UserMenu pathname={pathname} />
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/auth/signin">{t("signIn")}</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/auth/signup">{t("signUp")}</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Toggle + Theme */}
        <div className="flex items-center gap-1 lg:hidden">
          <LanguageSwitcher className="h-8 w-[76px]" />
          <AnimatedThemeToggler useViewTransition={pathname !== "/"} />
          {isAuthenticated && <PushNotificationBell />}
          <button
            className="p-2 rounded-lg text-[#5E5E5E] dark:text-gray-400 hover:bg-[#20659C]/10 dark:hover:bg-gray-800 hover:text-[#20659C] dark:hover:text-[#55B9EA] transition-colors"
            onClick={() => setOpen(!open)}
            aria-label={t("toggleMenu")}
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={cn(
          "border-t border-[#E2E8F0] bg-white transition-all duration-300 dark:border-gray-800 dark:bg-gray-900 lg:hidden",
          open ? "max-h-[600px] opacity-100 overflow-y-auto" : "max-h-0 opacity-0 overflow-hidden"
        )}
      >
        <div className="px-4 py-3 flex flex-col gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={cn(
                "px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
                pathname === link.href
                  ? "bg-[#20659C] text-white"
                  : "text-[#5E5E5E] dark:text-gray-400 hover:bg-[#20659C]/10 hover:text-[#20659C] dark:hover:text-[#55B9EA]"
              )}
            >
              {t(link.labelKey)}
            </Link>
          ))}

          {/* Mobile auth section */}
          <div className="mt-2 border-t border-[#F1F5F9] dark:border-gray-800 pt-3">
            {isAuthenticated ? (
              <>
                {/* User info row */}
                <div className="flex items-center gap-3 px-4 py-2 mb-1">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#20659C] to-[#55B9EA] flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {getInitials(user?.firstName, user?.lastName, user?.username)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#1A1A1A] dark:text-white">{displayName}</p>
                    {user?.email && (
                      <p className="text-xs text-[#9CA3AF]">{user.email}</p>
                    )}
                  </div>
                </div>
                <Link
                  href="/library"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-[#5E5E5E] dark:text-gray-400 hover:bg-[#20659C]/10 dark:hover:bg-gray-800 hover:text-[#20659C] dark:hover:text-[#55B9EA] transition-colors"
                >
                  <Heart className={cn("w-4 h-4", favCount > 0 && "fill-red-500 text-red-500")} />
                  {t("myLibrary")}
                  {favCount > 0 && (
                    <span className="ml-auto min-w-[20px] h-5 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1.5">
                      {favCount}
                    </span>
                  )}
                </Link>
                <Link
                  href="/profile"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-[#5E5E5E] dark:text-gray-400 hover:bg-[#20659C]/10 dark:hover:bg-gray-800 hover:text-[#20659C] dark:hover:text-[#55B9EA] transition-colors"
                >
                  <User className="w-4 h-4" />
                  {t("myProfile")}
                </Link>
                <button
                  onClick={() => {
                    setOpen(false);
                    logout();
                  }}
                  className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  {t("signOut")}
                </button>
              </>
            ) : (
              <>
                <Button variant="outline" className="w-full mb-2" asChild>
                  <Link href="/auth/signin" onClick={() => setOpen(false)}>
                    {t("signIn")}
                  </Link>
                </Button>
                <Button className="w-full" asChild>
                  <Link href="/auth/signup" onClick={() => setOpen(false)}>
                    {t("signUp")}
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
