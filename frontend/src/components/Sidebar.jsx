import React, { useState } from "react";
import { COLORS } from "../theme";
import Logo from "./Logo";

export default function Sidebar({ role, activePage, onNav, onLogout, user }) {
  const [hov, setHov] = useState(null);

  const navItems = {
    donor: [
      { id: "donorHome", icon: "🏠", label: "Dashboard" },
      { id: "donate", icon: "➕", label: "Post Donation" },
      { id: "myDonations", icon: "📦", label: "My Donations" },
      { id: "impact", icon: "📊", label: "My Impact" },
      { id: "messages", icon: "💬", label: "Messages" },
    ],
    ngo: [
      { id: "ngoHome", icon: "🏠", label: "Dashboard" },
      { id: "browse", icon: "🔍", label: "Browse Food" },
      { id: "myRequests", icon: "📋", label: "My Requests" },
    ],
    admin: [
      { id: "adminHome", icon: "🏠", label: "Overview" },
      { id: "users", icon: "👥", label: "Users" },
      { id: "donations", icon: "📦", label: "All Donations" },
      { id: "analytics", icon: "📊", label: "Analytics" },
      { id: "settings", icon: "⚙️", label: "Settings" },
    ],
  };

  const items = navItems[role] || navItems.donor;

  const roleLabels = { donor: "Food Donor", ngo: "NGO", admin: "Administrator" };
  const roleColors = { donor: COLORS.amber, ngo: COLORS.mint, admin: "#7b68ee" };

  return (
    <div
      style={{
        width: 240,
        minHeight: "100vh",
        background: "rgba(0,0,0,0.3)",
        borderRight: "1px solid rgba(255,255,255,0.08)",
        display: "flex",
        flexDirection: "column",
        padding: "24px 0",
        flexShrink: 0,
      }}
    >
      <div style={{ padding: "0 20px 28px" }}>
        <Logo size="sm" />
      </div>

      <div style={{ padding: "0 14px", flex: 1 }}>
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
                gap: 12,
                padding: "11px 14px",
                borderRadius: 12,
                cursor: "pointer",
                marginBottom: 4,
                background: active ? "rgba(232,146,58,0.2)" : hov === item.id ? "rgba(255,255,255,0.06)" : "transparent",
                border: active ? "1px solid rgba(232,146,58,0.35)" : "1px solid transparent",
                transition: "all 0.15s",
              }}
            >
              <span style={{ fontSize: 18 }}>{item.icon}</span>
              <span style={{ fontSize: 14, fontWeight: active ? 600 : 400, color: active ? COLORS.amberLight : "rgba(255,255,255,0.7)" }}>
                {item.label}
              </span>
              {active && <div style={{ marginLeft: "auto", width: 6, height: 6, borderRadius: 3, background: COLORS.amber }} />}
            </div>
          );
        })}
      </div>

      <div style={{ padding: "20px 14px 0", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", marginBottom: 8 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: roleColors[role] || COLORS.amber,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
              fontWeight: 700,
              color: "white",
            }}
          >
            {role === "admin" ? "A" : role === "donor" ? "D" : "N"}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "white" }}>
              {user?.name || "User"}
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{roleLabels[role] || "User"}</div>
          </div>
        </div>

        <div
          onClick={onLogout}
          style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 10, cursor: "pointer", color: "rgba(255,100,100,0.7)" }}
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
