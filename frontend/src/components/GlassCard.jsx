export default function GlassCard({ children, style = {}, animate = false }) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.06)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.13)",
        borderRadius: 24,
        padding: "36px 40px",
        boxShadow: "0 8px 40px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.1)",
        animation: animate ? "slideUp 0.5s ease forwards" : "none",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
