import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { COLORS } from "../theme";
import Sidebar from "../components/Sidebar";
import StatCard from "../components/StatCard";
import { getAllDonations, updateDonationStatus, deleteDonation } from "../api/donation";

const APPROVAL_COLORS = {
  pending: COLORS.amber,
  approved: "#4CAF50",
  rejected: "#e74c3c",
};

const approvalLabel = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "Pending");

export default function AdminDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [page, setPage] = useState("adminHome");
  const [donations, setDonations] = useState([]);
  const [loadingDonations, setLoadingDonations] = useState(false);
  const [donationError, setDonationError] = useState("");
  const [viewItem, setViewItem] = useState(null);
  const onLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const loadDonations = async () => {
    try {
      setLoadingDonations(true);
      setDonationError("");
      const res = await getAllDonations();
      setDonations(res.data || []);
    } catch (err) {
      setDonationError(err.response?.data?.message || "Failed to load donations");
    } finally {
      setLoadingDonations(false);
    }
  };

  useEffect(() => {
    loadDonations();
  }, []);

  const handleApproval = async (id, approvalStatus) => {
    try {
      setDonationError("");
      await updateDonationStatus(id, approvalStatus);
      await loadDonations();
    } catch (err) {
      setDonationError(err.response?.data?.message || "Failed to update donation");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this donation permanently?")) return;
    try {
      setDonationError("");
      await deleteDonation(id);
      setViewItem((cur) => (cur && cur._id === id ? null : cur));
      await loadDonations();
    } catch (err) {
      setDonationError(err.response?.data?.message || "Failed to delete donation");
    }
  };

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";
  const users = [
    { name: "Green Leaf Restaurant", role: "Donor", donations: 42, status: "Active", joined: "Jan 2026" },
    { name: "Mary Fernando", role: "Recipient", donations: 0, requests: 8, status: "Active", joined: "Feb 2026" },
    { name: "City Market Puttalam", role: "Donor", donations: 28, status: "Active", joined: "Mar 2026" },
    { name: "Ahmed Rasheed", role: "Recipient", requests: 12, status: "Pending", joined: "Apr 2026" },
  ];

  const roleColors = { Donor: COLORS.amber, Recipient: COLORS.mint, Admin: "#7b68ee" };
  const statusColors = { Active: "#4CAF50", Pending: COLORS.amber, Suspended: "#e74c3c" };

  return (
    <div style={{ display: "flex", minHeight: "100vh", position: "relative", zIndex: 1 }}>
      <Sidebar role="admin" activePage={page} onNav={setPage} onLogout={onLogout} user={user} />
      <div style={{ flex: 1, padding: "36px 40px", overflowY: "auto" }}>
        {page === "adminHome" && (
          <div>
            <div style={{ marginBottom: 28 }}>
              <h2 style={{ color: "white", fontFamily: "'Georgia', serif", fontSize: 28, margin: "0 0 6px" }}>Admin Overview ⚙️</h2>
              <p style={{ color: "rgba(255,255,255,0.5)", margin: 0 }}>MealBridge Platform Dashboard · April 2026</p>
            </div>
            <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
              <StatCard icon="🍱" label="Total Meals" value="12,400" color={COLORS.amberLight} sub="All time" />
              <StatCard icon="👥" label="Total Users" value="840" color={COLORS.mint} sub="Registered" />
              <StatCard icon="♻️" label="Food Saved" value="2.8T" color="#7ec8a0" sub="Kilograms" />
              <StatCard icon="📍" label="Areas Covered" value="18" color="#7b68ee" sub="Districts" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 18, padding: "20px" }}>
                <div style={{ fontWeight: 700, color: "white", marginBottom: 16 }}>Recent Donations</div>
                {[
                  { food: "Rice & Curry", donor: "Green Leaf", qty: "20p", time: "2h ago" },
                  { food: "Bread", donor: "Golden Bakery", qty: "30 items", time: "4h ago" },
                  { food: "Vegetables", donor: "City Market", qty: "15kg", time: "6h ago" },
                ].map((d, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", fontSize: 13 }}>
                    <span style={{ color: "white" }}>{d.food}</span>
                    <span style={{ color: "rgba(255,255,255,0.4)" }}>{d.donor} · {d.time}</span>
                  </div>
                ))}
              </div>
              <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 18, padding: "20px" }}>
                <div style={{ fontWeight: 700, color: "white", marginBottom: 16 }}>Platform Health</div>
                {[
                  { label: "Active Donors", val: 240, max: 400 },
                  { label: "Active Recipients", val: 180, max: 300 },
                  { label: "Successful Matches", val: 89, max: 100, pct: true },
                ].map((m) => (
                  <div key={m.label} style={{ marginBottom: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                      <span style={{ color: "rgba(255,255,255,0.7)" }}>{m.label}</span>
                      <span style={{ color: "white", fontWeight: 600 }}>{m.pct ? `${m.val}%` : m.val}</span>
                    </div>
                    <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 4, height: 6 }}>
                      <div style={{ background: COLORS.amber, width: `${(m.val / m.max) * 100}%`, height: "100%", borderRadius: 4, transition: "width 1s ease" }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {page === "users" && (
          <div>
            <h2 style={{ color: "white", fontFamily: "'Georgia', serif", fontSize: 26, margin: "0 0 20px" }}>👥 User Management</h2>
            <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 18, overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", gap: 0, padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)", fontSize: 11, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 600 }}>
                <span>User</span><span>Role</span><span>Activity</span><span>Joined</span><span>Status</span>
              </div>
              {users.map((u, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", gap: 0, padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)", alignItems: "center" }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "white" }}>{u.name}</span>
                  <span style={{ fontSize: 12, color: roleColors[u.role], fontWeight: 600 }}>{u.role}</span>
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>{u.role === "Donor" ? `${u.donations} donations` : `${u.requests} requests`}</span>
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>{u.joined}</span>
                  <span style={{ fontSize: 12, color: statusColors[u.status], fontWeight: 600 }}>● {u.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {page === "analytics" && (
          <div>
            <h2 style={{ color: "white", fontFamily: "'Georgia', serif", fontSize: 26, margin: "0 0 24px" }}>📊 Analytics</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 24 }}>
              {[
                { label: "This Week", val: "324 meals", icon: "📅" },
                { label: "This Month", val: "1,240 meals", icon: "🗓️" },
                { label: "Growth Rate", val: "+18%", icon: "📈" },
              ].map((s) => (
                <div key={s.label} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 18, padding: "20px", textAlign: "center" }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>{s.icon}</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: COLORS.amberLight }}>{s.val}</div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>
            <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 18, padding: "24px" }}>
              <div style={{ fontWeight: 700, color: "white", marginBottom: 20 }}>Monthly Distribution (2026)</div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 120 }}>
                {[40, 65, 52, 88, 72, 95, 110, 89, 98, 120, 104, 142].map((h, i) => (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <div style={{ width: "100%", background: i === 3 ? COLORS.amber : "rgba(255,255,255,0.15)", height: `${(h / 142) * 100}px`, borderRadius: "4px 4px 0 0", transition: "background 0.2s" }} />
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>{["J","F","M","A","M","J","J","A","S","O","N","D"][i]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {page === "donations" && (
          <div>
            <h2 style={{ color: "white", fontFamily: "'Georgia', serif", fontSize: 26, margin: "0 0 20px" }}>📦 All Donations</h2>
            {donationError && (
              <p style={{ color: "#ffb3b3", marginBottom: 16 }}>{donationError}</p>
            )}
            <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 18, overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 1.2fr 0.8fr 1.8fr", gap: 0, padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)", fontSize: 11, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 600 }}>
                <span>Food Item</span><span>Donor</span><span>Status</span><span>Posted Date</span><span>View</span><span>Action</span>
              </div>
              {loadingDonations ? (
                <div style={{ padding: "24px 20px", color: "rgba(255,255,255,0.5)" }}>Loading donations...</div>
              ) : donations.length === 0 ? (
                <div style={{ padding: "24px 20px", color: "rgba(255,255,255,0.4)" }}>No donations yet.</div>
              ) : (
                donations.map((d) => {
                  const status = d.approvalStatus || "pending";
                  return (
                    <div key={d._id} style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 1.2fr 0.8fr 1.8fr", gap: 0, padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)", alignItems: "center" }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: "white" }}>{d.foodName}</span>
                      <span style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>{d.donor?.name || "Unknown"}</span>
                      <span style={{ fontSize: 12, color: APPROVAL_COLORS[status], fontWeight: 600 }}>● {approvalLabel(status)}</span>
                      <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>{formatDate(d.createdAt)}</span>
                      <span>
                        <button onClick={() => setViewItem(d)} style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "white", fontSize: 12, padding: "6px 12px", borderRadius: 8, cursor: "pointer" }}>View</button>
                      </span>
                      <span style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <button onClick={() => handleApproval(d._id, "approved")} disabled={status === "approved"} style={{ background: status === "approved" ? "rgba(76,175,80,0.2)" : "rgba(76,175,80,0.85)", border: "none", color: "white", fontSize: 12, padding: "6px 10px", borderRadius: 8, cursor: status === "approved" ? "default" : "pointer", opacity: status === "approved" ? 0.5 : 1 }}>Approve</button>
                        <button onClick={() => handleApproval(d._id, "rejected")} disabled={status === "rejected"} style={{ background: status === "rejected" ? "rgba(231,76,60,0.2)" : "rgba(231,76,60,0.85)", border: "none", color: "white", fontSize: 12, padding: "6px 10px", borderRadius: 8, cursor: status === "rejected" ? "default" : "pointer", opacity: status === "rejected" ? 0.5 : 1 }}>Reject</button>
                        <button onClick={() => handleDelete(d._id)} style={{ background: "transparent", border: "1px solid rgba(231,76,60,0.5)", color: "#ff9b8f", fontSize: 12, padding: "6px 10px", borderRadius: 8, cursor: "pointer" }}>Delete</button>
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
        {page === "settings" && (
          <div>
            <h2 style={{ color: "white", fontFamily: "'Georgia', serif", fontSize: 26, margin: "0 0 20px" }}>⚙️ Settings</h2>
            <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 18, padding: "24px", textAlign: "center", color: "rgba(255,255,255,0.4)" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🚧</div>
              <p>This section is under development.</p>
            </div>
          </div>
        )}
      </div>
      {viewItem && (
        <div
          onClick={() => setViewItem(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ width: 420, maxWidth: "90vw", background: "#1f3a2c", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 18, padding: "26px" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <h3 style={{ color: "white", margin: 0, fontFamily: "'Georgia', serif" }}>Donation Details</h3>
              <button onClick={() => setViewItem(null)} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.6)", fontSize: 20, cursor: "pointer" }}>×</button>
            </div>
            {[
              ["Food Item", viewItem.foodName],
              ["Donor", viewItem.donor?.name || "Unknown"],
              ["Donor Email", viewItem.donor?.email || "—"],
              ["Quantity", viewItem.quantity],
              ["Location", viewItem.location],
              ["Posted Date", formatDate(viewItem.createdAt)],
            ].map(([label, value]) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.06)", fontSize: 14 }}>
                <span style={{ color: "rgba(255,255,255,0.5)" }}>{label}</span>
                <span style={{ color: "white", fontWeight: 500 }}>{value}</span>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", fontSize: 14 }}>
              <span style={{ color: "rgba(255,255,255,0.5)" }}>Status</span>
              <span style={{ color: APPROVAL_COLORS[viewItem.approvalStatus || "pending"], fontWeight: 600 }}>
                ● {approvalLabel(viewItem.approvalStatus || "pending")}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
