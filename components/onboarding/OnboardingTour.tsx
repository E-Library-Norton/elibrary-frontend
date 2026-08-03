"use client";

import { driver, type DriveStep, type Driver } from "driver.js";
import { hints, type DriverHint, type Hints } from "driver.js/hints";
import { CircleHelp } from "lucide-react";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useGetReadingPreferencesQuery } from "@/store/api/preferenceApi";

const STORAGE_PREFIX = "norton-elibrary:onboarding";
const HINT_STORAGE_KEY = `${STORAGE_PREFIX}:dismissed-hints:v1`;

interface TourDefinition {
  id: string;
  label: string;
  steps: DriveStep[];
}

function responsiveFilterTarget() {
  const selector =
    window.innerWidth < 1024
      ? '[data-tour="catalog-filter-toggle"]'
      : '[data-tour="catalog-filters"]';
  return document.querySelector(selector) as Element;
}

function firstVisibleElement(selector: string): Element {
  const visibleElement = Array.from(document.querySelectorAll(selector)).find(
    (element) => {
      const styles = window.getComputedStyle(element);
      const bounds = element.getBoundingClientRect();

      return (
        styles.display !== "none" &&
        styles.visibility !== "hidden" &&
        bounds.width > 0 &&
        bounds.height > 0
      );
    },
  );

  return visibleElement ?? document.querySelector(selector) ?? document.body;
}

function getTour(pathname: string): TourDefinition | null {
  if (pathname === "/books") {
    return {
      id: "book-catalog-v1",
      label: "Books guide",
      steps: [
        {
          element: '[data-tour="catalog-search"]',
          popover: {
            title: "Find the right book",
            description:
              "Search by title, author, or ISBN. Press Enter or select Search to update the catalog.",
            side: "bottom",
            align: "center",
          },
        },
        {
          element: responsiveFilterTarget,
          popover: {
            title: "Refine your results",
            description:
              "Choose one category and a sort order. Your filters and page are saved in the URL for Back and Forward navigation.",
            side: "right",
            align: "start",
          },
        },
        {
          element: '[data-tour="book-card"]',
          waitForElement: 8_000,
          skipMissingElement: true,
          popover: {
            title: "Open a book",
            description:
              "Select a book card to view its details, available media, reading progress, and citation information.",
            side: "top",
            align: "center",
          },
        },
      ],
    };
  }

  if (/^\/books\/[^/]+\/read$/.test(pathname)) {
    return {
      id: "pdf-reader-v1",
      label: "Reader guide",
      steps: [
        {
          element: '[data-tour="reader-document"]',
          waitForElement: 8_000,
          popover: {
            title: "Read the PDF",
            description:
              "Navigate through the document normally. Your current page and completion percentage save automatically.",
            side: "left",
            align: "center",
          },
        },
        {
          element: () => firstVisibleElement('[data-tour="reader-progress"]'),
          skipMissingElement: true,
          popover: {
            title: "Reading progress",
            description:
              "See your current page, completion percentage, and last-read time at a glance.",
            side: "bottom",
            align: "center",
          },
        },
        {
          element: '[data-tour="reader-bookmark-page"]',
          popover: {
            title: "Bookmark this page",
            description:
              "Save the current page with an optional title so you can return to it instantly.",
            side: "bottom",
            align: "end",
          },
        },
        {
          element: '[data-tour="reader-bookmarks"]',
          popover: {
            title: "Your bookmarks",
            description:
              "Open the bookmark sidebar to jump to or remove pages you previously saved.",
            side: "bottom",
            align: "end",
          },
        },
        {
          element: '[data-tour="reader-notes"]',
          popover: {
            title: "Reading notes",
            description:
              "Select text in the PDF to copy, highlight, or save it with your own explanation. Manage every note here.",
            side: "bottom",
            align: "end",
          },
        },
      ],
    };
  }

  if (/^\/books\/[^/]+$/.test(pathname)) {
    return {
      id: "book-details-v1",
      label: "Book details guide",
      steps: [
        {
          element: '[data-tour="read-online"]',
          waitForElement: 8_000,
          skipMissingElement: true,
          popover: {
            title: "Start or continue reading",
            description:
              "Open the PDF reader. After you sign in, Norton E-Library returns you to this same book and restores your last page.",
            side: "right",
            align: "center",
          },
        },
      ],
    };
  }

  return null;
}

function tourStorageKey(id: string) {
  return `${STORAGE_PREFIX}:tour:${id}`;
}

