"use client";

import React, { useEffect, useState } from "react";
import "./globals.css";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [copied, setCopied] = useState(false);
  const isDev = process.env.NODE_ENV === "development";

  useEffect(() => {
    // Log root failure in dev/console
    console.error("[Himdrishti Global Root Failure]:", error);

    // Detect prefers-reduced-motion
    if (typeof window !== "undefined") {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      setReducedMotion(mq.matches);
      const listener = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
      mq.addEventListener("change", listener);
      return () => mq.removeEventListener("change", listener);
    }
  }, [error]);

  const handleCopyDiagnostics = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      const payload = [
        `HIMDRISHTI CRITICAL GLOBAL FAILURE`,
        `Name: ${error.name || "Error"}`,
        `Message: ${error.message || "Unknown error"}`,
        `Digest: ${error.digest || "none"}`,
        `Timestamp: ${new Date().toISOString()}`,
        ``,
        `Stack Trace:`,
        error.stack || "No stack trace provided",
      ].join("\n");

      navigator.clipboard.writeText(payload);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <html lang="en" className="dark">
      <head>
        <title>Critical System Failure · Himdrishti</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body
        style={{
          margin: 0,
          padding: "1.5rem",
          backgroundColor: "#03060E",
          color: "#EBF5FC",
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "JetBrains Mono", monospace',
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxSizing: "border-box",
          overflowX: "hidden",
        }}
      >
        {/* Subtle polar grid backdrop */}
        <div
          style={{
            position: "fixed",
            inset: 0,
            pointerEvents: "none",
            backgroundImage:
              "radial-gradient(rgba(13, 185, 208, 0.08) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
            zIndex: 0,
          }}
          aria-hidden="true"
        />

        {/* Ambient radial red alert glow */}
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "600px",
            height: "600px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(217, 48, 48, 0.15) 0%, transparent 70%)",
            filter: "blur(60px)",
            pointerEvents: "none",
            zIndex: 0,
          }}
          aria-hidden="true"
        />

        {/* Outer HUD Chassis */}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            width: "100%",
            maxWidth: "640px",
            padding: "0.25rem",
            borderRadius: "1.5rem",
            backgroundColor: "rgba(13, 185, 208, 0.03)",
            border: "1px solid rgba(217, 48, 48, 0.35)",
            boxShadow:
              "0 25px 60px rgba(0, 0, 0, 0.8), 0 0 35px rgba(217, 48, 48, 0.15)",
          }}
        >
          {/* Inner HUD Core */}
          <div
            style={{
              padding: "2rem",
              borderRadius: "1.25rem",
              backgroundColor: "#050F1C",
              border: "1px solid rgba(255, 255, 255, 0.06)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Telemetry Header Bar */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                paddingBottom: "0.75rem",
                marginBottom: "1.5rem",
                fontSize: "11px",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "#7ABBD4",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span
                  style={{
                    display: "inline-block",
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    backgroundColor: "#D93030",
                    boxShadow: "0 0 8px #D93030",
                    animation: reducedMotion ? "none" : "pulse 2s infinite",
                  }}
                />
                <span style={{ fontWeight: 600, color: "#FECDD3" }}>
                  GLOBAL // ROOT SHELL CRASH
                </span>
              </div>
              <span style={{ color: "#3A6A7A" }}>ERR_CRITICAL_HALT</span>
            </div>

            {/* Error Glyph & Code */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                margin: "0.5rem 0 1.25rem",
              }}
            >
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "1rem",
                  backgroundColor: "rgba(217, 48, 48, 0.12)",
                  border: "1px solid rgba(217, 48, 48, 0.4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#FB7185",
                  marginBottom: "1rem",
                  boxShadow: "0 0 24px rgba(217, 48, 48, 0.25)",
                }}
              >
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points="12 2 2 22 22 22 12 2" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>

              <div
                style={{
                  display: "inline-block",
                  padding: "0.2rem 0.75rem",
                  borderRadius: "9999px",
                  backgroundColor: "rgba(217, 48, 48, 0.12)",
                  border: "1px solid rgba(217, 48, 48, 0.35)",
                  color: "#FDA4AF",
                  fontSize: "11px",
                  fontWeight: 600,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  marginBottom: "0.75rem",
                }}
              >
                ROOT EXCEPTION HALT
              </div>

              <h1
                style={{
                  margin: "0 0 0.5rem",
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  color: "#FFFFFF",
                  letterSpacing: "-0.02em",
                }}
              >
                Critical system failure.
              </h1>

              <p
                style={{
                  margin: 0,
                  fontSize: "13px",
                  lineHeight: "1.6",
                  color: "#7ABBD4",
                  maxWidth: "480px",
                }}
              >
                A fatal exception occurred in the root application architecture.
                The primary polar telemetry shell and station digital twin
                providers could not be mounted.
              </p>
            </div>

            {/* Diagnostic readout block */}
            <div
              style={{
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "0.75rem",
                padding: "0.85rem",
                fontSize: "11px",
                color: "#7ABBD4",
                marginBottom: "1.25rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                  paddingBottom: "0.4rem",
                  marginBottom: "0.5rem",
                  fontSize: "10px",
                  color: "#4A7A8E",
                }}
              >
                <span>HIMDRISHTI // ROOT DIAGNOSTICS</span>
                <span>STATUS: SHELL_OFFLINE</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "11px",
                  marginBottom: "0.25rem",
                }}
              >
                <span style={{ color: "#4A7A8E" }}>FAULT DIGEST:</span>
                <span style={{ color: "#0DB9D0", fontWeight: 600 }}>
                  {error.digest || "ERR_GLOBAL_ROOT_CRASH"}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "11px",
                }}
              >
                <span style={{ color: "#4A7A8E" }}>RECOMMENDED ACTION:</span>
                <span style={{ color: "#F43F5E", fontWeight: 600 }}>
                  RELOAD CORE RUNTIME PIPELINE
                </span>
              </div>
            </div>

            {/* Dev mode stack trace */}
            {isDev && (
              <details
                style={{
                  marginBottom: "1.25rem",
                  backgroundColor: "rgba(0, 0, 0, 0.7)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "0.75rem",
                  overflow: "hidden",
                  fontSize: "11px",
                }}
              >
                <summary
                  style={{
                    padding: "0.75rem 1rem",
                    cursor: "pointer",
                    color: "#0DB9D0",
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    userSelect: "none",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span>ROOT EXCEPTION DETAILS (DEV ONLY)</span>
                  <span style={{ fontSize: "10px", color: "#4A7A8E" }}>▼</span>
                </summary>
                <div
                  style={{
                    padding: "0.75rem 1rem",
                    borderTop: "1px solid rgba(255, 255, 255, 0.06)",
                    backgroundColor: "#000000",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <span style={{ color: "#F43F5E", fontWeight: 600 }}>
                      {error.name || "Error"}: {error.message || "Root layout error"}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyDiagnostics}
                      style={{
                        padding: "0.25rem 0.6rem",
                        borderRadius: "0.375rem",
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                        color: "#EBF5FC",
                        border: "none",
                        fontSize: "10px",
                        cursor: "pointer",
                        fontWeight: 600,
                      }}
                    >
                      {copied ? "COPIED" : "COPY"}
                    </button>
                  </div>
                  {error.stack && (
                    <pre
                      style={{
                        margin: 0,
                        padding: "0.5rem",
                        backgroundColor: "#040A12",
                        color: "#94A3B8",
                        borderRadius: "0.375rem",
                        maxHeight: "180px",
                        overflowX: "auto",
                        whiteSpace: "pre-wrap",
                        fontSize: "10px",
                        lineHeight: "1.5",
                      }}
                    >
                      {error.stack}
                    </pre>
                  )}
                </div>
              </details>
            )}

            {/* Action buttons */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "0.75rem",
                justifyContent: "center",
                marginTop: "0.5rem",
              }}
            >
              {/* Restart button */}
              <button
                type="button"
                onClick={() => {
                  try {
                    reset();
                  } catch (e) {
                    if (typeof window !== "undefined") window.location.reload();
                  }
                }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  padding: "0.75rem 1.5rem",
                  borderRadius: "9999px",
                  backgroundColor: "rgba(13, 185, 208, 0.2)",
                  color: "#EBF5FC",
                  border: "1px solid rgba(13, 185, 208, 0.5)",
                  fontSize: "12px",
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  boxShadow: "0 0 20px rgba(13, 185, 208, 0.2)",
                  transition: reducedMotion
                    ? "none"
                    : "transform 0.15s ease, background-color 0.15s ease",
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="23 4 23 10 17 10" />
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                </svg>
                <span>Restart Core</span>
              </button>

              {/* Return to Base link */}
              <a
                href="/"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  padding: "0.75rem 1.5rem",
                  borderRadius: "9999px",
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  color: "#7ABBD4",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  fontSize: "12px",
                  fontWeight: 500,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  textDecoration: "none",
                  cursor: "pointer",
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
                <span>Return to Base</span>
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
