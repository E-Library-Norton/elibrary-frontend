import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  try {
    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            alignItems: "flex-start",
            width: "100%",
            height: "100%",
            padding: "60px",
            background: "linear-gradient(135deg, #1e3a8a 0%, #0c4a6e 50%, #164e63 100%)",
            fontFamily: "system-ui, -apple-system, sans-serif",
            position: "relative", // Crucial for absolute children
          }}
        >
          {/* Background decorative elements */}
          <div
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: "400px",
              height: "400px",
              background: "radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              width: "300px",
              height: "300px",
              background: "radial-gradient(circle, rgba(34,197,94,0.05) 0%, transparent 70%)",
            }}
          />

          {/* Top/Main Content Area */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px", zIndex: 1 }}>
            {/* Logo Header */}
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div
                style={{
                  display: "flex",
                  width: "56px",
                  height: "56px",
                  background: "rgba(34, 211, 238, 0.15)",
                  borderRadius: "14px",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "32px",
                }}
              >
                📚
              </div>
              <span style={{ fontSize: "28px", fontWeight: 700, color: "#22d3ee" }}>
                E-Library
              </span>
            </div>

            {/* Typography */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "800px" }}>
              <div
                style={{
                  fontSize: "64px",
                  fontWeight: 800,
                  color: "#ffffff",
                  letterSpacing: "-0.02em",
                }}
              >
                Norton University E-Library
              </div>
              <div
                style={{
                  fontSize: "28px",
                  color: "#e0f2fe",
                  fontWeight: 400,
                  lineHeight: "1.4",
                }}
              >
                Access 50,000+ Academic Books, Videos & Lessons
              </div>
            </div>
          </div>

          {/* Bottom Row: Metrics & Branding */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              width: "100%",
              zIndex: 1,
            }}
          >
            {/* Metrics group */}
            <div style={{ display: "flex", gap: "48px" }}>
              {[
                { val: "50K+", label: "Resources" },
                { val: "100%", label: "Free Access" },
                { val: "24/7", label: "Available" },
              ].map((stat, i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <div style={{ fontSize: "32px", fontWeight: 700, color: "#22d3ee" }}>{stat.val}</div>
                  <div style={{ fontSize: "16px", color: "#94a3b8", fontWeight: 500 }}>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* URL Branding */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "18px", color: "#94a3b8" }}>
              <span>🎓</span>
              <span>elibrary.nortonu.app</span>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error("OG Image generation failed:", error);
    return new Response("Failed to generate image", { status: 500 });
  }
}