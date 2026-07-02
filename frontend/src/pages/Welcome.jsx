import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";

export default function Welcome({ theme }) {
  const navigate = useNavigate();
  const isLight = theme === "light";

  // Use the brand colors from App.jsx indirectly or inline similar values
  const COLORS = {
    forest: "#1a3a2a",
    forestMid: "#234d38",
    forestLight: "#2d6347",
    sage: "#4a8c6a",
    mint: "#7ec8a0",
    cream: "#fdf6ec",
    warmWhite: "#fffaf4",
    amber: "#e8923a",
    amberLight: "#f4b96e",
    charcoal: "#1c2b22",
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem",
      position: "relative",
      zIndex: 10,
      textAlign: "center"
    }}>
      
      {/* Hero Section */}
      <div style={{
        maxWidth: "800px",
        margin: "0 auto",
        animation: "slideUp 0.8s ease-out forwards",
        position: "relative"
      }}>
        
        {/* Floating Sticker 1 - Food */}
        <img 
          src="/images/sticker_food.png" 
          alt="Food Donation Sticker" 
          style={{
            position: "absolute",
            top: "-40px",
            left: "-220px",
            width: "160px",
            height: "160px",
            borderRadius: "50%",
            objectFit: "cover",
            boxShadow: isLight ? "0 10px 25px rgba(15,23,42,0.15)" : "0 10px 25px rgba(0,0,0,0.4)",
            animation: "floatFood0 6s infinite ease-in-out",
            border: isLight ? "4px solid white" : "4px solid rgba(255,255,255,0.1)",
            zIndex: -1
          }}
        />

        {/* Floating Sticker 2 - Money */}
        <img 
          src="/images/sticker_money.png" 
          alt="Money Donation Sticker" 
          style={{
            position: "absolute",
            bottom: "0px",
            right: "-200px",
            width: "140px",
            height: "140px",
            borderRadius: "50%",
            objectFit: "cover",
            boxShadow: isLight ? "0 10px 25px rgba(15,23,42,0.15)" : "0 10px 25px rgba(0,0,0,0.4)",
            animation: "floatFood1 8s infinite ease-in-out",
            border: isLight ? "4px solid white" : "4px solid rgba(255,255,255,0.1)",
            zIndex: -1
          }}
        />

        {/* Floating Sticker 3 - Delivery */}
        <img 
          src="/images/sticker_delivery.png" 
          alt="Delivery Sticker" 
          style={{
            position: "absolute",
            bottom: "-30px",
            left: "-180px",
            width: "150px",
            height: "150px",
            borderRadius: "50%",
            objectFit: "cover",
            boxShadow: isLight ? "0 10px 25px rgba(15,23,42,0.15)" : "0 10px 25px rgba(0,0,0,0.4)",
            animation: "floatFood2 7s infinite ease-in-out",
            border: isLight ? "4px solid white" : "4px solid rgba(255,255,255,0.1)",
            zIndex: -1
          }}
        />

        {/* Floating Sticker 4 - Love/Heart */}
        <img 
          src="/images/sticker_love.png?v=2" 
          alt="Love Sticker" 
          style={{
            position: "absolute",
            top: "-10px",
            right: "-180px",
            width: "120px",
            height: "120px",
            borderRadius: "50%",
            objectFit: "cover",
            boxShadow: isLight ? "0 10px 25px rgba(15,23,42,0.15)" : "0 10px 25px rgba(0,0,0,0.4)",
            animation: "floatFood0 5s infinite ease-in-out",
            border: isLight ? "4px solid white" : "4px solid rgba(255,255,255,0.1)",
            zIndex: -1,
          }}
        />
        <h1 style={{
          fontSize: "clamp(2.5rem, 5vw, 4.5rem)",
          fontWeight: 800,
          lineHeight: 1.1,
          marginBottom: "1.5rem",
          letterSpacing: "-1px",
          color: isLight ? COLORS.charcoal : "#ffffff",
          textShadow: isLight ? "none" : "0 4px 20px rgba(0,0,0,0.3)"
        }}>
          Share Food, <br />
          <span style={{ color: isLight ? COLORS.amber : COLORS.amberLight }}>Fund Hope.</span>
        </h1>
        
        <p style={{
          fontSize: "clamp(1.1rem, 2vw, 1.3rem)",
          color: isLight ? "rgba(15,23,42,0.7)" : "rgba(255,255,255,0.8)",
          marginBottom: "3rem",
          lineHeight: 1.6,
          maxWidth: "600px",
          margin: "0 auto 3rem auto"
        }}>
          Join MealBridge to bridge the gap between excess resources and empty plates. 
          Whether you want to donate surplus food or contribute funds to support NGO campaigns, 
          every action makes a difference.
        </p>

        <div style={{
          display: "flex",
          gap: "1rem",
          justifyContent: "center",
          flexWrap: "wrap"
        }}>
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
            onMouseEnter={e => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 6px 20px rgba(232, 146, 58, 0.4)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 15px rgba(232, 146, 58, 0.3)";
            }}
          >
            Get Started
          </button>
          
          <button 
            onClick={() => navigate('/login')}
            style={{
              padding: "1rem 2.5rem",
              fontSize: "1.1rem",
              fontWeight: 600,
              borderRadius: "50px",
              background: isLight ? "rgba(15,23,42,0.05)" : "rgba(255,255,255,0.1)",
              color: isLight ? COLORS.charcoal : "#fff",
              border: isLight ? "1px solid rgba(15,23,42,0.1)" : "1px solid rgba(255,255,255,0.2)",
              backdropFilter: "blur(10px)",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = isLight ? "rgba(15,23,42,0.1)" : "rgba(255,255,255,0.15)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = isLight ? "rgba(15,23,42,0.05)" : "rgba(255,255,255,0.1)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            Login
          </button>
        </div>
      </div>

      {/* How it works Section */}
      <div style={{
        marginTop: "6rem",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "2rem",
        width: "100%",
        maxWidth: "1000px",
        animation: "slideUp 1s ease-out forwards",
        animationDelay: "0.2s",
        opacity: 0
      }}>
        {[
          {
            icon: "🍲",
            title: "Donate Food",
            desc: "Have surplus food? List it on MealBridge. Nearby NGOs will be notified instantly and can claim it for distribution.",
            link: "/donate-food"
          },
          {
            icon: "💰",
            title: "Fund Campaigns",
            desc: "Help NGOs achieve their goals. Contribute funds directly to verified money requests and fundraisers securely.",
            link: "/fund-campaigns"
          },
          {
            icon: "🤝",
            title: "Track Impact",
            desc: "See exactly where your donations go. Build your donor profile, track your impact, and make a real difference.",
            link: "/impact"
          }
        ].map((card, idx) => (
          <div key={idx} onClick={() => navigate(card.link)} style={{
            background: isLight ? "rgba(255,255,255,0.7)" : "rgba(253,246,236,0.05)",
            backdropFilter: "blur(12px)",
            border: isLight ? "1px solid rgba(15,23,42,0.05)" : "1px solid rgba(255,255,255,0.1)",
            borderRadius: "24px",
            padding: "2rem",
            textAlign: "center",
            boxShadow: isLight ? "0 10px 30px rgba(15,23,42,0.05)" : "0 10px 30px rgba(0,0,0,0.2)",
            transition: "transform 0.3s ease",
            cursor: "pointer"
          }}
          onMouseEnter={e => e.currentTarget.style.transform = "translateY(-5px)"}
          onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
          >
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>{card.icon}</div>
            <h3 style={{ 
              fontSize: "1.3rem", 
              marginBottom: "1rem",
              color: isLight ? COLORS.charcoal : "#ffffff",
              fontWeight: 700 
            }}>{card.title}</h3>
            <p style={{ 
              color: isLight ? "rgba(15,23,42,0.6)" : "rgba(255,255,255,0.6)",
              lineHeight: 1.5,
              fontSize: "0.95rem"
            }}>{card.desc}</p>
          </div>
        ))}
      </div>
      
      {/* Footer using the new Component */}
      <Footer theme={theme} />
    </div>
  );
}
