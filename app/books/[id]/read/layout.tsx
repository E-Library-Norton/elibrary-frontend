import { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Reading Mode | Norton University E-Library",
  description: "Immersive reading view.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Prevents layout zooming gestures while panning pages
};

export default function ReadLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Force container grid block boundaries with zero top padding offsets
    <div className="fixed inset-0 z-50 h-screen w-screen overflow-hidden bg-[#0f172a] p-0 m-0">
      {children}
    </div>
  );
}