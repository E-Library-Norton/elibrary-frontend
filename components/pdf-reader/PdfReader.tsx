"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Worker,
  Viewer,
  SpecialZoomLevel,
  ScrollMode,
  RenderPage,
  RenderPageProps,
} from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import { pageNavigationPlugin } from "@react-pdf-viewer/page-navigation";
import { scrollModePlugin } from "@react-pdf-viewer/scroll-mode";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  updateCurrentPage,
  addReadingTime,
  updateReadingProgress,
  hydrateLibrary,
} from "@/store/slices/librarySlice";
import { selectCurrentUser } from "@/store/slices/authSlice";
import { CheckCircle2, PartyPopper, X, ArrowLeft, AlertTriangle } from "lucide-react";

// Points safely to your local public folder instead of the external CDN url
// @/components/pdf-reader/PdfReader.tsx

// Change this back to the absolute CDN path:
const WORKER_URL = "https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js";
const READING_INTERVAL_MS = 30_000;
const COMPLETION_TOAST_MS = 8_000;

interface PdfReaderProps {
  fileUrl: string;
  title?: string;
  coverUrl?: string | null;
  bookId?: string | number;
  backHref?: string;
}

// ── Error fallback 
const renderError = () => (
  <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"100%", gap:14, padding:24, background:"#0f172a" }}>
    <AlertTriangle style={{ width:48, height:48, color:"#ef4444" }} />
    <p style={{ fontSize:16, fontWeight:700, color:"#f1f5f9", margin:0 }}>Failed to load PDF</p>
    <p style={{ fontSize:13, color:"#64748b", margin:0, textAlign:"center" }}>The file may be unavailable or corrupted.</p>
  </div>
);

// ── Page layer: correct render order 
const renderPage: RenderPage = (props: RenderPageProps) => (
  <>
    {props.canvasLayer.children}
    {props.annotationLayer.children}
    {props.textLayer.children}
  </>
);

