import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
import GlassCard from "../components/GlassCard";
import Input from "../components/Input";
import Btn from "../components/Btn";
import { COLORS } from "../theme";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();

  const handleReset = () => {
    if (!email) return alert("Please enter your email address!");
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 1500);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", position: "relative", zIndex: 1 }}>
      <div style={{ width: "100%", maxWidth: 440 }}>
        <div style={{ textAlign: "center", marginBottom: 40, animation: "slideUp 0.5s ease forwards" }}>
          <Logo size="lg" />
        </div>

        <GlassCard animate>
          {!sent ? (
            <>
              <div style={{ marginBottom: 28 }}>
                <div style={{ fontSize: 12, color: COLORS.amberLight, letterSpacing: "2px", textTransform: "uppercase", fontWeight: 600, marginBottom: 6 }}>
                  ACCOUNT RECOVERY
                </div>
                <h1 style={{ fontSize: 32, fontWeight: 800, color: "white", margin: 0, fontFamily: "'Georgia', serif" }}>
                  Reset Password
                </h1>
                <p style={{ color: "rgba(255,255,255,0.6)", marginTop: 12, fontSize: 14 }}>
                  Enter your email address and we'll send you a link to reset your password.
                </p>
              </div>

              <Input label="Email Address" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} icon="✉️" />

              <div style={{ marginTop: 24 }}>
                <Btn onClick={handleReset} disabled={loading}>
                  {loading ? "Sending Link..." : "Send Reset Link 📧"}
                </Btn>
              </div>
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ fontSize: 48, marginBottom: 16, animation: "bounceIn 0.5s ease" }}>✨</div>
              <h2 style={{ fontSize: 24, fontWeight: 700, color: "white", marginBottom: 12 }}>Check your email</h2>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 15, marginBottom: 24 }}>
                We've sent a password reset link to <strong>{email}</strong>.
              </p>
              <Btn variant="secondary" onClick={() => navigate("/login")}>
                Return to Login
              </Btn>
            </div>
          )}

          {!sent && (
            <p style={{ textAlign: "center", marginTop: 24, fontSize: 14, color: "rgba(255,255,255,0.5)" }}>
              Remembered your password?{" "}
              <Link to="/login" style={{ color: COLORS.amberLight, fontWeight: 600, textDecoration: "none" }}>
                Back to Login
              </Link>
            </p>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
