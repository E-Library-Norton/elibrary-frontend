"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Worker,
  Viewer,
  SpecialZoomLevel,
  ScrollMode,
  type RenderPage,
  type RenderPageProps,
} from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import { pageNavigationPlugin } from "@react-pdf-viewer/page-navigation";
import { scrollModePlugin } from "@react-pdf-viewer/scroll-mode";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import {
  AlertTriangle,
  ArrowLeft,
  Bookmark as BookmarkIcon,
  CheckCircle2,
  Loader2,
  NotebookPen,
  PartyPopper,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AddNoteDialog } from "@/components/reading/AddNoteDialog";
import { BookmarkButton } from "@/components/reading/BookmarkButton";
import { BookmarkSidebar } from "@/components/reading/BookmarkSidebar";
import { ReadingNotesSidebar } from "@/components/reading/ReadingNotesSidebar";
import { ReadingProgressBar } from "@/components/reading/ReadingProgressBar";
import { TextSelectionPopup } from "@/components/reading/TextSelectionPopup";
import { getApiErrorMessage } from "@/lib/api-error";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  addReadingTime,
  hydrateLibrary,
  updateCurrentPage,
  updateReadingProgress as updateLocalReadingProgress,
} from "@/store/slices/librarySlice";
import { selectCurrentUser } from "@/store/slices/authSlice";
import {
  useCreateBookmarkMutation,
  useCreateReadingNoteMutation,
  useDeleteBookmarkMutation,
  useDeleteReadingNoteMutation,
  useGetBookmarksQuery,
  useGetReadingNotesQuery,
  useGetReadingProgressQuery,
  useUpdateReadingNoteMutation,
  useUpdateReadingProgressMutation,
} from "@/store/api/readingApi";
import type {
  Bookmark as ReadingBookmark,
  HighlightColor,
  ReadingNote,
} from "@/types/reading";

const WORKER_URL =
  "https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js";
const READING_INTERVAL_MS = 30_000;
const PROGRESS_DEBOUNCE_MS = 900;
const COMPLETION_TOAST_MS = 8_000;
const EMPTY_BOOKMARKS: ReadingBookmark[] = [];
const EMPTY_NOTES: ReadingNote[] = [];

interface PdfReaderProps {
  fileUrl: string;
  title?: string;
  coverUrl?: string | null;
  bookId?: string | number;
  backHref?: string;
}

interface SelectedPdfText {
  text: string;
  pageNumber: number;
  left: number;
  top: number;
}

const renderError = () => (
  <div className="flex h-full flex-col items-center justify-center gap-3 bg-slate-950 p-6 text-center">
    <AlertTriangle className="h-12 w-12 text-red-500" />
    <p className="m-0 text-base font-bold text-slate-100">
      Failed to load PDF
    </p>
    <p className="m-0 text-sm text-slate-500">
      The file may be unavailable or corrupted.
    </p>
  </div>
);

const renderPage: RenderPage = (props: RenderPageProps) => (
  <>
    {props.canvasLayer.children}
    {props.annotationLayer.children}
    {props.textLayer.children}
  </>
);

function parsePositivePage(value: string | null) {
  const page = Number(value);
  return Number.isInteger(page) && page > 0 ? page : null;
}

function findSelectedTextRange(root: Element, selectedText: string) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const textNodes: Array<{ node: Text; start: number; end: number }> = [];
  let fullText = "";
  let currentNode = walker.nextNode();

  while (currentNode) {
    const node = currentNode as Text;
    const start = fullText.length;
    fullText += node.data;
    textNodes.push({ node, start, end: fullText.length });
    currentNode = walker.nextNode();
  }

  const matchStart = fullText.indexOf(selectedText);
  if (matchStart < 0) return null;
  const matchEnd = matchStart + selectedText.length;
  const startNode = textNodes.find(
    ({ start, end }) => matchStart >= start && matchStart < end
  );
  const endNode = textNodes.find(
    ({ start, end }) => matchEnd > start && matchEnd <= end
  );
  if (!startNode || !endNode) return null;

  const range = new Range();
  range.setStart(startNode.node, matchStart - startNode.start);
  range.setEnd(endNode.node, matchEnd - endNode.start);
  return range;
}

