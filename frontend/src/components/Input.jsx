import { useState } from "react";

export default function Input({ label, type = "text", value, onChange, placeholder, error }) {
  const [focused, setFocused] = useState(false);

  return (
    <div style={{ marginBottom: error ? 24 : 14, position: "relative" }}>
      {label ? <label style={{ display: "block", color: "white", marginBottom: 6 }}>{label}</label> : null}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: "100%",
          padding: "10px 12px",
          borderRadius: 8,
          border: error ? "1px solid #ff4d4f" : focused ? "1px solid #e8923a" : "1px solid #ffffff33",
          background: "#ffffff10",
          color: "white",
          outline: "none",
          boxSizing: "border-box"
        }}
      />
      {error && (
        <span style={{ color: "#ff4d4f", fontSize: "12px", position: "absolute", bottom: "-20px", left: "0" }}>
          {error}
        </span>
      )}
    </div>
  );
}
