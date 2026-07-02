import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";

export default function ImpactInfo({ theme }) {
  const navigate = useNavigate();
  const isLight = theme === "light";

  const COLORS = {
    forest: "#1a3a2a",
    amber: "#e8923a",
    amberLight: "#f4b96e",
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
        maxWidth: "900px",
        margin: "0 auto",
        padding: "2rem",
        animation: "slideUp 0.8s ease-out forwards",
      }}>
        <img 
          src="/images/track_impact.png" 
          alt="Track Impact" 
          style={{
            width: "100%",
            height: "400px",
            objectFit: "cover",
            borderRadius: "24px",
            marginBottom: "3rem",
            boxShadow: isLight ? "0 10px 30px rgba(15,23,42,0.1)" : "0 10px 30px rgba(0,0,0,0.3)",
          }}
        />

        <h1 style={{
          fontSize: "3rem",
          fontWeight: 800,
          color: isLight ? COLORS.charcoal : "#ffffff",
          marginBottom: "1rem"
        }}>
          Track <span style={{ color: isLight ? COLORS.amber : COLORS.amberLight }}>Impact</span>
        </h1>
        
        <p style={{
          fontSize: "1.2rem",
          color: isLight ? "rgba(15,23,42,0.7)" : "rgba(255,255,255,0.8)",
          lineHeight: 1.8,
          marginBottom: "2rem"
        }}>
          Transparency is at the core of MealBridge. We ensure that every meal donated and every dollar contributed is tracked meticulously, allowing you to see the real-world difference you are making.
        </p>

        <h2 style={{ fontSize: "2rem", color: isLight ? COLORS.charcoal : "#ffffff", marginBottom: "1rem" }}>How it Works</h2>
        <ul style={{
          fontSize: "1.1rem",
          color: isLight ? "rgba(15,23,42,0.7)" : "rgba(255,255,255,0.8)",
          lineHeight: 1.8,
          marginBottom: "3rem",
          paddingLeft: "1.5rem"
        }}>
          <li><strong>Donor Profiles:</strong> Your dashboard aggregates all your food and money donations in one place.</li>
          <li><strong>Leaderboards:</strong> Compete in a friendly community leaderboard to inspire others and maximize platform engagement.</li>
          <li><strong>Impact Analytics:</strong> Visualize the number of meals served, families fed, and campaigns successfully funded through intuitive charts.</li>
        </ul>

        <button 
          onClick={() => navigate('/register')}
          style={{
            padding: "1rem 2.5rem",
            fontSize: "1.1rem",
            fontWeight: 600,
            borderRadius: "50px",
            background: COLORS.amber,
            color: "#fff",
            border: "none",
            cursor: "pointer",
            boxShadow: "0 4px 15px rgba(232, 146, 58, 0.3)",
            transition: "transform 0.2s, box-shadow 0.2s",
          }}
        >
          View Your Impact
        </button>
      </div>
      <div style={{ flexGrow: 1 }} />
      <Footer theme={theme} />
    </div>
  );
}
