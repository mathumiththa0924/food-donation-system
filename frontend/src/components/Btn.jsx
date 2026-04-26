import React, { useState } from "react";
import { COLORS } from "../theme";

export default function Btn({ children, onClick, variant = "primary", disabled = false, style = {}, type = "button" }) {
  const [hov, setHov] = useState(false);

  const base = {
    width: "100%",
    padding: "15px",
    borderRadius: 14,
    fontSize: 16,
    fontWeight: 700,
    cursor: disabled ? "not-allowed" : "pointer",
    border: "none",
    transition: "all 0.25s",
    fontFamily: "inherit",
    letterSpacing: "0.3px",
    opacity: disabled ? 0.5 : 1,
  };

  const variants = {
    primary: {
      background: hov ? "#f0a050" : COLORS.amber,
      color: "white",
      boxShadow: hov ? "0 8px 30px rgba(232,146,58,0.5)" : "0 4px 16px rgba(232,146,58,0.3)",
      transform: hov && !disabled ? "translateY(-1px)" : "none",
    },
    secondary: {
      background: hov ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.07)",
      color: "white",
      border: "1px solid rgba(255,255,255,0.2)",
    },
    danger: {
      background: hov ? "#c0392b" : "#e74c3c",
      color: "white",
      boxShadow: hov ? "0 4px 20px rgba(231,76,60,0.4)" : "none",
    },
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ ...base, ...variants[variant], ...style }}
    >
      {children}
    </button>
  );
}