export default function PdfReader({ fileUrl, title, coverUrl, bookId, backHref }: PdfReaderProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectCurrentUser);
  const numericBookId = bookId ? Number(bookId) : 0;

  const storageKey = (id: string | number) =>
    user?.id ? `pdf_page_${user.id}_${id}` : `pdf_page_${id}`;

  const [showCompleted, setShowCompleted] = useState(false);
  const totalPagesRef = useRef(0);
  const timeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasShownCompletedRef = useRef(false);

  const savedPage = bookId
    ? parseInt(localStorage.getItem(storageKey(bookId)) ?? "1", 10) || 1
    : 1;

  // ── Hydrate library ──────────────
  useEffect(() => {
    if (user?.id) dispatch(hydrateLibrary(user.id));
  }, [dispatch, user?.id]);

  const handleBack = useCallback(() => {
    if (backHref) router.push(backHref);
    else router.back();
  }, [backHref, router]);

  // ── Reading time tracker ─────────
  useEffect(() => {
    if (!numericBookId) return;
    timeIntervalRef.current = setInterval(() => {
      dispatch(addReadingTime({ bookId: numericBookId, seconds: 30 }));
    }, READING_INTERVAL_MS);
    return () => {
      if (timeIntervalRef.current) clearInterval(timeIntervalRef.current);
    };
  }, [dispatch, numericBookId]);

  // ── When the PDF document loads, we get the real total page count ──────────
  const handleDocumentLoad = useCallback(
    (e: { doc: { numPages: number } }) => {
      totalPagesRef.current = e.doc.numPages;

      if (numericBookId) {
        dispatch(
          updateReadingProgress({
            bookId: numericBookId,
            title,
            coverUrl,
            currentPage: savedPage,
            totalPages: e.doc.numPages,
            lastReadAt: new Date().toISOString(),
            timeSpentSeconds: 0,
          })
        );
      }
    },
    [numericBookId, dispatch, title, coverUrl, savedPage]
  );

  // ── On every page turn, update Redux + simple localStorage ─────────────────
  const handlePageChange = useCallback(
    ({ currentPage }: { currentPage: number }) => {
      if (!bookId) return;

      const pageNum = currentPage + 1; // viewer is 0-indexed

      localStorage.setItem(storageKey(bookId), String(pageNum));

      if (numericBookId && totalPagesRef.current > 0) {
        dispatch(
          updateCurrentPage({
            bookId: numericBookId,
            currentPage: pageNum,
            totalPages: totalPagesRef.current,
            title,
            coverUrl,
          })
        );

        if (pageNum >= totalPagesRef.current && !hasShownCompletedRef.current) {
          hasShownCompletedRef.current = true;
          setShowCompleted(true);
          setTimeout(() => setShowCompleted(false), COMPLETION_TOAST_MS);
        }
      }
    },
    [bookId, numericBookId, dispatch, title, coverUrl]
  );

  // ── Plugins ───
  const scrollPlugin = scrollModePlugin();
  const pageNavPlugin = pageNavigationPlugin();
  const layoutPlugin = defaultLayoutPlugin({
    sidebarTabs: (defaultTabs) => defaultTabs,
  });

  useEffect(() => {
    scrollPlugin.switchScrollMode(ScrollMode.Vertical);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100dvh", width:"100%", background:"#0f172a", overflow:"hidden", fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif' }}>

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
        .rpv-core__canvas-layer canvas {
          animation: rpvFade .2s ease forwards;
        }
        @keyframes rpvFade {
          from { opacity:0; transform:translateY(6px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes rpvSlide {
          from { opacity:0; transform:translateY(-8px); }
          to   { opacity:1; transform:translateY(0); }
        }
        /* PDF toolbar — light theme */
        .rpv-core__viewer:not(.rpv-core__viewer--dark)
          .rpv-default-layout__toolbar {
          background: #f3f4f6 !important;
          border-bottom: 1px solid #cbd5e1 !important;
          color: #111827 !important;
        }

        .rpv-core__viewer:not(.rpv-core__viewer--dark)
          .rpv-default-layout__toolbar
          .rpv-toolbar__label,
        .rpv-core__viewer:not(.rpv-core__viewer--dark)
          .rpv-default-layout__toolbar
          .rpv-zoom__popover-target {
          color: #111827 !important;
        }

        .rpv-core__viewer:not(.rpv-core__viewer--dark)
          .rpv-default-layout__toolbar
          .rpv-core__icon,
        .rpv-core__viewer:not(.rpv-core__viewer--dark)
          .rpv-default-layout__toolbar
          .rpv-core__minimal-button {
          color: #374151 !important;
        }

        .rpv-core__viewer:not(.rpv-core__viewer--dark)
          .rpv-default-layout__toolbar
          .rpv-core__minimal-button:hover {
          background-color: #e2e8f0 !important;
        }

        .rpv-core__viewer:not(.rpv-core__viewer--dark)
          .rpv-default-layout__toolbar
          .rpv-core__textbox {
          background: #ffffff !important;
          border: 1px solid #94a3b8 !important;
          color: #111827 !important;
          box-shadow: none !important;
        }

        .rpv-core__viewer:not(.rpv-core__viewer--dark)
          .rpv-default-layout__toolbar
          .rpv-core__textbox:focus {
          border-color: #64748b !important;
          outline: none !important;
          box-shadow: 0 0 0 1px #64748b !important;
        }

        .rpv-core__viewer:not(.rpv-core__viewer--dark)
          .rpv-default-layout__toolbar
          .rpv-zoom__popover-target-arrow {
          border-top-color: #111827 !important;
        }

        /* PDF sidebar — light theme, same gray as toolbar */
        .rpv-core__viewer:not(.rpv-core__viewer--dark)
          .rpv-default-layout__sidebar-headers {
          background: #f3f4f6 !important;
          border-right: 1px solid #cbd5e1 !important;
        }

        .rpv-core__viewer:not(.rpv-core__viewer--dark)
          .rpv-default-layout__sidebar {
          background: #f3f4f6 !important;
          border-right: 1px solid #cbd5e1 !important;
        }

        .rpv-core__viewer:not(.rpv-core__viewer--dark)
          .rpv-default-layout__sidebar-headers
          .rpv-core__icon,
        .rpv-core__viewer:not(.rpv-core__viewer--dark)
          .rpv-default-layout__sidebar-headers
          .rpv-core__minimal-button {
          color: #374151 !important;
        }

        .rpv-core__viewer:not(.rpv-core__viewer--dark)
          .rpv-default-layout__sidebar-headers
          .rpv-core__minimal-button:hover {
          background-color: #e2e8f0 !important;
        }

        .rpv-core__viewer:not(.rpv-core__viewer--dark)
          .rpv-default-layout__sidebar-headers
          .rpv-core__minimal-button--selected {
          background-color: #e2e8f0 !important;
          color: #111827 !important;
        }

        .rpv-core__viewer:not(.rpv-core__viewer--dark)
          .rpv-thumbnail__item:hover {
          border-color: #64748b !important;
        }

        /* Keep the existing dark sidebar */
        .rpv-core__viewer--dark .rpv-default-layout__sidebar-headers {
          background: #1e293b !important;
          border-right: 1px solid #334155 !important;
        }

        .rpv-core__viewer--dark .rpv-default-layout__sidebar {
          background: #0f172a !important;
          border-right: 1px solid #1e293b !important;
        }

        .rpv-core__viewer--dark .rpv-thumbnail__item:hover {
          border-color: #3b82f6 !important;
        }
        @media (max-width: 640px) {
          .rpv-default-layout__sidebar { display: none !important; }
          .rpv-default-layout__main   { left: 0 !important; }
          .rpv-toolbar__item button   { min-width: 40px !important; min-height: 40px !important; }
          .pdf-back-label             { display: none !important; }
        }
      `}</style>

      <div style={{ display:"flex", alignItems:"center", gap:8, padding:"0 14px", height:50, minHeight:50, flexShrink:0, background:"#1e293b", borderBottom:"1px solid #334155", userSelect:"none" }}>
        <button
          onClick={handleBack}
          aria-label="Go back"
          style={{ display:"flex", alignItems:"center", gap:6, background:"rgba(59,130,246,0.1)", border:"1px solid rgba(59,130,246,0.28)", borderRadius:8, padding:"7px 12px", cursor:"pointer", color:"#60a5fa", fontSize:13, fontWeight:600, flexShrink:0, WebkitTapHighlightColor:"transparent", transition:"background .15s,border-color .15s" }}
          onMouseEnter={e => { const b = e.currentTarget; b.style.background="rgba(59,130,246,.22)"; b.style.borderColor="rgba(59,130,246,.55)"; }}
          onMouseLeave={e => { const b = e.currentTarget; b.style.background="rgba(59,130,246,.1)"; b.style.borderColor="rgba(59,130,246,.28)"; }}
        >
          <ArrowLeft style={{ width:15, height:15, flexShrink:0 }} />
          <span className="pdf-back-label">Back</span>
        </button>

        <span style={{ background:"#3b82f6", borderRadius:5, padding:"2px 7px", fontSize:10, fontWeight:800, letterSpacing:1.2, color:"#fff", flexShrink:0 }}>PDF</span>

        {title && (
          <span style={{ flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", color:"#f1f5f9", fontSize:14, fontWeight:600 }}>
            {title}
          </span>
        )}

        {bookId && savedPage > 1 && (
          <span style={{ fontSize:11, color:"#475569", fontWeight:400, flexShrink:0, whiteSpace:"nowrap" }}>p.{savedPage}</span>
        )}
      </div>

      {showCompleted && (
        <div style={{ display:"flex", alignItems:"center", gap:10, padding:"11px 16px", background:"linear-gradient(135deg,#059669,#10b981)", color:"#fff", fontSize:"clamp(12px,3.5vw,14px)", fontWeight:600, flexShrink:0, animation:"rpvSlide .3s cubic-bezier(.16,1,.3,1) forwards" }}>
          <PartyPopper style={{ width:20, height:20, flexShrink:0 }} />
          <span style={{ flex:1 }}>🎉 Congratulations! You&apos;ve finished reading this book!</span>
          <CheckCircle2 style={{ width:18, height:18, opacity:.7, flexShrink:0 }} />
          <button onClick={() => setShowCompleted(false)} aria-label="Dismiss" style={{ background:"rgba(255,255,255,.2)", border:"none", borderRadius:6, padding:"5px 7px", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, WebkitTapHighlightColor:"transparent" }}>
            <X style={{ width:14, height:14, color:"#fff" }} />
          </button>
        </div>
      )}

      <div style={{ flex:1, overflow:"hidden", position:"relative", WebkitOverflowScrolling:"touch" }}>
        <Worker workerUrl={WORKER_URL}>
          <Viewer
            fileUrl={fileUrl}
            plugins={[layoutPlugin, scrollPlugin, pageNavPlugin]}
            defaultScale={SpecialZoomLevel.PageWidth}
            initialPage={savedPage - 1}
            scrollMode={ScrollMode.Vertical}
            renderPage={renderPage}
            renderError={renderError}
            onPageChange={handlePageChange}
            onDocumentLoad={handleDocumentLoad}
          />
        </Worker>
      </div>
    </div>
  );
}