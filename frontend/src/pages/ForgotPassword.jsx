import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { requestPasswordReset, resetPassword } from "../api/auth";
import FloatingFood from "../components/FloatingFood";

export default function ForgotPassword({ theme = "dark" }) {
  const isLight = theme === "light";
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState("request");
  const [sent, setSent] = useState(false);
  const [infoMessage, setInfoMessage] = useState("");
  const [formError, setFormError] = useState("");

  const emailError = useMemo(() => {
    if (!email) return "Email is required.";
    if (email.includes(" ")) return "Email cannot contain spaces.";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Invalid email format.";
    return "";
  }, [email]);

  const resetCodeError = useMemo(() => {
    if (!resetCode) return "Reset code is required.";
    return "";
  }, [resetCode]);

  const passwordError = useMemo(() => {
    if (!newPassword) return "Password is required.";
    if (newPassword.length < 8) return "Must be at least 8 characters.";
    if (!/[A-Z]/.test(newPassword)) return "Must include uppercase letter.";
    if (!/[a-z]/.test(newPassword)) return "Must include lowercase letter.";
    if (!/[0-9]/.test(newPassword)) return "Must include a number.";
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) return "Must include a special character.";
    return "";
  }, [newPassword]);

  const confirmPasswordError = useMemo(() => {
    if (!confirmPassword) return "Confirm password is required.";
    if (confirmPassword !== newPassword) return "Passwords do not match.";
    return "";
  }, [confirmPassword, newPassword]);

  const isRequestValid = !emailError;
  const isResetValid = !emailError && !resetCodeError && !passwordError && !confirmPasswordError;

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setFormError("");
    setInfoMessage("");

    const codeEntered = !!resetCode.trim();

    try {
      setLoading(true);

      if (!codeEntered) {
        if (!isRequestValid) return;

        await requestPasswordReset({ email: email.trim() });
        setStage("verify");
        setInfoMessage("If that email exists, a reset code has been sent. Check your inbox.");
        return;
      }

      if (stage !== "verify") {
        setStage("verify");
      }

      if (!isResetValid) return;

      await resetPassword({
        email: email.trim(),
        resetCode: resetCode.trim(),
        newPassword,
        confirmPassword,
      });
      setSent(true);
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to reset password.");
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

  const labelStyle = { color: "#95a89b", fontSize: "11px", fontWeight: "600", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "8px", display: "block" };
  const iconStyle = { position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "#7a8c80" };

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
        {!sent ? (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "32px" }}>
              <p style={{ color: "#d68840", fontSize: "12px", fontWeight: "700", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "8px" }}>
                ACCOUNT RECOVERY
              </p>
              <h2 style={{ color: "white", fontSize: "32px", fontWeight: "700", margin: 0 }}>
                Reset Password
              </h2>
            </div>

            {infoMessage && <p style={{ color: "#b8f3b8", fontSize: "14px", marginBottom: "20px", background: "rgba(40, 90, 40, 0.16)", padding: "10px", borderRadius: "8px", border: "1px solid rgba(76, 175, 80, 0.2)" }}>{infoMessage}</p>}
            {formError && <p style={{ color: "#ffb3b3", fontSize: "14px", marginBottom: "20px", background: "rgba(255,0,0,0.1)", padding: "10px", borderRadius: "8px", border: "1px solid rgba(255,0,0,0.2)" }}>{formError}</p>}

            <div style={{ marginBottom: "20px" }}>
              <label style={labelStyle}>EMAIL ADDRESS</label>
              <div style={{ position: "relative" }}>
                <svg style={iconStyle} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                <input 
                  type="email" 
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value.trim())}
                  disabled={stage === "verify"}
                  style={{ ...inputStyle, border: email && emailError ? "1px solid #ff4d4f" : inputStyle.border, opacity: stage === "verify" ? 0.6 : 1 }}
                  onFocus={(e) => { if(stage !== "verify") { e.target.style.border = "1px solid #d68840"; e.target.style.background = "rgba(255, 255, 255, 0.06)"; } }}
                  onBlur={(e) => { if(stage !== "verify") { e.target.style.border = email && emailError ? "1px solid #ff4d4f" : "1px solid rgba(255, 255, 255, 0.1)"; e.target.style.background = "rgba(255, 255, 255, 0.03)"; } }}
                />
                {email && emailError && <span style={{ color: "#ff4d4f", fontSize: "12px", position: "absolute", bottom: "-18px", left: "4px" }}>{emailError}</span>}
              </div>
            </div>

            {stage === "verify" && (
              <div style={{ animation: "slideUp 0.3s ease" }}>
                <div style={{ marginBottom: "20px", marginTop: email && emailError ? "12px" : "0" }}>
                  <label style={labelStyle}>RESET CODE</label>
                  <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", fontSize: "14px", filter: "opacity(0.8)" }}>🔑</span>
                    <input
                      type="text"
                      placeholder="Enter 6-digit code from email"
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value.trim())}
                      style={{ ...inputStyle, border: resetCode && resetCodeError ? "1px solid #ff4d4f" : inputStyle.border, paddingLeft: "48px" }}
                      onFocus={(e) => { e.target.style.border = "1px solid #d68840"; e.target.style.background = "rgba(255, 255, 255, 0.06)"; }}
                      onBlur={(e) => { e.target.style.border = resetCode && resetCodeError ? "1px solid #ff4d4f" : "1px solid rgba(255, 255, 255, 0.1)"; e.target.style.background = "rgba(255, 255, 255, 0.03)"; }}
                    />
                    {resetCode && resetCodeError && <span style={{ color: "#ff4d4f", fontSize: "12px", position: "absolute", bottom: "-18px", left: "4px" }}>{resetCodeError}</span>}
                  </div>
                </div>

                <div style={{ marginBottom: "20px", marginTop: resetCode && resetCodeError ? "12px" : "0" }}>
                  <label style={labelStyle}>NEW PASSWORD</label>
                  <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", fontSize: "14px", filter: "opacity(0.8)" }}>🔒</span>
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      style={{ ...inputStyle, border: newPassword && passwordError ? "1px solid #ff4d4f" : inputStyle.border }}
                      onFocus={(e) => { e.target.style.border = "1px solid #d68840"; e.target.style.background = "rgba(255, 255, 255, 0.06)"; }}
                      onBlur={(e) => { e.target.style.border = newPassword && passwordError ? "1px solid #ff4d4f" : "1px solid rgba(255, 255, 255, 0.1)"; e.target.style.background = "rgba(255, 255, 255, 0.03)"; }}
                    />
                    <div
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)", cursor: "pointer", display: "flex", alignItems: "center" }}
                    >
                      {showPassword ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7a8c80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7a8c80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                      )}
                    </div>
                    {newPassword && passwordError && <span style={{ color: "#ff4d4f", fontSize: "12px", position: "absolute", bottom: "-18px", left: "4px" }}>{passwordError}</span>}
                  </div>
                </div>

                <div style={{ marginBottom: "32px", marginTop: newPassword && passwordError ? "12px" : "0" }}>
                  <label style={labelStyle}>CONFIRM PASSWORD</label>
                  <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", fontSize: "14px", filter: "opacity(0.8)" }}>🔒</span>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      style={{ ...inputStyle, border: confirmPassword && confirmPasswordError ? "1px solid #ff4d4f" : inputStyle.border }}
                      onFocus={(e) => { e.target.style.border = "1px solid #d68840"; e.target.style.background = "rgba(255, 255, 255, 0.06)"; }}
                      onBlur={(e) => { e.target.style.border = confirmPassword && confirmPasswordError ? "1px solid #ff4d4f" : "1px solid rgba(255, 255, 255, 0.1)"; e.target.style.background = "rgba(255, 255, 255, 0.03)"; }}
                    />
                    <div
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={{ position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)", cursor: "pointer", display: "flex", alignItems: "center" }}
                    >
                      {showConfirmPassword ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7a8c80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7a8c80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                      )}
                    </div>
                    {confirmPassword && confirmPasswordError && <span style={{ color: "#ff4d4f", fontSize: "12px", position: "absolute", bottom: "-18px", left: "4px" }}>{confirmPasswordError}</span>}
                  </div>
                </div>
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading || (stage === "request" ? !isRequestValid : !isResetValid)}
              style={{
                width: "100%",
                padding: "16px",
                background: "linear-gradient(90deg, #ed9647 0%, #d87e32 100%)",
                opacity: (stage === "request" ? !isRequestValid : !isResetValid) && !loading ? 0.6 : 1,
                color: "white",
                border: "none",
                borderRadius: "12px",
                fontSize: "16px",
                fontWeight: "700",
                cursor: (stage === "request" ? !isRequestValid : !isResetValid) && !loading ? "not-allowed" : "pointer",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "8px",
                boxShadow: (stage === "request" ? !isRequestValid : !isResetValid) ? "none" : "0 8px 20px rgba(237, 150, 71, 0.25)",
                transition: "transform 0.1s, boxShadow 0.1s, background 0.3s, opacity 0.3s"
              }}
              onMouseDown={(e) => (stage === "request" ? isRequestValid : isResetValid) && !loading ? (e.currentTarget.style.transform = "scale(0.98)") : null}
              onMouseUp={(e) => (stage === "request" ? isRequestValid : isResetValid) && !loading ? (e.currentTarget.style.transform = "scale(1)") : null}
              onMouseLeave={(e) => (stage === "request" ? isRequestValid : isResetValid) && !loading ? (e.currentTarget.style.transform = "scale(1)") : null}
            >
              {loading ? "Processing..." : (stage === "request" ? "Send Code" : "Reset Password")}
            </button>

            <p style={{ textAlign: "center", marginTop: "32px", fontSize: "14px", color: "#8b9c91" }}>
              Remembered your password? <Link to="/login" style={{ color: "#d68840", textDecoration: "none", fontWeight: "600", position: "relative", zIndex: 10 }}>Back to Login</Link>
            </p>
          </form>
        ) : (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>✨</div>
            <h2 style={{ fontSize: "24px", fontWeight: "700", color: "white", marginBottom: "12px" }}>Password Reset Successful</h2>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "15px", marginBottom: "32px" }}>
              Your password has been successfully changed. You can now login with your new credentials.
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
                transition: "transform 0.1s"
              }}
              onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.98)")}
              onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              Return to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
