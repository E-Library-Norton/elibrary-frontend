# Norton E-Library Student Frontend

> Last updated: June 3, 2026

This is the public student-facing web app for Norton E-Library. It is a Next.js App Router application that lets students browse books, read PDFs online, download authenticated files, manage their profile, submit reviews and feedback, and receive push notifications.

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
cd frontend
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
| `/books/[id]/read` | In-browser PDF reader |
| `/videos` | Video materials |
| `/audios` | Audio materials |
| `/library` | Personal library, favorites, history, and reading progress |
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
| `/api/categories` | `/api/categories` |
| `/api/stats` | `/api/stats/public` |
| `/api/reviews/*` | `/api/reviews/*` and `/api/books/:id/reviews` |
| `/api/feedback/*` | `/api/feedback/*` |
| `/api/push/*` | `/api/push/*` |

## State And Data Flow

- `store/api/baseApi.ts` defines a single RTK Query API using same-origin `/api` proxy routes.
- `authApi.ts` handles login, register, logout, profile, password, avatar, and verification email operations.
- `booksApi.ts` loads books, categories, public stats, and signed video/audio URLs.
- `reviewApi.ts` handles book reviews, public reviews, and the current user's reviews.
- `feedbackApi.ts` handles public feedback submission and public testimonials.
- `pushApi.ts` handles VAPID key lookup, subscribe, and unsubscribe.
- `librarySlice.ts` keeps favorites, history, reading progress, and local library state.
- `SocketProvider.tsx` connects to the backend Socket.IO server for realtime events.

## Media And SEO

- Book covers, PDFs, videos, audio files, and avatars are served through backend R2 helpers and signed URL endpoints.
- The reader page uses dynamic PDF imports to avoid SSR issues with browser-only PDF.js APIs.
- The book detail share modal renders a local SVG QR code with `react-qr-code` for the stable `/books/[id]` URL, plus Twitter, Facebook, Telegram, and copy-link actions.
- `app/sitemap.xml/route.ts`, `app/robots.txt/route.ts`, `app/og/route.tsx`, `BookSchema`, and `lib/seo.ts` cover sitemap, robots, Open Graph, and structured data.

## Deployment

Deploy on Vercel from the `frontend` folder. Set the same environment variables listed above in Vercel Project Settings. The production API URL must include the `/api` suffix.
