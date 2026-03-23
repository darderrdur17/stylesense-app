"use client";

/**
 * Catches errors in the root layout. Must define html/body; global CSS may not apply.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          fontFamily: "system-ui, sans-serif",
          background: "#F8F9FC",
          color: "#1A1B2E",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        <h1 style={{ fontSize: "1.25rem", fontWeight: 700 }}>Something went wrong</h1>
        <p style={{ marginTop: 12, textAlign: "center", maxWidth: 400, fontSize: "0.9rem", opacity: 0.85 }}>
          StyleSense hit a critical error. Try again or refresh the page.
        </p>
        <button
          type="button"
          onClick={() => reset()}
          style={{
            marginTop: 24,
            padding: "10px 20px",
            borderRadius: 12,
            border: "none",
            fontWeight: 600,
            color: "#fff",
            background: "linear-gradient(135deg, #6C63FF, #FF8C42)",
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
