import { COLORS } from "../theme";

export default function Select({ label, options, value, onChange }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label
        style={{
          display: "block",
          fontSize: 11,
          fontWeight: 600,
          color: "rgba(255,255,255,0.55)",
          letterSpacing: "1.2px",
          textTransform: "uppercase",
          marginBottom: 8,
        }}
      >
        {label}
      </label>
      <select
        value={value}
        onChange={onChange}
        style={{
          width: "100%",
          padding: "14px 16px",
          background: "rgba(255,255,255,0.07)",
          border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: 12,
          color: value ? "white" : "rgba(255,255,255,0.45)",
          fontSize: 15,
          outline: "none",
          cursor: "pointer",
          appearance: "none",
          WebkitAppearance: "none",
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='rgba(255,255,255,0.5)' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 16px center",
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} style={{ background: COLORS.forest, color: "white" }}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
