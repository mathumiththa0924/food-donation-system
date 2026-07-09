export default function Logo({ size = "default" }) {
  const isSmall = size === "sm";
  const circleSize = isSmall ? "32px" : "38px";
  const mSize = isSmall ? "16px" : "20px";
  const textSize = isSmall ? "18px" : "24px";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <div style={{
        width: circleSize, height: circleSize,
        borderRadius: "50%",
        background: "linear-gradient(135deg, #C8922A, #8B6010)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontWeight: "bold", fontSize: mSize,
        color: "#fff",
      }}>M</div>
      <span style={{  fontSize: textSize, fontWeight: "bold" }}>
        <span style={{ color: "#FFFFFF" }}>Meal</span>
        <span style={{ color: "#D4A843" }}>Bridge</span>
      </span>
    </div>
  );
}