function readDismissedHints() {
  try {
    const value = JSON.parse(localStorage.getItem(HINT_STORAGE_KEY) ?? "[]");
    return new Set<string>(Array.isArray(value) ? value : []);
  } catch {
    return new Set<string>();
  }
}

const READER_HINTS: DriverHint[] = [
  {
    id: "bookmark-page",
    element: '[data-tour="reader-bookmark-page"]',
    beacon: { side: "top", align: "end", className: "norton-driver-hint" },
    popover: {
      title: "Save this page",
      description: "Add a bookmark without leaving the PDF reader.",
      side: "bottom",
      align: "end",
    },
  },
  {
    id: "reading-notes",
    element: '[data-tour="reader-notes"]',
    beacon: { side: "top", align: "end", className: "norton-driver-hint" },
    popover: {
      title: "Notes and highlights",
      description:
        "Select PDF text, then save the quote, your explanation, and a highlight color.",
      side: "bottom",
      align: "end",
    },
  },
];

export function OnboardingTour() {
  const pathname = usePathname();
  const { isAuthenticated, isAuthLoading } = useAuth();
  const { data: preferenceResponse, isFetching: isPreferenceFetching } =
    useGetReadingPreferencesQuery(undefined, { skip: !isAuthenticated });
  const canUseTour =
    !isAuthLoading &&
    !isPreferenceFetching &&
    isAuthenticated &&
    preferenceResponse?.data?.onboardingCompleted === true;
  const tour = useMemo(
    () => (canUseTour ? getTour(pathname) : null),
    [canUseTour, pathname],
  );
  const driverRef = useRef<Driver | null>(null);
  const hintsRef = useRef<Hints | null>(null);

  const startTour = useCallback(() => {
    if (!tour || driverRef.current?.isActive()) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const instance = driver({
      steps: tour.steps,
      animate: !reducedMotion,
      smoothScroll: true,
      allowClose: true,
      allowScroll: true,
      skipMissingElement: true,
      waitForElement: 5_000,
      stagePadding: 8,
      stageRadius: 14,
      overlayColor: "#07111f",
      overlayOpacity: 0.66,
      popoverClass: "norton-driver-popover",
      showProgress: true,
      progressText: "{{current}} of {{total}}",
      nextBtnText: "Next",
      prevBtnText: "Back",
      doneBtnText: "Done",
      onDestroyed: () => {
        localStorage.setItem(tourStorageKey(tour.id), "completed");
        if (driverRef.current === instance) driverRef.current = null;
      },
    });

    driverRef.current = instance;
    instance.drive();
  }, [tour]);

  useEffect(() => {
    if (!tour) return;
    if (localStorage.getItem(tourStorageKey(tour.id)) === "completed") return;

    const timer = window.setTimeout(startTour, 900);
    return () => window.clearTimeout(timer);
  }, [startTour, tour]);

  useEffect(() => {
    if (tour?.id !== "pdf-reader-v1") return;

    const dismissed = readDismissedHints();
    const availableHints = READER_HINTS.filter((hint) =>
      Boolean(hint.id && !dismissed.has(hint.id)),
    );
    if (!availableHints.length) return;

    const timer = window.setTimeout(() => {
      const instance = hints({
        hints: availableHints,
        popoverClass: "norton-driver-popover",
        buttonText: "Got it",
        onDismiss: (_element, hint) => {
          if (!hint.id) return;
          dismissed.add(hint.id);
          localStorage.setItem(
            HINT_STORAGE_KEY,
            JSON.stringify([...dismissed]),
          );
        },
      });
      hintsRef.current = instance;
      instance.show();
    }, 1_100);

    return () => {
      window.clearTimeout(timer);
      hintsRef.current?.hide();
      hintsRef.current = null;
    };
  }, [tour?.id]);

  useEffect(
    () => () => {
      driverRef.current?.destroy();
      driverRef.current = null;
    },
    [pathname],
  );

  if (!tour) return null;

  return (
    <button
      type="button"
      onClick={startTour}
      aria-label={`Replay ${tour.label}`}
      title={`Replay ${tour.label}`}
      className="fixed right-4 bottom-4 z-[70] flex h-11 items-center gap-2 rounded-full border border-[#20659C]/20 bg-white px-3 text-sm font-semibold text-[#20659C] shadow-lg shadow-slate-900/10 transition hover:-translate-y-0.5 hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#20659C] dark:border-sky-400/25 dark:bg-slate-800 dark:text-sky-300 dark:hover:bg-slate-700"
    >
      <CircleHelp className="size-5" aria-hidden="true" />
      <span className="hidden sm:inline">Guide</span>
    </button>
  );
}
