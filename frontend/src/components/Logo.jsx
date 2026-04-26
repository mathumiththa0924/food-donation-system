import React from "react";
import { COLORS } from "../theme";

export default function Logo({ size = "md" }) {
  const s = size === "lg" ? 64 : size === "sm" ? 32 : 44;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: size === "lg" ? 14 : 10 }}>
      <div
        style={{
          width: s,
          height: s,
          borderRadius: "50%",
          background: `linear-gradient(135deg, ${COLORS.amber}, ${COLORS.amberLight})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: `0 4px 20px rgba(232,146,58,0.4)`,
          flexShrink: 0,
        }}
      >
        <svg width={s * 0.55} height={s * 0.55} viewBox="0 0 32 32" fill="none">
          <path d="M8 4 C8 4 6 10 6 14 C6 17 8 19 11 19 L11 28 C11 29.1 11.9 30 13 30 L19 30 C20.1 30 21 29.1 21 28 L21 19 C24 19 26 17 26 14 C26 10 24 4 24 4" stroke="white" strokeWidth="2.2" strokeLinecap="round" fill="none" />
          <path d="M16 4 L16 19" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
          <ellipse cx="16" cy="6" rx="3" ry="4" fill="white" opacity="0.25" />
        </svg>
      </div>
      <div>
        <div
          style={{
            fontFamily: "'Georgia', serif",
            fontSize: size === "lg" ? 28 : size === "sm" ? 16 : 22,
            fontWeight: 700,
            color: "white",
            lineHeight: 1.1,
            letterSpacing: "-0.5px",
          }}
        >
          Meal<span style={{ color: COLORS.amberLight }}>Bridge</span>
        </div>
        {size !== "sm" && (
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.55)", letterSpacing: "1.5px", textTransform: "uppercase", marginTop: 1 }}>
            Bridging Hunger · Sharing Meals
          </div>
        )}
      </div>
    </div>
  );
}
