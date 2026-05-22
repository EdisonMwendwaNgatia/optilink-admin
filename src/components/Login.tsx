/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from "react";
import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { toast } from "react-hot-toast";
import type { FirebaseError } from "firebase/app";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [, setFocused] = useState<"email" | "password" | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Login successful!");
    } catch (err: unknown) {
      const error = err as FirebaseError;
      let errorText = "Login failed. Please try again.";

      switch (error.code) {
        case "auth/invalid-email":
          errorText = "Invalid email format";
          break;
        case "auth/user-disabled":
          errorText = "This account has been disabled";
          break;
        case "auth/user-not-found":
          errorText = "No account found with this email";
          break;
        case "auth/wrong-password":
          errorText = "Incorrect password";
          break;
        case "auth/too-many-requests":
          errorText = "Too many failed attempts. Try again later";
          break;
        case "auth/network-request-failed":
          errorText = "Network error. Check your connection";
          break;
      }

      setErrorMessage(errorText);
      toast.error(errorText);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .login-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #080b12;
          font-family: 'DM Mono', monospace;
          overflow: hidden;
          position: relative;
        }

        .grid-bg {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(0,210,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,210,255,0.04) 1px, transparent 1px);
          background-size: 48px 48px;
          mask-image: radial-gradient(ellipse 70% 70% at 50% 50%, black 30%, transparent 100%);
        }

        .glow-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(120px);
          pointer-events: none;
        }
        .glow-orb-1 {
          width: 500px; height: 500px;
          top: -140px; right: -100px;
          background: radial-gradient(circle, rgba(0,180,255,0.12) 0%, transparent 70%);
        }
        .glow-orb-2 {
          width: 400px; height: 400px;
          bottom: -100px; left: -80px;
          background: radial-gradient(circle, rgba(120,40,255,0.1) 0%, transparent 70%);
        }

        .card {
          position: relative;
          width: 100%;
          max-width: 420px;
          margin: 1.5rem;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 2px;
          padding: 2.75rem 2.5rem 2.5rem;
          backdrop-filter: blur(24px);
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .card.visible {
          opacity: 1;
          transform: translateY(0);
        }

        /* Corner accents */
        .card::before, .card::after {
          content: '';
          position: absolute;
          width: 18px; height: 18px;
        }
        .card::before {
          top: -1px; left: -1px;
          border-top: 2px solid #00d2ff;
          border-left: 2px solid #00d2ff;
        }
        .card::after {
          bottom: -1px; right: -1px;
          border-bottom: 2px solid #00d2ff;
          border-right: 2px solid #00d2ff;
        }
        .corner-tr {
          position: absolute;
          top: -1px; right: -1px;
          width: 18px; height: 18px;
          border-top: 2px solid rgba(0,210,255,0.4);
          border-right: 2px solid rgba(0,210,255,0.4);
        }
        .corner-bl {
          position: absolute;
          bottom: -1px; left: -1px;
          width: 18px; height: 18px;
          border-bottom: 2px solid rgba(0,210,255,0.4);
          border-left: 2px solid rgba(0,210,255,0.4);
        }

        .header {
          margin-bottom: 2.25rem;
        }

        .badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(0,210,255,0.08);
          border: 1px solid rgba(0,210,255,0.2);
          border-radius: 2px;
          padding: 4px 10px;
          margin-bottom: 1.25rem;
        }
        .badge-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #00d2ff;
          box-shadow: 0 0 8px #00d2ff;
          animation: pulse 2s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .badge-text {
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          font-weight: 500;
          color: #00d2ff;
          letter-spacing: 0.15em;
          text-transform: uppercase;
        }

        .title {
          font-family: 'Syne', sans-serif;
          font-size: 2rem;
          font-weight: 800;
          color: #fff;
          line-height: 1.1;
          letter-spacing: -0.02em;
        }
        .title span {
          color: #00d2ff;
        }
        .subtitle {
          margin-top: 6px;
          font-size: 11px;
          color: rgba(255,255,255,0.28);
          letter-spacing: 0.05em;
        }

        .divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);
          margin-bottom: 2rem;
        }

        .error-bar {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255,60,60,0.08);
          border: 1px solid rgba(255,60,60,0.25);
          border-radius: 2px;
          padding: 10px 12px;
          margin-bottom: 1.25rem;
          font-size: 11px;
          color: #ff7070;
          letter-spacing: 0.04em;
        }
        .error-bar::before {
          content: '!';
          display: flex;
          align-items: center;
          justify-content: center;
          width: 16px; height: 16px;
          min-width: 16px;
          background: rgba(255,60,60,0.2);
          border-radius: 50%;
          font-size: 10px;
          font-weight: 700;
          color: #ff7070;
        }

        .field {
          margin-bottom: 1.1rem;
        }
        .field-label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 10px;
          font-weight: 500;
          color: rgba(255,255,255,0.35);
          letter-spacing: 0.12em;
          text-transform: uppercase;
          margin-bottom: 8px;
        }
        .field-label-line {
          flex: 1;
          height: 1px;
          background: rgba(255,255,255,0.06);
        }

        .input-wrap {
          position: relative;
        }
        .input-icon {
          position: absolute;
          left: 13px;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(255,255,255,0.2);
          transition: color 0.2s;
          pointer-events: none;
          display: flex;
        }
        .input-wrap:focus-within .input-icon {
          color: #00d2ff;
        }

        .field-input {
          width: 100%;
          padding: 11px 12px 11px 38px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 2px;
          color: #fff;
          font-family: 'DM Mono', monospace;
          font-size: 13px;
          outline: none;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
          letter-spacing: 0.02em;
        }
        .field-input::placeholder {
          color: rgba(255,255,255,0.15);
        }
        .field-input:focus {
          border-color: rgba(0,210,255,0.4);
          background: rgba(0,210,255,0.04);
          box-shadow: 0 0 0 3px rgba(0,210,255,0.07), inset 0 1px 0 rgba(255,255,255,0.04);
        }

        .submit-btn {
          width: 100%;
          margin-top: 1.5rem;
          padding: 13px;
          background: #00d2ff;
          border: none;
          border-radius: 2px;
          color: #080b12;
          font-family: 'Syne', sans-serif;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: transform 0.15s, box-shadow 0.2s, background 0.2s;
          box-shadow: 0 0 24px rgba(0,210,255,0.25);
        }
        .submit-btn:hover:not(:disabled) {
          background: #33daff;
          box-shadow: 0 0 36px rgba(0,210,255,0.4);
          transform: translateY(-1px);
        }
        .submit-btn:active:not(:disabled) {
          transform: translateY(0);
        }
        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-inner {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .spinner {
          width: 14px; height: 14px;
          border: 2px solid rgba(8,11,18,0.3);
          border-top-color: #080b12;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .footer-note {
          margin-top: 1.5rem;
          text-align: center;
          font-size: 10px;
          color: rgba(255,255,255,0.15);
          letter-spacing: 0.08em;
        }

        /* scan line effect */
        .scanline {
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0,0,0,0.03) 2px,
            rgba(0,0,0,0.03) 4px
          );
          pointer-events: none;
          border-radius: 2px;
        }
      `}</style>

      <div className="login-root">
        <div className="grid-bg" />
        <div className="glow-orb glow-orb-1" />
        <div className="glow-orb glow-orb-2" />

        <div className={`card ${mounted ? "visible" : ""}`}>
          <div className="corner-tr" />
          <div className="corner-bl" />
          <div className="scanline" />

          <div className="header">
            <div className="badge">
              <div className="badge-dot" />
              <span className="badge-text">Secure Access</span>
            </div>
            <h1 className="title">Admin<br /><span>Console</span></h1>
            <p className="subtitle">// restricted area — authorised personnel only</p>
          </div>

          <div className="divider" />

          {errorMessage && (
            <div className="error-bar">{errorMessage}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label className="field-label">
                Email
                <span className="field-label-line" />
              </label>
              <div className="input-wrap">
                <span className="input-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                  </svg>
                </span>
                <input
                  className="field-input"
                  type="email"
                  placeholder="admin@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocused("email")}
                  onBlur={() => setFocused(null)}
                  required
                />
              </div>
            </div>

            <div className="field">
              <label className="field-label">
                Password
                <span className="field-label-line" />
              </label>
              <div className="input-wrap">
                <span className="input-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </span>
                <input
                  className="field-input"
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocused("password")}
                  onBlur={() => setFocused(null)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              <span className="btn-inner">
                {loading ? (
                  <>
                    <span className="spinner" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    Authenticate
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </>
                )}
              </span>
            </button>
          </form>

          <p className="footer-note">v2.4.1 · encrypted · all sessions logged</p>
        </div>
      </div>
    </>
  );
}