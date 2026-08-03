import { Google_Sans, Noto_Sans_Khmer } from "next/font/google";

// The licensed Google Sans WOFF2 files are not present in this repository, so
// next/font/google is used for now. Loading only the Latin subset is
// intentional: Khmer glyphs then fall through to Noto Sans Khmer in the global
// font stack. Next.js still self-hosts both fonts in the production build.
export const googleSans = Google_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-google-sans",
  fallback: ["Arial", "sans-serif"],
});

export const notoSansKhmer = Noto_Sans_Khmer({
  subsets: ["khmer"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-noto-sans-khmer",
  fallback: ["Arial", "sans-serif"],
});
