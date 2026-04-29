"use client";

import { Suspense, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SignInBody />
    </Suspense>
  );
}

function SignInBody() {
  const { signIn, signInWithGoogle } = useAuth();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const lang = (params.lang as string) || "en";
  const nextParam = searchParams.get("next");
  const nextPath =
    nextParam && nextParam.startsWith("/") ? nextParam : `/${lang}/intranet`;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showEmail, setShowEmail] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const { error: authError } = await signIn(email, password);
    if (authError) {
      setError(authError.message);
      setSubmitting(false);
    } else {
      router.replace(nextPath);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    try {
      await signInWithGoogle();
    } catch {
      setError("Google sign-in failed. Please try again.");
    }
  };

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap');
      `}</style>
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(180deg, #d8e8ca 0%, #dde8d2 35%, #f4f7f1 100%)",
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='52' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l30 15v22L30 52 0 37V15z' fill='none' stroke='%234fd1c5' stroke-width='0.4' opacity='0.12'/%3E%3C/svg%3E")`,
          fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
          padding: "24px",
        }}
      >
        {/* Logo / Title */}
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <h1
            style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: "clamp(2rem, 5vw, 3rem)",
              color: "#1a2412",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              margin: 0,
            }}
          >
            Sponic Garden
          </h1>
          <p
            style={{
              color: "#7a9168",
              fontSize: "0.85rem",
              letterSpacing: "0.15em",
              textTransform: "lowercase",
              marginTop: "8px",
            }}
          >
            the art and science of cultivation
          </p>
        </div>

        {/* Sign-in Card */}
        <div
          style={{
            width: "100%",
            maxWidth: "380px",
            background: "rgba(255, 255, 255, 0.85)",
            backdropFilter: "blur(12px)",
            borderRadius: "16px",
            border: "1px solid #c4d4ba",
            padding: "40px 32px",
            boxShadow: "0 4px 24px rgba(26, 36, 18, 0.08)",
          }}
        >
          {error && (
            <div
              style={{
                background: "rgba(146, 64, 14, 0.06)",
                border: "1px solid rgba(146, 64, 14, 0.20)",
                color: "#92400e",
                fontSize: "0.8rem",
                borderRadius: "8px",
                padding: "10px 14px",
                marginBottom: "20px",
              }}
            >
              {error}
            </div>
          )}

          {/* Google Button */}
          <button
            onClick={handleGoogleSignIn}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              padding: "14px 24px",
              background: "#2d6a1e",
              color: "#ffffff",
              border: "none",
              borderRadius: "10px",
              fontSize: "0.95rem",
              fontWeight: 600,
              fontFamily: "'DM Sans', sans-serif",
              cursor: "pointer",
              transition: "all 0.2s",
              boxShadow: "0 2px 8px rgba(45, 106, 30, 0.30)",
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = "#245816")}
            onMouseOut={(e) => (e.currentTarget.style.background = "#2d6a1e")}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#fff" fillOpacity="0.9" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#fff" fillOpacity="0.7" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#fff" fillOpacity="0.5" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#fff" fillOpacity="0.6" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          {/* Email toggle */}
          {!showEmail && (
            <button
              onClick={() => setShowEmail(true)}
              style={{
                width: "100%",
                marginTop: "16px",
                padding: "8px",
                background: "none",
                border: "none",
                color: "#7a9168",
                fontSize: "0.75rem",
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Sign in with email instead
            </button>
          )}

          {/* Email form - collapsed by default, smaller */}
          {showEmail && (
            <>
              <div
                style={{
                  margin: "20px 0 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <div style={{ flex: 1, height: "1px", background: "#c4d4ba" }} />
                <span style={{ color: "#7a9168", fontSize: "0.7rem", letterSpacing: "0.05em" }}>
                  or use email
                </span>
                <div style={{ flex: 1, height: "1px", background: "#c4d4ba" }} />
              </div>

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid #c4d4ba",
                    background: "#f4f7f1",
                    color: "#1a2412",
                    fontSize: "0.75rem",
                    fontFamily: "'DM Sans', sans-serif",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid #c4d4ba",
                    background: "#f4f7f1",
                    color: "#1a2412",
                    fontSize: "0.75rem",
                    fontFamily: "'DM Sans', sans-serif",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: "8px 16px",
                    background: "transparent",
                    border: "1px solid #c4d4ba",
                    borderRadius: "6px",
                    color: "#4a6040",
                    fontSize: "0.75rem",
                    fontWeight: 500,
                    fontFamily: "'DM Sans', sans-serif",
                    cursor: "pointer",
                    opacity: submitting ? 0.5 : 1,
                  }}
                >
                  {submitting ? "Signing in..." : "Sign In"}
                </button>
              </form>
            </>
          )}
        </div>

        {/* Back link */}
        <Link
          href={`/${lang}`}
          style={{
            marginTop: "24px",
            color: "#7a9168",
            fontSize: "0.8rem",
            textDecoration: "none",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          &larr; Back to site
        </Link>
      </div>
    </>
  );
}
