import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import "./index.css";

import { useState, useEffect } from "react";
import { FloatingFood, FixedBrandLogo } from "./App";

import ScrollToTop from "./components/ScrollToTop";

export function AdminApp() {
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");

  useEffect(() => {
    localStorage.setItem("theme", theme);
    document.body.classList.toggle("light-theme", theme === "light");
  }, [theme]);

  const darkBg = {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f2219, #1a3a2a, #2d6347)",
    color: "white",
    width: "100%",
    overflowX: "hidden",
  };

  const lightBg = {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #f8fafc, #e2e8f0, #cbd5e1)",
    backgroundSize: "400% 400%",
    animation: "gradientFlow 10s ease infinite",
    color: "#0f172a",
    width: "100%",
    overflowX: "hidden",
  };

  const isLight = theme === "light";
  const bgStyle = theme === "light" ? lightBg : darkBg;

  return (
    <BrowserRouter>
      <ScrollToTop />
      <div style={bgStyle}>
        <style>{`
          html, body, #root { width: 100%; height: 100%; margin: 0; padding: 0; background: ${theme === "light" ? "#f8fafc" : "#0f2219"}; color: ${theme === "light" ? "#0f172a" : "#ffffff"}; max-width: none; }
          * { box-sizing: border-box; }
          @keyframes gradientFlow { 0% { background-position: 100% 0; } 100% { background-position: -100% 0; } }
          
          /* Add some of the light theme specific overrides needed */
          .light-theme [style*="color: white"],
          .light-theme [style*='color: "white"'],
          .light-theme [style*="color: 'white'"] { color: #0f172a !important; }
          .light-theme [style*="color: rgba(255, 255, 255, 0."],
          .light-theme [style*="color: rgba(255,255,255,0."] { color: rgba(15,23,42,0.65) !important; }
          .light-theme [style*="background: rgba(255, 255, 255, 0."],
          .light-theme [style*="background: rgba(255,255,255,0."] { background: rgba(15,23,42,0.06) !important; }
          .light-theme [style*="border: 1px solid rgba(255, 255, 255, 0."],
          .light-theme [style*="border: 1px solid rgba(255,255,255,0."] { border-color: rgba(15,23,42,0.15) !important; }
        `}</style>

        <button
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          style={{
            position: "fixed",
            top: 24,
            right: 90,
            width: 44,
            height: 44,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
            zIndex: 9999,
            border: isLight ? "1px solid rgba(15,23,42,0.12)" : "1px solid rgba(255,255,255,0.15)",
            borderRadius: "50%",
            background: isLight ? "rgba(15,23,42,0.08)" : "rgba(255,255,255,0.06)",
            color: isLight ? "#0f172a" : "#ffffff",
            cursor: "pointer",
            backdropFilter: "blur(10px)",
            boxShadow: isLight ? "0 4px 12px rgba(15,23,42,0.06)" : "0 4px 12px rgba(0,0,0,0.2)",
            transition: "all 0.2s"
          }}
          onMouseEnter={e => e.currentTarget.style.background = isLight ? "rgba(15,23,42,0.12)" : "rgba(255,255,255,0.1)"}
          onMouseLeave={e => e.currentTarget.style.background = isLight ? "rgba(15,23,42,0.08)" : "rgba(255,255,255,0.06)"}
          title="Toggle theme"
        >
          {theme === "light" ? "🌙" : "☀️"}
        </button>

        <FloatingFood count={16} />
        <FixedBrandLogo theme={theme} />

        <Routes>
          <Route path="/" element={<Login theme={theme} isAdminPortal={true} />} />
          <Route path="/admin" element={<AdminDashboard theme={theme} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster position="top-right" containerStyle={{ zIndex: 999999 }} />
      </div>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AdminApp />
  </React.StrictMode>
);
