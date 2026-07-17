"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useTheme } from "next-themes"
import { flushSync } from "react-dom"

import { cn } from "@/lib/utils"

/* ── Animated Sun icon (rays rotate in) ── */
function SunIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="4" className="origin-center animate-[spin_4s_linear_infinite]" />
      <path d="M12 2v2" className="origin-center animate-[pulse_2s_ease-in-out_infinite]" />
      <path d="M12 20v2" className="origin-center animate-[pulse_2s_ease-in-out_infinite_0.25s]" />
      <path d="m4.93 4.93 1.41 1.41" className="origin-center animate-[pulse_2s_ease-in-out_infinite_0.5s]" />
      <path d="m17.66 17.66 1.41 1.41" className="origin-center animate-[pulse_2s_ease-in-out_infinite_0.75s]" />
      <path d="M2 12h2" className="origin-center animate-[pulse_2s_ease-in-out_infinite_1s]" />
      <path d="M20 12h2" className="origin-center animate-[pulse_2s_ease-in-out_infinite_1.25s]" />
      <path d="m6.34 17.66-1.41 1.41" className="origin-center animate-[pulse_2s_ease-in-out_infinite_1.5s]" />
      <path d="m19.07 4.93-1.41 1.41" className="origin-center animate-[pulse_2s_ease-in-out_infinite_1.75s]" />
    </svg>
  )
}

/* ── Animated Moon icon (gentle rock) ── */
function MoonIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  )
}

interface AnimatedThemeTogglerProps extends React.ComponentPropsWithoutRef<"button"> {
  duration?: number
}

export const AnimatedThemeToggler = ({
  className,
  duration = 400,
  ...props
}: AnimatedThemeTogglerProps) => {
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const isTransitioningRef = useRef(false)

  useEffect(() => setMounted(true), [])

  const isDark = resolvedTheme === "dark"

  const toggleTheme = useCallback(() => {
    if (isTransitioningRef.current) return

    const button = buttonRef.current
    if (!button) return

    const { top, left, width, height } = button.getBoundingClientRect()
    const x = left + width / 2
    const y = top + height / 2
    const viewportWidth = window.visualViewport?.width ?? window.innerWidth
    const viewportHeight = window.visualViewport?.height ?? window.innerHeight
    const maxRadius = Math.hypot(
      Math.max(x, viewportWidth - x),
      Math.max(y, viewportHeight - y)
    )

    const applyTheme = () => {
      setTheme(isDark ? "light" : "dark")
    }

    if (typeof document.startViewTransition !== "function") {
      applyTheme()
      return
    }

    isTransitioningRef.current = true

    const transition = document.startViewTransition(() => {
      flushSync(applyTheme)
    })

    transition.finished
      .then(() => {
        isTransitioningRef.current = false
      })
      .catch(() => {
        isTransitioningRef.current = false
      })

    const ready = transition?.ready
    if (ready && typeof ready.then === "function") {
      ready.then(() => {
        document.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${maxRadius}px at ${x}px ${y}px)`,
            ],
          },
          {
            duration,
            easing: "ease-in-out",
            pseudoElement: "::view-transition-new(root)",
          }
        )
      })
    }
  }, [isDark, duration, setTheme])

  if (!mounted) {
    return (
      <button
        type="button"
        className={cn(
          "inline-flex items-center justify-center rounded-full w-9 h-9 opacity-0 pointer-events-none",
          className
        )}
        disabled
        {...props}
      >
        <SunIcon className="w-[18px] h-[18px]" />
      </button>
    )
  }

  return (
    <button
      type="button"
      ref={buttonRef}
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "inline-flex items-center justify-center rounded-full w-9 h-9 text-[#5E5E5E] hover:text-[#20659C] dark:text-gray-400 dark:hover:text-[#55B9EA] hover:bg-[#20659C]/10 dark:hover:bg-gray-800 transition-all duration-200 cursor-pointer",
        className
      )}
      {...props}
    >
      {isDark ? (
        <SunIcon className="w-[18px] h-[18px] transition-transform duration-300 rotate-0 scale-100" />
      ) : (
        <MoonIcon className="w-[18px] h-[18px] transition-transform duration-300 rotate-0 scale-100" />
      )}
      <span className="sr-only">Toggle theme</span>
    </button>
  )
}
