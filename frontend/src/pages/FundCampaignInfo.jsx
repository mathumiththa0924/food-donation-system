import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";

export default function FundCampaignInfo({ theme }) {
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
          src="/images/fund_campaigns.png" 
          alt="Fund Campaigns" 
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
          Fund <span style={{ color: isLight ? COLORS.amber : COLORS.amberLight }}>Campaigns</span>
        </h1>
        
        <p style={{
          fontSize: "1.2rem",
          color: isLight ? "rgba(15,23,42,0.7)" : "rgba(255,255,255,0.8)",
          lineHeight: 1.8,
          marginBottom: "2rem"
        }}>
          Sometimes, logistical support, groceries in bulk, or cooking facilities require financial backing. Our Fund Campaigns feature empowers NGOs to raise necessary funds directly from generous donors.
        </p>

        <h2 style={{ fontSize: "2rem", color: isLight ? COLORS.charcoal : "#ffffff", marginBottom: "1rem" }}>How it Works</h2>
        <ul style={{
          fontSize: "1.1rem",
          color: isLight ? "rgba(15,23,42,0.7)" : "rgba(255,255,255,0.8)",
          lineHeight: 1.8,
          marginBottom: "3rem",
          paddingLeft: "1.5rem"
        }}>
          <li><strong>NGOs Post Requests:</strong> Verified NGOs submit monetary requests detailing their goals and requirements.</li>
          <li><strong>Secure Donations:</strong> Users browse active fundraisers and securely donate funds directly to the cause.</li>
          <li><strong>Achieve Goals:</strong> Progress bars update in real-time. Once the goal is met, NGOs utilize the funds to maximize their impact.</li>
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
          Donate Funds
        </button>
      </div>
      <div style={{ flexGrow: 1 }} />
      <Footer theme={theme} />
    </div>
  );
}
