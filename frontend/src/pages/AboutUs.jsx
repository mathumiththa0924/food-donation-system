import { useEffect } from "react";
import Footer from "../components/Footer";

export default function AboutUs({ theme }) {
  const isLight = theme === "light";
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const COLORS = {
    forest: "#1a3a2a",
    amber: "#e8923a",
    charcoal: "#1c2b22",
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      paddingTop: "6rem",
      position: "relative",
      zIndex: 10,
    }}>
      <div style={{
        maxWidth: "800px",
        margin: "2rem auto",
        padding: "3rem",
        animation: "slideUp 0.8s ease-out forwards",
        background: isLight ? "rgba(255, 255, 255, 0.6)" : "rgba(30, 41, 59, 0.6)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderRadius: "24px",
        border: isLight ? "1px solid rgba(255, 255, 255, 0.6)" : "1px solid rgba(255, 255, 255, 0.1)",
        boxShadow: isLight ? "0 10px 40px rgba(15, 23, 42, 0.08)" : "0 10px 40px rgba(0, 0, 0, 0.3)",
      }}>
        <h1 style={{
          fontSize: "2.5rem",
          fontWeight: 800,
          color: isLight ? COLORS.charcoal : "#ffffff",
          marginBottom: "1rem"
        }}>
          About <span style={{ color: COLORS.amber }}>Us</span>
        </h1>
        <p style={{
          fontSize: "1.1rem",
          color: isLight ? "rgba(15,23,42,0.7)" : "rgba(255,255,255,0.8)",
          lineHeight: 1.8,
          marginBottom: "1rem"
        }}>
          MealBridge is a revolutionary platform aimed at bridging the gap between excess food and empty plates.
        </p>
        <p style={{
          fontSize: "1.1rem",
          color: isLight ? "rgba(15,23,42,0.7)" : "rgba(255,255,255,0.8)",
          lineHeight: 1.8,
          marginBottom: "1rem"
        }}>
          We empower individuals, restaurants, and NGOs to connect seamlessly, ensuring that no good food goes to waste and communities receive the support they need through direct fundraising.
        </p>
      </div>
      <div style={{ flexGrow: 1 }} />
      <Footer theme={theme} />
    </div>
  );
}
