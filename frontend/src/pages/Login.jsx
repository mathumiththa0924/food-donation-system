import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../api/auth";
import FloatingFood from "../components/FloatingFood";

export default function Login({ theme = "dark" }) {
  const isLight = theme === "light";
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const pageBg = isLight
    ? "radial-gradient(ellipse at 20% 20%, #ffffff 0%, #f8fafc 40%, #e2e8f0 70%, #d6d8de 100%)"
    : "radial-gradient(ellipse at 20% 20%, #2d5a3d 0%, #1a3a2a 40%, #0f2219 70%, #08150e 100%)";
  const cardBg = isLight ? "rgba(255,255,255,0.95)" : "rgba(35, 53, 41, 0.4)";
  const textColor = isLight ? "#0f172a" : "white";
  const titleColor = isLight ? "#0f172a" : "white";
  const accentColor = "#d68840";
  const cardBorder = isLight ? "1px solid rgba(15,23,42,0.12)" : "1px solid rgba(255,255,255,0.05)";
  const inputBg = isLight ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.03)";
  const inputBorder = isLight ? "1px solid rgba(15,23,42,0.12)" : "1px solid rgba(255,255,255,0.1)";
  const inputColor = isLight ? "#0f172a" : "white";
  const inputStyle = {
    width: "100%",
    padding: "16px 16px 16px 48px",
    background: inputBg,
    border: inputBorder,
    borderRadius: "12px",
    color: inputColor,
    fontSize: "15px",
    outline: "none",
    transition: "border 0.2s, background 0.2s",
    boxSizing: "border-box"
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || !role) {
      setError("Please fill all fields and select role.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const response = await loginUser({ email, password });
      const token = response.token;
      const user = response?.data?.user;

      if (!token || !user) {
        setError("Invalid login response from server.");
        return;
      }
      if (user.role !== role) {
        setError("Selected role does not match your account role.");
        return;
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      if (user.role === "donor") navigate("/donor");
      else if (user.role === "ngo") navigate("/ngo");
      else navigate("/admin");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "grid",
      placeItems: "center",
      padding: "20px",
      background: pageBg,
      color: textColor,
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
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "32px" }}>
            <p style={{ color: "#d68840", fontSize: "12px", fontWeight: "700", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "8px" }}>
              WELCOME BACK
            </p>
            <h2 style={{ color: titleColor, fontSize: "36px", fontWeight: "700", margin: 0 }}>
              Sign in to continue
            </h2>
          </div>

          {error && <p style={{ color: "#ffb3b3", fontSize: "14px", marginBottom: "20px", background: "rgba(255,0,0,0.1)", padding: "10px", borderRadius: "8px", border: "1px solid rgba(255,0,0,0.2)" }}>{error}</p>}

          <div style={{ marginBottom: "24px" }}>
            <label style={{ color: "#95a89b", fontSize: "11px", fontWeight: "600", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "8px", display: "block" }}>
              I WANT TO JOIN AS
            </label>
            <div style={{ display: "flex", gap: "12px" }}>
              {[{id: "donor", label: "🤝 Donor"}, {id: "ngo", label: "🏢 NGO"}, {id: "admin", label: "⚙️ Admin"}].map(r => (
                <div key={r.id} onClick={() => setRole(r.id)} style={{
                  flex: 1, padding: "12px 8px", textAlign: "center", borderRadius: "12px", cursor: "pointer",
                  border: role === r.id ? `1px solid ${accentColor}` : `1px solid ${isLight ? 'rgba(15,23,42,0.12)' : 'rgba(255,255,255,0.1)'}`,
                  background: role === r.id ? "rgba(232,146,58,0.15)" : isLight ? "rgba(15,23,42,0.04)" : "rgba(255,255,255,0.03)",
                  color: role === r.id ? "#f4b96e" : isLight ? "#0f172a" : "white",
                  fontSize: "14px",
                  fontWeight: role === r.id ? "600" : "400",
                  transition: "all 0.2s"
                }}>
                  {r.label}
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label style={{ color: "#95a89b", fontSize: "11px", fontWeight: "600", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "8px", display: "block" }}>
              EMAIL ADDRESS
            </label>
            <div style={{ position: "relative" }}>
              <svg style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "#7a8c80" }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
              <input 
                type="email" 
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={inputStyle}
                onFocus={(e) => { e.target.style.border = `1px solid ${accentColor}`; e.target.style.background = isLight ? "rgba(15, 23, 42, 0.08)" : "rgba(255, 255, 255, 0.06)"; }}
                onBlur={(e) => { e.target.style.border = `1px solid ${isLight ? 'rgba(15,23,42,0.12)' : 'rgba(255,255,255,0.1)'}`; e.target.style.background = inputBg; }}
              />
            </div>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={{ color: "#95a89b", fontSize: "11px", fontWeight: "600", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "8px", display: "block" }}>
              PASSWORD
            </label>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", fontSize: "14px", filter: "opacity(0.8)" }}>🔒</span>
              <input 
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: "100%",
                  padding: "16px 48px",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "12px",
                  color: "white",
                  fontSize: "15px",
                  outline: "none",
                  transition: "border 0.2s, background 0.2s",
                  boxSizing: "border-box"
                }}
                onFocus={(e) => { e.target.style.border = "1px solid #d68840"; e.target.style.background = "rgba(255, 255, 255, 0.06)"; }}
                onBlur={(e) => { e.target.style.border = "1px solid rgba(255, 255, 255, 0.1)"; e.target.style.background = "rgba(255, 255, 255, 0.03)"; }}
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
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "32px" }}>
            <Link to="/forgot-password" style={{ color: "#d68840", fontSize: "13px", textDecoration: "none", fontWeight: "500", transition: "color 0.2s", position: "relative", zIndex: 10 }} onMouseOver={(e)=>e.target.style.color="#f2b479"} onMouseOut={(e)=>e.target.style.color="#d68840"}>
              Forgot password?
            </Link>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{
              width: "100%",
              padding: "16px",
              background: "linear-gradient(90deg, #ed9647 0%, #d87e32 100%)",
              opacity: loading ? 0.7 : 1,
              color: "white",
              border: "none",
              borderRadius: "12px",
              fontSize: "16px",
              fontWeight: "700",
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "8px",
              boxShadow: "0 8px 20px rgba(237, 150, 71, 0.25)",
              transition: "transform 0.1s, boxShadow 0.1s"
            }}
            onMouseDown={(e) => !loading && (e.currentTarget.style.transform = "scale(0.98)")}
            onMouseUp={(e) => !loading && (e.currentTarget.style.transform = "scale(1)")}
            onMouseLeave={(e) => !loading && (e.currentTarget.style.transform = "scale(1)")}
          >
            {loading ? "Signing in..." : "Login →"}
          </button>

          <p style={{ textAlign: "center", marginTop: "32px", fontSize: "14px", color: "#8b9c91" }}>
            New to Meal Bridge? <Link to="/register" style={{ color: "#d68840", textDecoration: "none", fontWeight: "600", position: "relative", zIndex: 10 }}>Create an account</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
