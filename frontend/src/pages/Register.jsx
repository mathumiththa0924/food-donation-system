import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../api/auth";
import FloatingFood from "../components/FloatingFood";

export default function Register({ theme = "dark" }) {
  const isLight = theme === "light";
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  
  // Step 1 fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("donor");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Step 2 fields
  const [phone, setPhone] = useState("");
  const [organization, setOrganization] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");

  const nameError = useMemo(() => {
    if (!name) return "Name is required.";
    return "";
  }, [name]);

  const emailError = useMemo(() => {
    if (!email) return "Email is required.";
    if (email.includes(" ")) return "Email cannot contain spaces.";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Invalid email format.";
    return "";
  }, [email]);

  const passwordError = useMemo(() => {
    if (!password) return "Password is required.";
    if (password.length < 8) return "Must be at least 8 characters.";
    if (!/[A-Z]/.test(password)) return "Must include uppercase letter.";
    if (!/[a-z]/.test(password)) return "Must include lowercase letter.";
    if (!/[0-9]/.test(password)) return "Must include a number.";
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return "Must include a special character.";
    return "";
  }, [password]);

  const confirmPasswordError = useMemo(() => {
    if (!confirmPassword) return "Confirm password is required.";
    if (confirmPassword !== password) return "Passwords do not match.";
    return "";
  }, [confirmPassword, password]);

  const phoneError = useMemo(() => {
    if (step === 2) {
      if (!phone) return "Phone number is required.";
      const digitsOnly = phone.replace(/\D/g, "");
      if (digitsOnly.length !== 10) return "Phone number must be exactly 10 digits.";
    }
    return "";
  }, [phone, step]);

  const isStep1Valid = !nameError && !emailError && !passwordError && !confirmPasswordError;
  const isStep2Valid = !phoneError && termsAccepted;

  const handleNextStep = (e) => {
    e.preventDefault();
    if (isStep1Valid) {
      setStep(2);
    }
  };

  const handlePrevStep = () => {
    setStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setSuccess("");

    if (!isStep1Valid || !isStep2Valid) return;

    try {
      setLoading(true);
      await registerUser({ 
        name: name.trim(), 
        email: email.trim(), 
        password, 
        role,
        phone: phone.trim(),
        organization: organization.trim()
      });
      setSuccess("Registration successful. Redirecting to login...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      console.error("Registration error:", err);
      setFormError(err.response?.data?.message || err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const pageBg = isLight
    ? "radial-gradient(ellipse at 20% 20%, #ffffff 0%, #f8fafc 40%, #e2e8f0 70%, #d6d8de 100%)"
    : "radial-gradient(ellipse at 20% 20%, #2d5a3d 0%, #1a3a2a 40%, #0f2219 70%, #08150e 100%)";
  const cardBg = isLight ? "rgba(255,255,255,0.95)" : "rgba(35, 53, 41, 0.4)";
  const cardBorder = isLight ? "1px solid rgba(15,23,42,0.12)" : "1px solid rgba(255,255,255,0.05)";
  const formText = isLight ? "#0f172a" : "white";
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
      color: formText,
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
        maxWidth: "500px",
        boxShadow: "0 24px 48px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
        boxSizing: "border-box",
        position: "relative",
        zIndex: 1
      }}>
        <form onSubmit={step === 1 ? handleNextStep : handleSubmit}>
          <div style={{ marginBottom: "28px" }}>
            <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
              <div style={{ flex: 1, height: "4px", borderRadius: "2px", background: "#e8923a", transition: "background 0.3s" }} />
              <div style={{ flex: 1, height: "4px", borderRadius: "2px", background: step === 2 ? "#e8923a" : "rgba(255,255,255,0.15)", transition: "background 0.3s" }} />
            </div>
            <p style={{ color: "#d68840", fontSize: "12px", fontWeight: "700", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "8px" }}>
              JOIN THE COMMUNITY · STEP {step} OF 2
            </p>
            <h2 style={{ color: "white", fontSize: "32px", fontWeight: "700", margin: 0 }}>
              {step === 1 ? "Create your account" : "Tell us more"}
            </h2>
          </div>

          {formError && <p style={{ color: "#ffb3b3", fontSize: "14px", marginBottom: "20px", background: "rgba(255,0,0,0.1)", padding: "10px", borderRadius: "8px", border: "1px solid rgba(255,0,0,0.2)" }}>{formError}</p>}
          {success && <p style={{ color: "#b8f2b8", fontSize: "14px", marginBottom: "20px", background: "rgba(0,255,0,0.1)", padding: "10px", borderRadius: "8px", border: "1px solid rgba(0,255,0,0.2)" }}>{success}</p>}

          {step === 1 && (
            <div style={{ animation: "slideUp 0.3s ease" }}>
              <div style={{ marginBottom: "24px" }}>
                <label style={labelStyle}>I WANT TO JOIN AS</label>
                <div style={{ display: "flex", gap: "10px" }}>
                  {[{id: "donor", label: "🤝 Donor"}, {id: "ngo", label: "🏢 NGO"}].map(r => (
                    <div key={r.id} onClick={() => setRole(r.id)} style={{
                      flex: 1, padding: "12px 8px", textAlign: "center", borderRadius: "12px", cursor: "pointer",
                      border: role === r.id ? "1px solid #e8923a" : "1px solid rgba(255,255,255,0.1)",
                      background: role === r.id ? "rgba(232,146,58,0.15)" : "rgba(255,255,255,0.03)",
                      color: role === r.id ? "#f4b96e" : "white",
                      fontSize: "14px",
                      fontWeight: role === r.id ? "600" : "400",
                      transition: "all 0.2s"
                    }}>
                      {r.label}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={labelStyle}>FULL NAME</label>
                <div style={{ position: "relative" }}>
                  <svg style={iconStyle} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                  <input 
                    type="text" 
                    placeholder="Your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{ ...inputStyle, border: name && nameError ? "1px solid #ff4d4f" : inputStyle.border }}
                    onFocus={(e) => { e.target.style.border = "1px solid #d68840"; e.target.style.background = "rgba(255, 255, 255, 0.06)"; }}
                    onBlur={(e) => { e.target.style.border = name && nameError ? "1px solid #ff4d4f" : "1px solid rgba(255, 255, 255, 0.1)"; e.target.style.background = "rgba(255, 255, 255, 0.03)"; }}
                  />
                  {name && nameError && <span style={{ color: "#ff4d4f", fontSize: "12px", position: "absolute", bottom: "-18px", left: "4px" }}>{nameError}</span>}
                </div>
              </div>

              <div style={{ marginBottom: "20px", marginTop: name && nameError ? "12px" : "0" }}>
                <label style={labelStyle}>EMAIL</label>
                <div style={{ position: "relative" }}>
                  <svg style={iconStyle} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                  <input 
                    type="email" 
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value.trim())}
                    style={{ ...inputStyle, border: email && emailError ? "1px solid #ff4d4f" : inputStyle.border }}
                    onFocus={(e) => { e.target.style.border = "1px solid #d68840"; e.target.style.background = "rgba(255, 255, 255, 0.06)"; }}
                    onBlur={(e) => { e.target.style.border = email && emailError ? "1px solid #ff4d4f" : "1px solid rgba(255, 255, 255, 0.1)"; e.target.style.background = "rgba(255, 255, 255, 0.03)"; }}
                  />
                  {email && emailError && <span style={{ color: "#ff4d4f", fontSize: "12px", position: "absolute", bottom: "-18px", left: "4px" }}>{emailError}</span>}
                </div>
              </div>

              <div style={{ marginBottom: "20px", marginTop: email && emailError ? "12px" : "0" }}>
                <label style={labelStyle}>PASSWORD</label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", fontSize: "14px", filter: "opacity(0.8)" }}>🔒</span>
                  <input 
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ ...inputStyle, border: password && passwordError ? "1px solid #ff4d4f" : inputStyle.border }}
                    onFocus={(e) => { e.target.style.border = "1px solid #d68840"; e.target.style.background = "rgba(255, 255, 255, 0.06)"; }}
                    onBlur={(e) => { e.target.style.border = password && passwordError ? "1px solid #ff4d4f" : "1px solid rgba(255, 255, 255, 0.1)"; e.target.style.background = "rgba(255, 255, 255, 0.03)"; }}
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
                  {password && passwordError && <span style={{ color: "#ff4d4f", fontSize: "12px", position: "absolute", bottom: "-18px", left: "4px" }}>{passwordError}</span>}
                </div>
              </div>

              <div style={{ marginBottom: "32px", marginTop: password && passwordError ? "12px" : "0" }}>
                <label style={labelStyle}>CONFIRM PASSWORD</label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", fontSize: "14px", filter: "opacity(0.8)" }}>🔒</span>
                  <input 
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
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

              <button 
                type="submit" 
                disabled={loading || !isStep1Valid}
                style={{
                  width: "100%",
                  padding: "16px",
                  background: "linear-gradient(90deg, #ed9647 0%, #d87e32 100%)",
                  opacity: isStep1Valid ? 1 : 0.6,
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  fontSize: "16px",
                  fontWeight: "700",
                  cursor: isStep1Valid ? "pointer" : "not-allowed",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "8px",
                  boxShadow: isStep1Valid ? "0 8px 20px rgba(237, 150, 71, 0.25)" : "none",
                  transition: "transform 0.1s, boxShadow 0.1s, background 0.3s, opacity 0.3s"
                }}
                onMouseDown={(e) => isStep1Valid && !loading && (e.currentTarget.style.transform = "scale(0.98)")}
                onMouseUp={(e) => isStep1Valid && !loading && (e.currentTarget.style.transform = "scale(1)")}
                onMouseLeave={(e) => isStep1Valid && !loading && (e.currentTarget.style.transform = "scale(1)")}
              >
                Continue →
              </button>
            </div>
          )}

          {step === 2 && (
            <div style={{ animation: "slideUp 0.3s ease" }}>
              <div style={{ marginBottom: "20px" }}>
                <label style={labelStyle}>PHONE NUMBER</label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", fontSize: "14px", filter: "opacity(0.8)" }}>📱</span>
                  <input 
                    type="tel" 
                    placeholder="e.g. 0771234567"
                    maxLength="10"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    style={{ ...inputStyle, border: phone && phoneError ? "1px solid #ff4d4f" : inputStyle.border }}
                    onFocus={(e) => { e.target.style.border = "1px solid #d68840"; e.target.style.background = "rgba(255, 255, 255, 0.06)"; }}
                    onBlur={(e) => { e.target.style.border = phone && phoneError ? "1px solid #ff4d4f" : "1px solid rgba(255, 255, 255, 0.1)"; e.target.style.background = "rgba(255, 255, 255, 0.03)"; }}
                  />
                  {phone && phoneError && <span style={{ color: "#ff4d4f", fontSize: "12px", position: "absolute", bottom: "-18px", left: "4px" }}>{phoneError}</span>}
                </div>
              </div>

              <div style={{ marginBottom: "24px", marginTop: phone && phoneError ? "12px" : "0" }}>
                <label style={labelStyle}>ORGANIZATION / RESTAURANT NAME</label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", fontSize: "14px", filter: "opacity(0.8)" }}>🏢</span>
                  <input 
                    type="text" 
                    placeholder="e.g. Green Leaf Restaurant"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    style={inputStyle}
                    onFocus={(e) => { e.target.style.border = "1px solid #d68840"; e.target.style.background = "rgba(255, 255, 255, 0.06)"; }}
                    onBlur={(e) => { e.target.style.border = "1px solid rgba(255, 255, 255, 0.1)"; e.target.style.background = "rgba(255, 255, 255, 0.03)"; }}
                  />
                </div>
              </div>

              <div style={{ 
                marginBottom: "32px", 
                padding: "16px", 
                background: "rgba(255,255,255,0.02)", 
                border: "1px solid rgba(232,146,58,0.3)", 
                borderRadius: "12px",
                display: "flex",
                gap: "12px",
                alignItems: "flex-start"
              }}>
                <div 
                  onClick={() => setTermsAccepted(!termsAccepted)}
                  style={{
                    width: "20px", height: "20px", borderRadius: "4px", flexShrink: 0,
                    background: termsAccepted ? "#4a8c6a" : "rgba(255,255,255,0.1)",
                    border: termsAccepted ? "none" : "1px solid rgba(255,255,255,0.2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", transition: "all 0.2s", marginTop: "2px"
                  }}
                >
                  {termsAccepted && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                </div>
                <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "13px", lineHeight: "1.5", margin: 0, cursor: "pointer", userSelect: "none" }} onClick={() => setTermsAccepted(!termsAccepted)}>
                  By registering, you agree to our Terms of Service and Community Guidelines. All donations are subject to food safety verification.
                </p>
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <button 
                  type="button" 
                  onClick={handlePrevStep}
                  disabled={loading}
                  style={{
                    flex: "0 0 auto",
                    padding: "16px 24px",
                    background: "rgba(255,255,255,0.05)",
                    color: "white",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    fontSize: "16px",
                    fontWeight: "600",
                    cursor: loading ? "not-allowed" : "pointer",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    transition: "all 0.2s"
                  }}
                  onMouseOver={(e) => !loading && (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
                  onMouseOut={(e) => !loading && (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
                >
                  ← Back
                </button>
                <button 
                  type="submit" 
                  disabled={loading || !isStep2Valid}
                  style={{
                    flex: 1,
                    padding: "16px",
                    background: "linear-gradient(90deg, #ed9647 0%, #d87e32 100%)",
                    opacity: isStep2Valid && !loading ? 1 : 0.6,
                    color: "white",
                    border: "none",
                    borderRadius: "12px",
                    fontSize: "16px",
                    fontWeight: "700",
                    cursor: isStep2Valid && !loading ? "pointer" : "not-allowed",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "8px",
                    boxShadow: isStep2Valid ? "0 8px 20px rgba(237, 150, 71, 0.25)" : "none",
                    transition: "transform 0.1s, boxShadow 0.1s, background 0.3s, opacity 0.3s"
                  }}
                  onMouseDown={(e) => isStep2Valid && !loading && (e.currentTarget.style.transform = "scale(0.98)")}
                  onMouseUp={(e) => isStep2Valid && !loading && (e.currentTarget.style.transform = "scale(1)")}
                  onMouseLeave={(e) => isStep2Valid && !loading && (e.currentTarget.style.transform = "scale(1)")}
                >
                  {loading ? "Creating..." : "Create Account 🎉"}
                </button>
              </div>
            </div>
          )}

          <p style={{ textAlign: "center", marginTop: "32px", fontSize: "14px", color: "#8b9c91" }}>
            Already have an account? <Link to="/login" style={{ color: "#d68840", textDecoration: "none", fontWeight: "600", position: "relative", zIndex: 10 }}>Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
