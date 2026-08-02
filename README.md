# Norton E-Library Student Frontend

> Last updated: August 2, 2026

This is the public student-facing web app for Norton E-Library. It is a Next.js App Router application that lets students browse books and authors, consume PDF/video/audio materials, download authenticated files, manage their profile and library, save reading progress/bookmarks/notes, submit reviews and feedback, and receive push notifications.

## Stack

| Area | Technology |
|---|---|
| Framework | Next.js 16, React 19, TypeScript |
| Styling | Tailwind CSS 4, shadcn/Radix UI primitives |
| State | Redux Toolkit, RTK Query |
| PDF reader | `@react-pdf-viewer`, `pdfjs-dist` |
| Book sharing | `react-qr-code`, social share URLs, clipboard copy |
| Realtime | `socket.io-client` |
| UX | Framer Motion, Sonner, next-themes |

## Local Setup

```bash
cd elibrary-frontend
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

The backend should be running at the URL configured by `NEXT_PUBLIC_BACKEND_URL`, usually `http://localhost:5005/api`.

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Build the production app |
| `npm run start` | Start the production build |
| `npm run lint` | Run ESLint |

## Environment

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_BACKEND_URL` | Yes | Express API base URL, including `/api` |
| `NEXT_PUBLIC_SITE_URL` | Yes | Canonical site URL for SEO, Open Graph, and sitemap output |
| `COOKIE_SECRET` | Yes | Server-only AES secret used by API proxy routes for auth cookies |

Generate a cookie secret with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## App Routes

| Route | Purpose |
|---|---|
| `/` | Home page with hero, featured books, videos, audios, stats, categories, testimonials, and CTA |
| `/books` | Public catalog with search, filters, sorting, and pagination |
| `/books/[id]` | Book detail, metadata, reviews, media links, share modal, and actions |
| `/books/[id]/read` | PDF reader with server-synced progress, page bookmarks, highlights, and notes |
| `/authors` | Public author directory |
| `/authors/[authorId]` | Author profile and authored books |
| `/videos` | Video materials |
| `/audios` | Audio materials |
| `/library` | Local favorites/history plus server-backed Reading and Completed collections |
| `/profile` | Profile editing, avatar upload, and password change |
| `/auth/signin` | Email, username, or student ID login |
| `/auth/signup` | Student registration |
| `/auth/forgot-password` | OTP request flow |
| `/auth/reset-password` | Password reset flow |
| `/auth/callback` | OAuth callback handoff |
| `/about` | Project and team information |
| `/contact` | Contact and feedback form |

## API Proxy Routes

The browser talks to same-origin Next.js routes under `/api`. Those routes forward to the Express backend configured by `NEXT_PUBLIC_BACKEND_URL`, and auth routes manage HTTP-only cookies.

| Proxy Group | Backend Target |
|---|---|
| `/api/auth/*` | `/api/auth/*` |
| `/api/books` and `/api/books/[id]/*` | `/api/books/*` |
| `/api/books/[id]/reading-progress` | `/api/books/:id/reading-progress` |
| `/api/books/[id]/bookmarks/*` | `/api/books/:id/bookmarks/*` |
| `/api/books/[id]/notes/*` | `/api/books/:id/notes/*` |
| `/api/library/reading-progress` | `/api/library/reading-progress` |
| `/api/categories` | `/api/categories` |
| `/api/stats` | `/api/stats/public` |
| `/api/reviews/*` | `/api/reviews/*` and `/api/books/:id/reviews` |
| `/api/feedback/*` | `/api/feedback/*` |
| `/api/push/*` | `/api/push/*` |
| `/api/users/[id]/avatar` | `/api/users/:id/avatar` |

## State And Data Flow

- `store/api/baseApi.ts` defines a single RTK Query API using same-origin `/api` proxy routes.
- `authApi.ts` handles login, register, logout, profile, password, avatar, and verification email operations.
- `booksApi.ts` loads books, categories, public stats, and signed video/audio URLs.
- `reviewApi.ts` handles book reviews, public reviews, and the current user's reviews.
- `feedbackApi.ts` handles public feedback submission and public testimonials.
- `pushApi.ts` handles VAPID key lookup, subscribe, and unsubscribe.
- `readingApi.ts` synchronizes reading progress, page bookmarks, reading notes, and the Reading/Completed library with PostgreSQL.
- `librarySlice.ts` keeps per-user local favorites, recent history, reading time, and a resilience fallback for page progress.
- `SocketProvider.tsx` connects to the backend Socket.IO server for realtime events.

## Media And SEO

- Book covers, PDFs, videos, audio files, and avatars are served through backend R2 helpers and signed URL endpoints.
- The reader page uses dynamic PDF imports to avoid SSR issues with browser-only PDF.js APIs and debounces progress writes to the backend.
- The book detail share modal renders a local SVG QR code with `react-qr-code` for the stable `/books/[id]` URL, plus Twitter, Facebook, Telegram, and copy-link actions.
- Completed books expose citation generation in APA, MLA, Chicago, and IEEE formats.
- `app/sitemap.xml/route.ts`, `app/robots.txt/route.ts`, `app/og/route.tsx`, `BookSchema`, and `lib/seo.ts` cover sitemap, robots, Open Graph, and structured data.

## Deployment

Deploy on Vercel from the `elibrary-frontend` folder. Set the same environment variables listed above in Vercel Project Settings. The production API URL must include the `/api` suffix.
