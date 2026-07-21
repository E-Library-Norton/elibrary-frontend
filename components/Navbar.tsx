"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
import { useAppSelector, useAppDispatch } from "@/lib/hooks";
import {
  selectFavoriteCount,
  hydrateLibrary,
  clearLibrary,
} from "@/store/slices/librarySlice";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/books", label: "Books" },
  { href: "/videos", label: "Videos" },
  { href: "/audios", label: "Audios" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

function getInitials(firstName?: string, lastName?: string, username?: string) {
  if (firstName && lastName) return (firstName[0] + lastName[0]).toUpperCase();
  if (firstName) return firstName.slice(0, 2).toUpperCase();
  if (username) return username.slice(0, 2).toUpperCase();
  return "NU";
}

// ── User Avatar + Dropdown 
function UserMenu() {
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
      : user?.username ?? "Account";
  const roles = user?.roles ?? [];
  const roleLabel = roles[0] ?? "";
  const avatarSrc = user?.avatar ? '/api/auth/avatar' : null;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-[#20659C]/8 transition-colors"
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
        <div className="hidden sm:block text-left">
          <p className="text-sm font-semibold text-[#1A1A1A] leading-none">{displayName}</p>
          {roleLabel && (
            <p className="text-xs text-[#9CA3AF] leading-none mt-0.5 capitalize">{roleLabel}</p>
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
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#5E5E5E] dark:text-gray-400 hover:bg-[#F8FAFC] dark:hover:bg-gray-800 hover:text-[#20659C] dark:hover:text-[#55B9EA] transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            My Library
          </Link>
          <Link
            href="/profile"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#5E5E5E] dark:text-gray-400 hover:bg-[#F8FAFC] dark:hover:bg-gray-800 hover:text-[#20659C] dark:hover:text-[#55B9EA] transition-colors"
          >
            <User className="w-4 h-4" />
            My Profile
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
            {isLogoutLoading ? "Signing out…" : "Sign Out"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Navbar

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const dispatch = useAppDispatch();
  const favCount = useAppSelector(selectFavoriteCount);

  const displayName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.username ?? "Account";

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
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-md border-b border-[#E2E8F0] dark:border-gray-800"
          : "bg-transparent"
      )}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-lg overflow-hidden">
            <img src="/logo.webp" alt="E-Library Norton" width={40} height={40} className="w-full h-full object-contain" />
          </div>
          <span className="text-xl font-bold text-[#20659C] group-hover:text-[#55B9EA] transition-colors">
            E-Library<span className="text-[#DF900A]"> Norton</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <ul className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={cn(
                  "relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                  pathname === link.href
                    ? "text-[#20659C] bg-[#20659C]/8 dark:bg-[#20659C]/20"
                    : "text-[#5E5E5E] dark:text-gray-400 hover:text-[#20659C] dark:hover:text-[#55B9EA] hover:bg-[#20659C]/5"
                )}
              >
                {link.label}
                {pathname === link.href && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#20659C]" />
                )}
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-2">
          <AnimatedThemeToggler />

          {/* Push notification toggle */}
          {isAuthenticated && <PushNotificationBell />}

          {/* Favorites indicator */}
          <Link
            href="/library"
            className="relative p-2 rounded-lg text-[#5E5E5E] dark:text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            title="My Library"
          >
            <Heart className={cn("w-5 h-5", favCount > 0 && "fill-red-500 text-red-500")} />
            {favCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1 shadow-sm">
                {favCount > 99 ? "99+" : favCount}
              </span>
            )}
          </Link>

          {isAuthenticated ? (
            <UserMenu />
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/auth/signin">Sign In</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/auth/signup">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Toggle + Theme */}
        <div className="md:hidden flex items-center gap-1">
          <AnimatedThemeToggler />
          {isAuthenticated && <PushNotificationBell />}
          <button
            className="p-2 rounded-lg text-[#5E5E5E] dark:text-gray-400 hover:bg-[#20659C]/10 dark:hover:bg-gray-800 hover:text-[#20659C] dark:hover:text-[#55B9EA] transition-colors"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={cn(
          "md:hidden transition-all duration-300 bg-white dark:bg-gray-900 border-t border-[#E2E8F0] dark:border-gray-800",
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
              {link.label}
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
                  My Library
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
                  My Profile
                </Link>
                <button
                  onClick={() => {
                    setOpen(false);
                    logout();
                  }}
                  className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Button variant="outline" className="w-full mb-2" asChild>
                  <Link href="/auth/signin" onClick={() => setOpen(false)}>
                    Sign In
                  </Link>
                </Button>
                <Button className="w-full" asChild>
                  <Link href="/auth/signup" onClick={() => setOpen(false)}>
                    Sign Up
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
