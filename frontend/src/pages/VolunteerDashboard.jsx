import { useState, useEffect } from "react";
import { getRequests, updateRequest, assignVolunteer } from "../api/request";
import toast from "react-hot-toast";
import useAuthStore from "../store/authStore";
import { useNavigate } from "react-router-dom";
import { COLORS } from "../theme";
import ChatWidget from "../components/ChatWidget";

export default function VolunteerDashboard({ theme }) {
  const [active, setActive] = useState("available");
  const [activeChat, setActiveChat] = useState(null);
  const [requests, setRequests] = useState([]);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const isLight = theme === "light";
  const panelBg = isLight ? "rgba(255,255,255,0.9)" : "rgba(15,34,25,0.85)";
  const panelBorder = isLight ? "1px solid rgba(15,23,42,0.1)" : "1px solid rgba(255,255,255,0.15)";
  const textColor = isLight ? "#0f172a" : "white";

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await getRequests();
      if (res.success) {
        setRequests(res.data);
      }
    } catch (err) {
      toast.error("Failed to load deliveries");
    }
  };

  const handleAssign = async (id) => {
    try {
      const res = await assignVolunteer(id);
      if (res.success) {
        toast.success("Delivery accepted!");
        fetchRequests();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to accept delivery");
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await updateRequest(id, { status });
      if (res.success) {
        toast.success(`Status updated to ${status}`);
        fetchRequests();
      }
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const availableRequests = requests.filter(r => r.status === "accepted" && !r.volunteerId);
  const myDeliveries = requests.filter(r => r.volunteerId && r.volunteerId === user?._id);

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "120px 24px 40px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 800, margin: "0 0 8px 0" }}>Volunteer Portal</h1>
          <p style={{ color: isLight ? "rgba(15,23,42,0.65)" : "rgba(255,255,255,0.6)" }}>Thanks for helping deliver food to those in need, {user?.name}!</p>
        </div>
        <button onClick={() => { logout(); navigate("/login"); }} style={{
          background: "transparent", color: COLORS.amber, border: `1px solid ${COLORS.amber}`,
          padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontWeight: 600
        }}>Logout</button>
      </div>

      <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
        <button 
          onClick={() => setActive("available")}
          style={{
            background: active === "available" ? COLORS.mint : "transparent",
            color: active === "available" ? COLORS.forest : textColor,
            border: active === "available" ? "none" : panelBorder,
            padding: "10px 20px", borderRadius: 8, fontWeight: 600, cursor: "pointer"
          }}
        >
          Available Pickups ({availableRequests.length})
        </button>
        <button 
          onClick={() => setActive("myDeliveries")}
          style={{
            background: active === "myDeliveries" ? COLORS.mint : "transparent",
            color: active === "myDeliveries" ? COLORS.forest : textColor,
            border: active === "myDeliveries" ? "none" : panelBorder,
            padding: "10px 20px", borderRadius: 8, fontWeight: 600, cursor: "pointer"
          }}
        >
          My Deliveries ({myDeliveries.length})
        </button>
      </div>

      <div style={{
        background: panelBg, backdropFilter: "blur(20px)", borderRadius: 16, border: panelBorder, padding: 24
      }}>
        {active === "available" && (
          <div>
            <h2 style={{ fontSize: 20, marginBottom: 16 }}>Available Pickups</h2>
            {availableRequests.length === 0 ? <p>No available deliveries right now.</p> : (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {availableRequests.map(r => (
                  <div key={r._id} style={{
                    padding: 16, borderRadius: 12, border: panelBorder, background: isLight ? "#f8fafc" : "rgba(0,0,0,0.2)",
                    display: "flex", justifyContent: "space-between", alignItems: "center"
                  }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 16, display: "flex", alignItems: "center", gap: 8 }}>
                        🍱 {r.foodId?.foodName} ({r.qty} {r.foodId?.unit})
                        {r.foodId?.isEmergency && (
                          <span style={{ 
                            background: "rgba(231,76,60,0.1)", 
                            color: "#e74c3c", fontSize: 11, fontWeight: 800, padding: "2px 8px", borderRadius: 12,
                            border: "1px solid rgba(231,76,60,0.3)"
                          }}>🚨 URGENT</span>
                        )}
                      </div>
                      <div style={{ fontSize: 14, color: isLight ? "rgba(15,23,42,0.65)" : "rgba(255,255,255,0.6)", marginTop: 4 }}>
                        From: {typeof r.foodId?.location === 'object' ? r.foodId?.location?.address : r.foodId?.location} <br/>
                        To: {r.ngoId?.name || r.ngoId?.organization || "NGO"}
                      </div>
                    </div>
                    <button 
                      onClick={() => handleAssign(r._id)}
                      style={{
                        background: COLORS.amber, color: "white", border: "none", padding: "8px 16px", borderRadius: 8, fontWeight: 600, cursor: "pointer"
                      }}
                    >
                      Accept Delivery
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {active === "myDeliveries" && (
          <div>
            <h2 style={{ fontSize: 20, marginBottom: 16 }}>My Active Deliveries</h2>
            {myDeliveries.length === 0 ? <p>You have no active deliveries.</p> : (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {myDeliveries.map(r => (
                  <div key={r._id} style={{
                    padding: 16, borderRadius: 12, border: panelBorder, background: isLight ? "#f8fafc" : "rgba(0,0,0,0.2)"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 16, display: "flex", alignItems: "center", gap: 8 }}>
                          🍱 {r.foodId?.foodName}
                          {r.foodId?.isEmergency && (
                            <span style={{ 
                              background: "rgba(231,76,60,0.1)", 
                              color: "#e74c3c", fontSize: 11, fontWeight: 800, padding: "2px 8px", borderRadius: 12,
                              border: "1px solid rgba(231,76,60,0.3)"
                            }}>🚨 URGENT</span>
                          )}
                        </div>
                        <div style={{ fontSize: 14, color: isLight ? "rgba(15,23,42,0.65)" : "rgba(255,255,255,0.6)", marginTop: 4 }}>
                          Quantity: {r.qty} {r.foodId?.unit}
                        </div>
                      </div>
                      <span style={{
                        background: "rgba(45, 99, 71, 0.5)", color: COLORS.mint, fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 20
                      }}>{r.status}</span>
                    </div>

                    <div style={{ fontSize: 14, marginBottom: 16, background: isLight ? "rgba(15,23,42,0.05)" : "rgba(255,255,255,0.05)", padding: 12, borderRadius: 8 }}>
                      <strong>Pickup:</strong> {typeof r.foodId?.location === 'object' ? r.foodId?.location?.address : r.foodId?.location} <br/>
                      <strong>Dropoff:</strong> {r.ngoId?.name || r.ngoId?.organization}
                    </div>

                    {r.status !== "completed" && (
                      <div style={{ display: "flex", gap: 12 }}>
                        {r.status === "accepted" && (
                          <button 
                            onClick={() => handleUpdateStatus(r._id, "picked_up")}
                            style={{ flex: 1, background: COLORS.mint, color: COLORS.forest, border: "none", padding: "10px", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}
                          >
                            Mark Picked Up
                          </button>
                        )}
                        {r.status === "picked_up" && (
                          <button 
                            onClick={() => handleUpdateStatus(r._id, "completed")}
                            style={{ flex: 1, background: COLORS.amber, color: "white", border: "none", padding: "10px", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}
                          >
                            Mark Delivered
                          </button>
                        )}
                        <button 
                          onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(typeof r.foodId?.location === 'object' ? r.foodId?.location?.address : r.foodId?.location)}&destination=${encodeURIComponent(r.ngoId?.address || r.ngoId?.location)}`, '_blank')}
                          style={{ flex: 1, background: "transparent", color: COLORS.mint, border: `1px solid ${COLORS.mint}`, padding: "10px", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}
                        >
                          🗺️ Open Maps
                        </button>
                        <button 
                          onClick={() => setActiveChat(activeChat === r._id ? null : r._id)}
                          style={{ flex: 1, background: "transparent", color: "white", border: `1px solid rgba(255,255,255,0.3)`, padding: "10px", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}
                        >
                          💬 Chat
                        </button>
                      </div>
                    )}
                    
                    {activeChat === r._id && (
                      <div style={{ marginTop: 16 }}>
                        <button onClick={() => setActiveChat(null)} style={{ background: "transparent", color: "#e74c3c", border: "none", cursor: "pointer", fontSize: 12, marginBottom: 8, fontWeight: 600, float: "right" }}>✖ Close Chat</button>
                        <div style={{ clear: "both" }}></div>
                        <ChatWidget requestId={r._id} currentUserId={user?._id} currentUserRole="volunteer" compact={true} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
