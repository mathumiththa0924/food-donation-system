import { useState } from "react";
import { COLORS } from "../theme";

export default function Sidebar({ role, activePage, onNav, onLogout, user, requestCount = 0, theme = "dark" }) {
  const [hov, setHov] = useState(null);
  const isLight = theme === "light";

  const navItems = {
    donor: [
      { id: "donorHome", icon: "🏠", label: "Dashboard" },
      { id: "donate", icon: "➕", label: "Post Donation" },
      { id: "myDonations", icon: "📦", label: "My Donations" },
      { id: "fundraisers", icon: "💰", label: "Fundraisers" },
      { id: "impact", icon: "📊", label: "My Impact" },
      { id: "requests", icon: "📋", label: "My Requests", badge: requestCount },
      { id: "feedbacks", icon: "⭐", label: "Feedback & Ratings" },
      { id: "profile", icon: "🏢", label: "Donor Profile" },
    ],
    ngo: [
      { id: "dashboard", icon: "🏠", label: "Dashboard" },
      { id: "browse", icon: "🔍", label: "Browse Food" },
      { id: "myRequests", icon: "📋", label: "My Requests", badge: requestCount },
      { id: "pickups", icon: "✅", label: "Pickups" },
      { id: "fundRequests", icon: "💸", label: "Fund Requests" },
      { id: "feedbacks", icon: "⭐", label: "Feedback & Ratings" },
      { id: "profile", icon: "🏢", label: "NGO Profile" },
    ],
    admin: [
      { id: "adminHome", icon: "🏠", label: "Overview" },
      { id: "users", icon: "👥", label: "Users" },
      { id: "donations", icon: "📦", label: "All Donations" },
      { id: "requests", icon: "📋", label: "Food Approval" },
      { id: "fundApprovals", icon: "⚖️", label: "Fund Approvals" },
      { id: "feedbacks", icon: "⭐", label: "Feedbacks" },
      { id: "notifications", icon: "🔔", label: "Notifications" },
      { id: "analytics", icon: "📊", label: "Analytics" },
      { id: "settings", icon: "⚙️", label: "Settings" },
    ],
  };

  const items = navItems[role] || navItems.donor;

  const roleColors = { donor: COLORS.amber, ngo: COLORS.mint, admin: "#7b68ee" };
  
  const activeColor = role === "ngo" ? COLORS.mint : roleColors[role];
  const activeBg = role === "ngo" ? "rgba(126, 200, 160, 0.18)" : "rgba(232,146,58,0.18)";
  const activeBorder = role === "ngo" ? "rgba(126, 200, 160, 0.3)" : "rgba(232,146,58,0.3)";

  return (
    <div
      style={{
        width: 240,
        minHeight: "100vh",
        background: isLight ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.32)",
        borderRight: isLight ? "1px solid rgba(148,163,184,0.25)" : "1px solid rgba(255,255,255,0.07)",
        display: "flex",
        flexDirection: "column",
        padding: "24px 0",
        flexShrink: 0,
      }}
    >
      <div style={{ padding: "0 14px", marginTop: "40px", flex: 1 }}>
        {items.map((item) => {
          const active = activePage === item.id;
          return (
            <div
              key={item.id}
              onClick={() => onNav(item.id)}
              onMouseEnter={() => setHov(item.id)}
              onMouseLeave={() => setHov(null)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 11,
                padding: "11px 14px",
                borderRadius: 11,
                cursor: "pointer",
                marginBottom: 4,
                background: active
                  ? isLight
                    ? "rgba(251,191,36,0.18)"
                    : activeBg
                  : hov === item.id
                    ? isLight
                      ? "rgba(148,163,184,0.18)"
                      : "rgba(255,255,255,0.06)"
                    : "transparent",
                border: active
                  ? `1px solid ${isLight ? "rgba(245,158,11,0.35)" : activeBorder}`
                  : "1px solid transparent",
                transition: "all 0.15s",
              }}
            >
              <span style={{ fontSize: 17 }}>{item.icon}</span>
              <span style={{ fontSize: 14, fontWeight: active ? 600 : 400, color: active ? activeColor : isLight ? "rgba(31,41,55,0.82)" : "rgba(255,255,255,0.68)", flex: 1 }}>
                {item.label}
              </span>
              {item.badge > 0 && (
                <span style={{ background: "#e74c3c", color: "white", fontSize: 11, fontWeight: 700, minWidth: 20, height: 20, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 6px" }}>
                  {item.badge}
                </span>
              )}
              {active && <div style={{ marginLeft: "auto", width: 5, height: 5, borderRadius: 3, background: activeColor }} />}
            </div>
          );
        })}
      </div>

      <div style={{ padding: "20px 14px 0", borderTop: isLight ? "1px solid rgba(148,163,184,0.25)" : "1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", marginBottom: 8 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: role === "ngo" ? "linear-gradient(135deg, #7ec8a0, #4a8c6a)" : `linear-gradient(135deg, ${COLORS.amber}, ${COLORS.amberLight})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
              fontWeight: 700,
              color: role === "ngo" ? "#1a3a2a" : "white",
              overflow: "hidden"
            }}
          >
            {user?.profileImage ? (
              <img src={user.profileImage} alt="profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              user?.name ? user.name.substring(0, 2).toUpperCase() : (role === "admin" ? "A" : role === "donor" ? "D" : "N")
            )}
          </div>
          <div style={{ overflow: "hidden" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: isLight ? "#0f172a" : "white", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
              {user?.name || "User"}
            </div>
          </div>
        </div>

        <div
          onClick={onLogout}
          style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 10, cursor: "pointer", color: isLight ? "#b91c1c" : "rgba(255,100,100,0.7)" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,100,100,0.08)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <span style={{ fontSize: 16 }}>🚪</span>
          <span style={{ fontSize: 14 }}>Logout</span>
        </div>
      </div>
    </div>
  );
}
