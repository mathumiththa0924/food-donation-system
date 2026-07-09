import { useMemo } from "react";

const foodItems = ["🍱","🥘","🍲","🥗","🍞","🥦","🍅","🥕","🍎","🥚","🧆","🫕","🍱","🥘","🍲","🥗","🍞","🥦","🍅","🥕","🍎","🥚","🧆","🫕"];

const makeNoise = (index, salt) => {
  const value = Math.sin((index + 1) * 12.9898 + salt * 78.233) * 43758.5453;
  return value - Math.floor(value);
};

export default function FloatingFood({ count = 12 }) {
  const items = useMemo(() => 
    Array.from({ length: count }, (_, i) => ({
      emoji: foodItems[i % foodItems.length],
      x: makeNoise(i, 1) * 90 + 5,
      y: makeNoise(i, 2) * 90 + 5,
      size: makeNoise(i, 3) * 18 + 14,
      dur: makeNoise(i, 4) * 8 + 10,
      delay: makeNoise(i, 5) * 6,
    })),
    [count]
  );

  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
      {items.map((item, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${item.x}%`,
            top: `${item.y}%`,
            fontSize: item.size,
            opacity: 0.12,
            animation: `floatFood${i % 3} ${item.dur}s ${item.delay}s infinite ease-in-out`,
            filter: "saturate(0.4)",
          }}
        >
          {item.emoji}
        </div>
      ))}
      <style>{`
        @keyframes floatFood0 { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-20px) rotate(8deg)} }
        @keyframes floatFood1 { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-28px) rotate(-6deg)} }
        @keyframes floatFood2 { 0%,100%{transform:translateY(0) rotate(0deg)} 33%{transform:translateY(-15px) rotate(10deg)} 66%{transform:translateY(-25px) rotate(-4deg)} }
      `}</style>
    </div>
  );
}