export default function PdfReader({
  fileUrl,
  title = "Untitled book",
  coverUrl,
  bookId,
  backHref,
}: PdfReaderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectCurrentUser);
  const numericBookId = bookId ? Number(bookId) : 0;
  const canPersist = Boolean(user?.id && numericBookId);

  const storageKey = useCallback(
    (id: string | number) =>
      user?.id ? `pdf_page_${user.id}_${id}` : `pdf_page_${id}`,
    [user?.id]
  );
  const [localSavedPage] = useState(() => {
    if (typeof window === "undefined" || !bookId) return 1;
    return (
      parsePositivePage(window.localStorage.getItem(storageKey(bookId))) ?? 1
    );
  });

  const {
    data: progressResponse,
    isLoading: isProgressLoading,
  } = useGetReadingProgressQuery(numericBookId, {
    skip: !canPersist,
  });
  const { data: bookmarkResponse, isLoading: areBookmarksLoading } =
    useGetBookmarksQuery(numericBookId, { skip: !canPersist });
  const { data: notesResponse, isLoading: areNotesLoading } =
    useGetReadingNotesQuery(numericBookId, { skip: !canPersist });

  const [updateServerProgress] = useUpdateReadingProgressMutation();
  const [createBookmark, { isLoading: isCreatingBookmark }] =
    useCreateBookmarkMutation();
  const [deleteBookmark] = useDeleteBookmarkMutation();
  const [createReadingNote, { isLoading: isCreatingNote }] =
    useCreateReadingNoteMutation();
  const [updateReadingNote, { isLoading: isUpdatingNote }] =
    useUpdateReadingNoteMutation();
  const [deleteReadingNote] = useDeleteReadingNoteMutation();

  const explicitPage = parsePositivePage(searchParams.get("page"));
  const serverProgress = progressResponse?.data;
  const startingPage =
    explicitPage ?? serverProgress?.currentPage ?? localSavedPage;
  const bookmarks = bookmarkResponse?.data ?? EMPTY_BOOKMARKS;
  const notes = notesResponse?.data ?? EMPTY_NOTES;

  const [currentPage, setCurrentPage] = useState(startingPage);
  const [totalPages, setTotalPages] = useState(
    serverProgress?.totalPages ?? 0
  );
  const [lastReadAt, setLastReadAt] = useState<string | null>(
    serverProgress?.lastReadAt ?? null
  );
  const [showCompleted, setShowCompleted] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [deletingBookmarkId, setDeletingBookmarkId] = useState<number | null>(
    null
  );
  const [deletingNoteId, setDeletingNoteId] = useState<number | null>(null);
  const [selection, setSelection] = useState<SelectedPdfText | null>(null);
  const [noteSelection, setNoteSelection] =
    useState<SelectedPdfText | null>(null);
  const [editingNote, setEditingNote] = useState<ReadingNote | null>(null);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);

  const totalPagesRef = useRef(totalPages);
  const currentPageRef = useRef(startingPage);
  const progressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingProgressRef = useRef<{
    currentPage: number;
    totalPages: number;
  } | null>(null);
  const timeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const completionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasShownCompletedRef = useRef(Boolean(serverProgress?.completedAt));
  const readerContainerRef = useRef<HTMLDivElement>(null);

  const scrollPlugin = scrollModePlugin();
  const pageNavPlugin = pageNavigationPlugin();
  const layoutPlugin = defaultLayoutPlugin({
    sidebarTabs: (defaultTabs) => defaultTabs,
  });

  useEffect(() => {
    if (!serverProgress) return;
    setLastReadAt(serverProgress.lastReadAt);
    if (!explicitPage) {
      currentPageRef.current = serverProgress.currentPage;
      setCurrentPage(serverProgress.currentPage);
    }
  }, [explicitPage, serverProgress]);

  useEffect(() => {
    if (user?.id) dispatch(hydrateLibrary(user.id));
  }, [dispatch, user?.id]);

  useEffect(() => {
    scrollPlugin.switchScrollMode(ScrollMode.Vertical);
    // The plugin instance manages its own stable store.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBack = useCallback(() => {
    if (backHref) router.push(backHref);
    else router.back();
  }, [backHref, router]);

  const sendProgress = useCallback(
    async (page: number, pages: number) => {
      if (!canPersist || pages < 1) return;

      try {
        const response = await updateServerProgress({
          bookId: numericBookId,
          currentPage: page,
          totalPages: pages,
        }).unwrap();
        setLastReadAt(response.data.lastReadAt);
      } catch {
        // Local progress remains available as a resilient fallback.
      }
    },
    [canPersist, numericBookId, updateServerProgress]
  );

  const queueProgressUpdate = useCallback(
    (page: number, pages: number, immediate = false) => {
      if (!canPersist || pages < 1) return;
      pendingProgressRef.current = { currentPage: page, totalPages: pages };

      if (progressTimerRef.current) {
        clearTimeout(progressTimerRef.current);
      }

      if (immediate) {
        pendingProgressRef.current = null;
        void sendProgress(page, pages);
        return;
      }

      progressTimerRef.current = setTimeout(() => {
        const pending = pendingProgressRef.current;
        pendingProgressRef.current = null;
        if (pending) {
          void sendProgress(pending.currentPage, pending.totalPages);
        }
      }, PROGRESS_DEBOUNCE_MS);
    },
    [canPersist, sendProgress]
  );

  useEffect(() => {
    if (!numericBookId) return;
    timeIntervalRef.current = setInterval(() => {
      dispatch(addReadingTime({ bookId: numericBookId, seconds: 30 }));
    }, READING_INTERVAL_MS);

    return () => {
      if (timeIntervalRef.current) clearInterval(timeIntervalRef.current);
    };
  }, [dispatch, numericBookId]);

  useEffect(
    () => () => {
      if (progressTimerRef.current) clearTimeout(progressTimerRef.current);
      if (completionTimerRef.current) clearTimeout(completionTimerRef.current);
      const pending = pendingProgressRef.current;
      if (pending) {
        void sendProgress(pending.currentPage, pending.totalPages);
      }
    },
    [sendProgress]
  );

  useEffect(() => {
    const flushOnHidden = () => {
      if (document.visibilityState !== "hidden") return;
      const pending = pendingProgressRef.current;
      if (!pending) return;
      if (progressTimerRef.current) clearTimeout(progressTimerRef.current);
      pendingProgressRef.current = null;
      void sendProgress(pending.currentPage, pending.totalPages);
    };

    document.addEventListener("visibilitychange", flushOnHidden);
    return () =>
      document.removeEventListener("visibilitychange", flushOnHidden);
  }, [sendProgress]);

  useEffect(() => {
    if (!readerContainerRef.current || !("highlights" in CSS)) return;
    const highlightNames = [
      "reading-note-yellow",
      "reading-note-green",
      "reading-note-blue",
      "reading-note-pink",
      "reading-note-purple",
    ];
    let frameId = 0;

    const renderSavedHighlights = () => {
      highlightNames.forEach((name) => CSS.highlights.delete(name));
      const rangesByColor = new Map<HighlightColor, Range[]>();

      notes.forEach((note) => {
        const pageLayer = readerContainerRef.current?.querySelector(
          `[data-testid="core__page-layer-${note.pageNumber - 1}"]`
        );
        if (!pageLayer) return;
        const range = findSelectedTextRange(pageLayer, note.selectedText);
        if (!range) return;
        const ranges = rangesByColor.get(note.highlightColor) ?? [];
        ranges.push(range);
        rangesByColor.set(note.highlightColor, ranges);
      });

      rangesByColor.forEach((ranges, color) => {
        CSS.highlights.set(`reading-note-${color}`, new Highlight(...ranges));
      });
    };

    const scheduleHighlightRender = () => {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(renderSavedHighlights);
    };
    const observer = new MutationObserver(scheduleHighlightRender);
    observer.observe(readerContainerRef.current, {
      childList: true,
      subtree: true,
    });
    scheduleHighlightRender();

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frameId);
      highlightNames.forEach((name) => CSS.highlights.delete(name));
    };
  }, [notes]);

  const handleDocumentLoad = useCallback(
    (event: { doc: { numPages: number } }) => {
      const pages = event.doc.numPages;
      const safePage = Math.min(Math.max(startingPage, 1), pages);
      totalPagesRef.current = pages;
      currentPageRef.current = safePage;
      setTotalPages(pages);
      setCurrentPage(safePage);

      if (safePage !== startingPage) {
        setTimeout(() => pageNavPlugin.jumpToPage(safePage - 1), 0);
      }

      if (numericBookId) {
        dispatch(
          updateLocalReadingProgress({
            bookId: numericBookId,
            title,
            coverUrl,
            currentPage: safePage,
            totalPages: pages,
            lastReadAt: new Date().toISOString(),
            timeSpentSeconds: 0,
          })
        );
        queueProgressUpdate(safePage, pages, true);
      }
    },
    [
      coverUrl,
      dispatch,
      numericBookId,
      pageNavPlugin,
      queueProgressUpdate,
      startingPage,
      title,
    ]
  );

  const handlePageChange = useCallback(
    ({ currentPage: zeroBasedPage }: { currentPage: number }) => {
      if (!bookId) return;
      const page = zeroBasedPage + 1;
      const pages = totalPagesRef.current;

      currentPageRef.current = page;
      setCurrentPage(page);
      window.localStorage.setItem(storageKey(bookId), String(page));

      if (numericBookId && pages > 0) {
        dispatch(
          updateCurrentPage({
            bookId: numericBookId,
            currentPage: page,
            totalPages: pages,
            title,
            coverUrl,
          })
        );
        queueProgressUpdate(page, pages);

        if (page >= pages && !hasShownCompletedRef.current) {
          hasShownCompletedRef.current = true;
          setShowCompleted(true);
          completionTimerRef.current = setTimeout(
            () => setShowCompleted(false),
            COMPLETION_TOAST_MS
          );
        }
      }
    },
    [
      bookId,
      coverUrl,
      dispatch,
      numericBookId,
      queueProgressUpdate,
      storageKey,
      title,
    ]
  );

  const jumpToPage = useCallback(
    (pageNumber: number) => {
      const safePage = Math.min(
        Math.max(1, pageNumber),
        totalPagesRef.current || pageNumber
      );
      pageNavPlugin.jumpToPage(safePage - 1);
      const params = new URLSearchParams(window.location.search);
      params.set("page", String(safePage));
      window.history.pushState(
        null,
        "",
        `${window.location.pathname}?${params.toString()}`
      );
      setShowBookmarks(false);
      setShowNotes(false);
    },
    [pageNavPlugin]
  );

  const handleTextSelection = useCallback(
    () => {
      window.setTimeout(() => {
        const browserSelection = window.getSelection();
        if (
          !browserSelection ||
          browserSelection.isCollapsed ||
          browserSelection.rangeCount === 0
        ) {
          setSelection(null);
          return;
        }

        const text = browserSelection.toString().trim().slice(0, 20000);
        const range = browserSelection.getRangeAt(0);
        const ancestor = range.commonAncestorContainer;
        if (!readerContainerRef.current?.contains(ancestor) || !text) {
          setSelection(null);
          return;
        }

        const element =
          ancestor.nodeType === Node.ELEMENT_NODE
            ? (ancestor as Element)
            : ancestor.parentElement;
        const pageLayer = element?.closest<HTMLElement>(
          '[data-testid^="core__page-layer-"]'
        );
        const testId = pageLayer?.dataset.testid;
        const pageIndex = testId?.match(/core__page-layer-(\d+)/)?.[1];
        const rect = range.getBoundingClientRect();

        setSelection({
          text,
          pageNumber: pageIndex ? Number(pageIndex) + 1 : currentPageRef.current,
          left: rect.left + rect.width / 2,
          top: rect.top,
        });
      }, 0);
    },
    []
  );

  const clearBrowserSelection = useCallback(() => {
    window.getSelection()?.removeAllRanges();
    setSelection(null);
  }, []);

  async function handleCreateBookmark(titleValue?: string) {
    if (!numericBookId) return;
    try {
      await createBookmark({
        bookId: numericBookId,
        pageNumber: currentPage,
        title: titleValue,
      }).unwrap();
      toast.success(`Page ${currentPage} bookmarked`);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to save bookmark"));
      throw error;
    }
  }

  async function handleDeleteBookmark(bookmarkId: number) {
    setDeletingBookmarkId(bookmarkId);
    try {
      await deleteBookmark({ bookId: numericBookId, bookmarkId }).unwrap();
      toast.success("Bookmark removed successfully");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to remove bookmark"));
    } finally {
      setDeletingBookmarkId(null);
    }
  }

  function openAddNote() {
    if (!selection) return;
    setEditingNote(null);
    setNoteSelection(selection);
    setNoteDialogOpen(true);
    setSelection(null);
  }

  async function handleHighlight() {
    if (!selection || !numericBookId) return;
    try {
      await createReadingNote({
        bookId: numericBookId,
        pageNumber: selection.pageNumber,
        selectedText: selection.text,
        highlightColor: "yellow",
      }).unwrap();
      toast.success(`Highlight saved on page ${selection.pageNumber}`);
      clearBrowserSelection();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to save highlight"));
    }
  }

  async function handleCopySelection() {
    if (!selection) return;
    try {
      await navigator.clipboard.writeText(selection.text);
      toast.success("Text copied to clipboard");
      clearBrowserSelection();
    } catch {
      toast.error("Your browser could not copy the selected text");
    }
  }

  function handleEditNote(note: ReadingNote) {
    setEditingNote(note);
    setNoteSelection({
      text: note.selectedText,
      pageNumber: note.pageNumber,
      left: 0,
      top: 0,
    });
    setShowNotes(false);
    setNoteDialogOpen(true);
  }

  async function handleSaveNote(values: {
    noteText: string;
    highlightColor: HighlightColor;
  }) {
    if (!noteSelection || !numericBookId) return;
    try {
      if (editingNote) {
        await updateReadingNote({
          bookId: numericBookId,
          noteId: editingNote.id,
          ...values,
        }).unwrap();
        toast.success("Note updated successfully");
      } else {
        await createReadingNote({
          bookId: numericBookId,
          pageNumber: noteSelection.pageNumber,
          selectedText: noteSelection.text,
          ...values,
        }).unwrap();
        toast.success("Note saved");
      }
      setNoteDialogOpen(false);
      setEditingNote(null);
      setNoteSelection(null);
      clearBrowserSelection();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to save note"));
    }
  }

  async function handleDeleteNote(noteId: number) {
    setDeletingNoteId(noteId);
    try {
      await deleteReadingNote({ bookId: numericBookId, noteId }).unwrap();
      toast.success("Note deleted successfully");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to delete note"));
    } finally {
      setDeletingNoteId(null);
    }
  }

  const isCurrentPageBookmarked = bookmarks.some(
    (bookmark) => bookmark.pageNumber === currentPage
  );
  const shouldWaitForProgress = canPersist && isProgressLoading;

  return (
    <div className="flex h-[100dvh] w-full flex-col overflow-hidden bg-slate-100 font-sans dark:bg-slate-950">
      <style>{`
        .rpv-core__inner-container {
          scroll-behavior: smooth !important;
          -webkit-overflow-scrolling: touch !important;
          touch-action: pan-y !important;
          overscroll-behavior: contain;
        }
        .rpv-core__page-layer { background: #434852 !important; }
        .rpv-core__page-layer canvas {
          box-shadow: 0 3px 28px rgba(0,0,0,0.6);
          border-radius: 3px;
        }
        .rpv-core__canvas-layer canvas { animation: rpvFade .2s ease forwards; }
        @keyframes rpvFade {
          from { opacity:0; transform:translateY(6px); }
          to { opacity:1; transform:translateY(0); }
        }
        @keyframes rpvSlide {
          from { opacity:0; transform:translateY(-8px); }
          to { opacity:1; transform:translateY(0); }
        }
        ::highlight(reading-note-yellow) { background: rgba(250, 204, 21, .55); }
        ::highlight(reading-note-green) { background: rgba(52, 211, 153, .5); }
        ::highlight(reading-note-blue) { background: rgba(56, 189, 248, .48); }
        ::highlight(reading-note-pink) { background: rgba(244, 114, 182, .48); }
        ::highlight(reading-note-purple) { background: rgba(192, 132, 252, .48); }
        .rpv-core__viewer:not(.rpv-core__viewer--dark) .rpv-default-layout__toolbar {
          background: #f3f4f6 !important;
          border-bottom: 1px solid #cbd5e1 !important;
          color: #111827 !important;
        }
        .rpv-core__viewer:not(.rpv-core__viewer--dark) .rpv-default-layout__toolbar .rpv-toolbar__label,
        .rpv-core__viewer:not(.rpv-core__viewer--dark) .rpv-default-layout__toolbar .rpv-zoom__popover-target {
          color: #111827 !important;
        }
        .rpv-core__viewer:not(.rpv-core__viewer--dark) .rpv-default-layout__toolbar .rpv-core__icon,
        .rpv-core__viewer:not(.rpv-core__viewer--dark) .rpv-default-layout__toolbar .rpv-core__minimal-button {
          color: #374151 !important;
        }
        .rpv-core__viewer:not(.rpv-core__viewer--dark) .rpv-default-layout__toolbar .rpv-core__minimal-button:hover {
          background-color: #e2e8f0 !important;
        }
        .rpv-core__viewer:not(.rpv-core__viewer--dark) .rpv-default-layout__toolbar .rpv-core__textbox {
          background: #ffffff !important;
          border: 1px solid #94a3b8 !important;
          color: #111827 !important;
          box-shadow: none !important;
        }
        .rpv-core__viewer:not(.rpv-core__viewer--dark) .rpv-default-layout__toolbar .rpv-core__textbox:focus {
          border-color: #64748b !important;
          outline: none !important;
          box-shadow: 0 0 0 1px #64748b !important;
        }
        .rpv-core__viewer:not(.rpv-core__viewer--dark) .rpv-default-layout__toolbar .rpv-zoom__popover-target-arrow {
          border-top-color: #111827 !important;
        }
        .rpv-core__viewer:not(.rpv-core__viewer--dark) .rpv-default-layout__sidebar-headers,
        .rpv-core__viewer:not(.rpv-core__viewer--dark) .rpv-default-layout__sidebar {
          background: #f3f4f6 !important;
          border-right: 1px solid #cbd5e1 !important;
        }
        .rpv-core__viewer:not(.rpv-core__viewer--dark) .rpv-default-layout__sidebar-headers .rpv-core__icon,
        .rpv-core__viewer:not(.rpv-core__viewer--dark) .rpv-default-layout__sidebar-headers .rpv-core__minimal-button {
          color: #374151 !important;
        }
        .rpv-core__viewer:not(.rpv-core__viewer--dark) .rpv-default-layout__sidebar-headers .rpv-core__minimal-button:hover,
        .rpv-core__viewer:not(.rpv-core__viewer--dark) .rpv-default-layout__sidebar-headers .rpv-core__minimal-button--selected {
          background-color: #e2e8f0 !important;
          color: #111827 !important;
        }
        .rpv-core__viewer--dark .rpv-default-layout__sidebar-headers {
          background: #1e293b !important;
          border-right: 1px solid #334155 !important;
        }
        .rpv-core__viewer--dark .rpv-default-layout__sidebar {
          background: #0f172a !important;
          border-right: 1px solid #1e293b !important;
        }
        @media (max-width: 640px) {
          .rpv-default-layout__sidebar { display: none !important; }
          .rpv-default-layout__main { left: 0 !important; }
          .rpv-toolbar__item button { min-width: 40px !important; min-height: 40px !important; }
        }
      `}</style>

      <header className="flex min-h-14 shrink-0 items-center gap-2 border-b border-slate-200 bg-white px-2 sm:px-4 dark:border-slate-700 dark:bg-slate-800">
        <Button
          type="button"
          onClick={handleBack}
          variant="ghost"
          size="sm"
          className="shrink-0 px-2 text-[#20659C] hover:bg-[#20659C]/10 dark:text-sky-400"
          aria-label="Go back"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Back</span>
        </Button>
        <span className="shrink-0 rounded bg-blue-600 px-2 py-0.5 text-[10px] font-extrabold tracking-wider text-white">
          PDF
        </span>
        <span className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
          {title}
        </span>

        {totalPages > 0 && (
          <div className="hidden w-64 shrink-0 lg:block">
            <ReadingProgressBar
              currentPage={currentPage}
              totalPages={totalPages}
              compact
            />
            {lastReadAt && (
              <p className="mt-0.5 truncate text-[10px] text-slate-500 dark:text-slate-400">
                Last read {new Date(lastReadAt).toLocaleString()}
              </p>
            )}
          </div>
        )}

        <BookmarkButton
          pageNumber={currentPage}
          isBookmarked={isCurrentPageBookmarked}
          isSaving={isCreatingBookmark}
          onSave={handleCreateBookmark}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            setShowNotes(false);
            setShowBookmarks((value) => !value);
          }}
          className="h-8 px-2.5 text-slate-600 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700"
          aria-label="Open bookmarks"
        >
          <BookmarkIcon className="h-4 w-4" />
          <span className="hidden md:inline">{bookmarks.length}</span>
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            setShowBookmarks(false);
            setShowNotes((value) => !value);
          }}
          className="h-8 px-2.5 text-slate-600 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700"
          aria-label="Open reading notes"
        >
          <NotebookPen className="h-4 w-4" />
          <span className="hidden md:inline">{notes.length}</span>
        </Button>
      </header>

      {totalPages > 0 && (
        <div className="shrink-0 border-b border-slate-200 bg-white px-3 py-2 lg:hidden dark:border-slate-700 dark:bg-slate-800">
          <ReadingProgressBar
            currentPage={currentPage}
            totalPages={totalPages}
            compact
          />
          {lastReadAt && (
            <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">
              Last read {new Date(lastReadAt).toLocaleString()}
            </p>
          )}
        </div>
      )}

      {showCompleted && (
        <div className="flex shrink-0 animate-[rpvSlide_.3s_ease_forwards] items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-2.5 text-sm font-semibold text-white">
          <PartyPopper className="h-5 w-5 shrink-0" />
          <span className="flex-1">
            Congratulations! You&apos;ve finished reading this book.
          </span>
          <CheckCircle2 className="h-4 w-4 opacity-80" />
          <button
            type="button"
            onClick={() => setShowCompleted(false)}
            aria-label="Dismiss"
            className="rounded-md bg-white/15 p-1.5 hover:bg-white/25"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div
        ref={readerContainerRef}
        className="relative flex-1 overflow-hidden"
        onMouseUp={handleTextSelection}
        onTouchEnd={handleTextSelection}
      >
        {shouldWaitForProgress ? (
          <div className="flex h-full items-center justify-center bg-slate-900">
            <div className="text-center">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-sky-400" />
              <p className="mt-3 text-sm text-slate-400">
                Restoring your reading position…
              </p>
            </div>
          </div>
        ) : (
          <Worker workerUrl={WORKER_URL}>
            <Viewer
              fileUrl={fileUrl}
              plugins={[layoutPlugin, scrollPlugin, pageNavPlugin]}
              defaultScale={SpecialZoomLevel.PageWidth}
              initialPage={Math.max(0, startingPage - 1)}
              scrollMode={ScrollMode.Vertical}
              renderPage={renderPage}
              renderError={renderError}
              onPageChange={handlePageChange}
              onDocumentLoad={handleDocumentLoad}
            />
          </Worker>
        )}

        {selection && (
          <TextSelectionPopup
            left={selection.left}
            top={selection.top}
            onAddNote={openAddNote}
            onCopy={handleCopySelection}
            onHighlight={handleHighlight}
          />
        )}

        <BookmarkSidebar
          open={showBookmarks}
          bookmarks={bookmarks}
          isLoading={areBookmarksLoading}
          deletingId={deletingBookmarkId}
          onClose={() => setShowBookmarks(false)}
          onNavigate={jumpToPage}
          onDelete={handleDeleteBookmark}
        />
        <ReadingNotesSidebar
          open={showNotes}
          notes={notes}
          isLoading={areNotesLoading}
          deletingId={deletingNoteId}
          onClose={() => setShowNotes(false)}
          onNavigate={jumpToPage}
          onEdit={handleEditNote}
          onDelete={handleDeleteNote}
        />
      </div>

      <AddNoteDialog
        open={noteDialogOpen}
        bookTitle={title}
        pageNumber={noteSelection?.pageNumber ?? currentPage}
        selectedText={noteSelection?.text ?? ""}
        editingNote={editingNote}
        isSaving={isCreatingNote || isUpdatingNote}
        onOpenChange={(open) => {
          setNoteDialogOpen(open);
          if (!open) {
            setEditingNote(null);
            setNoteSelection(null);
          }
        }}
        onSave={handleSaveNote}
      />
    </div>
  );
}
