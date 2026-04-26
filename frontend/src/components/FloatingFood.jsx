import React, { useRef } from "react";

const foodItems = ["🍱", "🥘", "🍲", "🥗", "🍞", "🥦", "🍅", "🥕", "🍎", "🥚", "🧆", "🫕"];

export default function FloatingFood({ count = 12 }) {
  const items = useRef(
    Array.from({ length: count }, (_, i) => ({
      emoji: foodItems[i % foodItems.length],
      x: Math.random() * 90 + 5,
      y: Math.random() * 90 + 5,
      size: Math.random() * 18 + 14,
      dur: Math.random() * 8 + 10,
      delay: Math.random() * 6,
    }))
  ).current;

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
    </div>
  );
}
