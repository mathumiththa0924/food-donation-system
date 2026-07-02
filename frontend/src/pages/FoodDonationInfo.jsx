import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";

export default function FoodDonationInfo({ theme }) {
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
          src="/images/food_donation.png" 
          alt="Food Donation" 
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
          Donate <span style={{ color: isLight ? COLORS.amber : COLORS.amberLight }}>Food</span>
        </h1>
        
        <p style={{
          fontSize: "1.2rem",
          color: isLight ? "rgba(15,23,42,0.7)" : "rgba(255,255,255,0.8)",
          lineHeight: 1.8,
          marginBottom: "2rem"
        }}>
          Every day, countless meals are wasted while millions go hungry. MealBridge connects generous donors—whether individuals, restaurants, or event organizers—with verified NGOs who distribute the food to those who need it most.
        </p>

        <h2 style={{ fontSize: "2rem", color: isLight ? COLORS.charcoal : "#ffffff", marginBottom: "1rem" }}>How it Works</h2>
        <ul style={{
          fontSize: "1.1rem",
          color: isLight ? "rgba(15,23,42,0.7)" : "rgba(255,255,255,0.8)",
          lineHeight: 1.8,
          marginBottom: "3rem",
          paddingLeft: "1.5rem"
        }}>
          <li><strong>List Surplus Food:</strong> Donors post details about the available food (quantity, type, expiry time).</li>
          <li><strong>Instant Notifications:</strong> Nearby registered NGOs receive real-time alerts.</li>
          <li><strong>Claim & Distribute:</strong> NGOs claim the listing and coordinate pickup, ensuring food reaches the hungry immediately.</li>
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
          Become a Donor
        </button>
      </div>
      <div style={{ flexGrow: 1 }} />
      <Footer theme={theme} />
    </div>
  );
}
