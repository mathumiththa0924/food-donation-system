import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import FloatingFood from "../components/FloatingFood";

export default function VerifyEmail({ theme = "dark" }) {
  const isLight = theme === "light";
  const navigate = useNavigate();
  const location = useLocation();
  const emailFromState = location.state?.email || "";

  const [email, setEmail] = useState(emailFromState);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!email || !code) {
      setError("Please provide both email and verification code.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`http://${window.location.hostname}:5000/api/auth/verify-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: email.trim(), code: code.trim() })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || "Verification failed");
      }
      
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const pageBg = isLight
    ? "radial-gradient(ellipse at 20% 20%, #ffffff 0%, #f8fafc 40%, #e2e8f0 70%, #d6d8de 100%)"
    : "radial-gradient(ellipse at 20% 20%, #2d5a3d 0%, #1a3a2a 40%, #0f2219 70%, #08150e 100%)";
  const cardBg = isLight ? "rgba(255,255,255,0.95)" : "rgba(35, 53, 41, 0.4)";
  const cardBorder = isLight ? "1px solid rgba(15,23,42,0.12)" : "1px solid rgba(255,255,255,0.05)";
  const pageText = isLight ? "#0f172a" : "white";
  const inputBg = isLight ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.03)";
  const inputBorder = isLight ? "1px solid rgba(15,23,42,0.12)" : "1px solid rgba(255,255,255,0.1)";
  const inputColor = isLight ? "#0f172a" : "white";

  const inputStyle = {
    width: "100%",
    padding: "16px 48px",
    background: inputBg,
    border: inputBorder,
    borderRadius: "12px",
    color: inputColor,
    fontSize: "15px",
    outline: "none",
    transition: "border 0.2s, background 0.2s",
    boxSizing: "border-box"
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "grid",
      placeItems: "center",
      padding: "20px",
      background: pageBg,
      color: pageText,
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      position: "relative",
      overflow: "hidden"
    }}>
      <FloatingFood count={16} />

      <div style={{
        background: cardBg,
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: cardBorder,
        borderRadius: "24px",
        padding: "48px 40px",
        width: "100%",
        maxWidth: "460px",
        boxShadow: "0 24px 48px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
        boxSizing: "border-box",
        position: "relative",
        zIndex: 1
      }}>
        {!success ? (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "32px" }}>
              <p style={{ color: "#d68840", fontSize: "12px", fontWeight: "700", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "8px" }}>
                ACCOUNT SECURITY
              </p>
              <h2 style={{ color: "white", fontSize: "32px", fontWeight: "700", margin: 0 }}>
                Verify Email
              </h2>
              <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "14px", marginTop: "12px" }}>
                We've sent a 6-digit verification code to your email.
              </p>
            </div>

            {error && <p style={{ color: "#ffb3b3", fontSize: "14px", marginBottom: "20px", background: "rgba(255,0,0,0.1)", padding: "10px", borderRadius: "8px", border: "1px solid rgba(255,0,0,0.2)" }}>{error}</p>}

            <div style={{ marginBottom: "20px" }}>
              <label style={{ color: "#95a89b", fontSize: "11px", fontWeight: "600", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "8px", display: "block" }}>EMAIL</label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", fontSize: "14px", filter: "opacity(0.8)" }}>📧</span>
                <input 
                  type="email" 
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={inputStyle}
                  readOnly={!!emailFromState}
                />
              </div>
            </div>

            <div style={{ marginBottom: "32px" }}>
              <label style={{ color: "#95a89b", fontSize: "11px", fontWeight: "600", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "8px", display: "block" }}>VERIFICATION CODE</label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", fontSize: "14px", filter: "opacity(0.8)" }}>🔑</span>
                <input 
                  type="text" 
                  placeholder="Enter 6-digit code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  style={inputStyle}
                  maxLength={6}
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading || !email || !code}
              style={{
                width: "100%",
                padding: "16px",
                background: "linear-gradient(90deg, #ed9647 0%, #d87e32 100%)",
                opacity: (!email || !code || loading) ? 0.6 : 1,
                color: "white",
                border: "none",
                borderRadius: "12px",
                fontSize: "16px",
                fontWeight: "700",
                cursor: (!email || !code || loading) ? "not-allowed" : "pointer",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                boxShadow: (!email || !code) ? "none" : "0 8px 20px rgba(237, 150, 71, 0.25)",
                transition: "all 0.2s"
              }}
            >
              {loading ? "Verifying..." : "Verify My Email"}
            </button>
          </form>
        ) : (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>✅</div>
            <h2 style={{ fontSize: "24px", fontWeight: "700", color: "white", marginBottom: "12px" }}>Email Verified!</h2>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "15px", marginBottom: "32px" }}>
              Your email has been successfully verified. You can now log in once an admin approves your account.
            </p>
            <button 
              onClick={() => navigate("/login")}
              style={{
                width: "100%",
                padding: "16px",
                background: "linear-gradient(90deg, #ed9647 0%, #d87e32 100%)",
                color: "white",
                border: "none",
                borderRadius: "12px",
                fontSize: "16px",
                fontWeight: "700",
                cursor: "pointer",
                boxShadow: "0 8px 20px rgba(237, 150, 71, 0.25)",
              }}
            >
              Go to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
