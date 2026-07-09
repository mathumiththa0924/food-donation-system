import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { COLORS } from "../theme";
import Sidebar from "../components/Sidebar";
import StatCard from "../components/StatCard";
import AdminSettings from "../components/AdminSettings";
import { getMoneyRequests, updateMoneyRequestStatus, deleteMoneyRequest } from "../api/moneyRequest";
import { getAllMoneyDonations, deleteMoneyDonation, METHOD_LABELS } from "../api/moneyDonation";
import { verifyAuth } from "../api/auth";
import api from "../api/axios";
import toast from "react-hot-toast";
import { createPortal } from "react-dom";
import { io } from "socket.io-client";

export default function AdminDashboard({ theme = "dark" }) {
  const navigate = useNavigate();
  const isLight = theme === "light";
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user") || "null"));
  const [page, setPage] = useState("adminHome");
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [donations, setDonations] = useState([]);
  const [requests, setRequests] = useState([]);
  const [fundRequests, setFundRequests] = useState([]);
  const [moneyDonations, setMoneyDonations] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [moneyFeedbacks, setMoneyFeedbacks] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [newNotification, setNewNotification] = useState({ message: "", targetRole: "all" });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null); // For buttons
  const [error, setError] = useState(null);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [selectedNgo, setSelectedNgo] = useState(null);
  const [selectedMoneyDonation, setSelectedMoneyDonation] = useState(null);
  const [viewDocUrl, setViewDocUrl] = useState(null);
  const contentTextColor = isLight ? "#0f172a" : "white";
  const contentBg = isLight ? "#f8fafc" : "transparent";

  // Users Pagination & Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // 📊 Fetch Admin Stats
  const fetchStats = async () => {
    try {
      const res = await api.get("/admin/stats");
      if (res.data.success) {
        setStats(res.data.data);
      } else {
        setError(`Success=false: ${res.data.message}`);
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
      setError(`API Error: ${err.response?.data?.message || err.message}`);
    }
  };

  // 👥 Fetch Users
  const fetchUsers = async (pageToFetch = currentPage) => {
    try {
      const res = await api.get("/admin/users", {
        params: { search: searchTerm, role: roleFilter, status: statusFilter, page: pageToFetch, limit: 10 }
      });
      if (res.data.success) {
        setUsers(res.data.data);
        setTotalPages(res.data.pages || 1);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to load users");
    }
  };

  // 📦 Fetch Donations
  const fetchDonations = async () => {
    try {
      const res = await api.get("/admin/donations");
      if (res.data.success) setDonations(res.data.data);
    } catch (err) {
      console.error("Error fetching donations:", err);
    }
  };

  // 📋 Fetch Requests
  const fetchRequests = async () => {
    try {
      const res = await api.get("/admin/requests");
      if (res.data.success) setRequests(res.data.data);
    } catch (err) {
      console.error("Error fetching requests:", err);
    }
  };

  // ⭐ Fetch Feedbacks
  const fetchFeedbacks = async () => {
    try {
      const res = await api.get("/admin/feedbacks");
      if (res.data.success) setFeedbacks(res.data.data);

      const mRes = await getAllMoneyDonations();
      if (mRes.success) {
        // Filter out money donations that don't have feedback yet
        setMoneyFeedbacks(mRes.data.filter(d => d.feedback && d.feedback.rating));
      }
    } catch (err) {
      console.error("Error fetching feedbacks:", err);
    }
  };

  // 🔔 Fetch Notifications
  const fetchNotifications = async () => {
    try {
      const res = await api.get("/admin/notifications");
      if (res.data.success) setNotifications(res.data.data);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  // 💰 Fetch Fund Requests
  const fetchFundRequests = async () => {
    try {
      const res = await getMoneyRequests();
      if (res.success) setFundRequests(res.data);
    } catch (err) {
      console.error("Error fetching fund requests:", err);
    }
  };

  // 💰 Fetch Money Donations
  const fetchMoneyDonations = async () => {
    try {
      const res = await getAllMoneyDonations();
      if (res.success) setMoneyDonations(res.data);
    } catch (err) {
      console.error("Error fetching money donations:", err);
    }
  };

  // 🔄 Load data on mount
  useEffect(() => {
    const verifyAndLoad = async () => {
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");
      if (!token || !userStr) {
        navigate("/login");
        return;
      }
      const user = JSON.parse(userStr);
      if (user.role !== "admin") {
        navigate("/login");
        return;
      }

      // Verify token with server
      try {
        await verifyAuth();
      } catch (err) {
        console.error("Auth verification failed:", err);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }

      const loadData = async () => {
        setLoading(true);
        await Promise.all([fetchStats(), fetchUsers(1), fetchDonations(), fetchMoneyDonations(), fetchRequests(), fetchFeedbacks(), fetchNotifications(), fetchFundRequests()]);
        setLoading(false);
      };
      loadData();
    };

     
    verifyAndLoad();
  }, [navigate]);

  useEffect(() => {
    if (!user?._id) return;

    const refreshTimer = setInterval(() => {
      fetchNotifications();
    }, 10000);

    return () => clearInterval(refreshTimer);
  }, [user?._id]);

  useEffect(() => {
    if (!user?._id) return;

    const socket = io(`http://${window.location.hostname}:5000`);
    socket.emit("join_user_room", user._id);

    socket.on("new_notification", (notif) => {
      setNotifications((prev) => [notif, ...prev]);
      toast(notif.message, {
        icon: notif.type === "new_message" ? "💬" : "🔔",
        style: { borderRadius: "10px", background: "#333", color: "#fff" },
        duration: 4000,
      });
    });

    socket.on("admin_deleted_item", () => {
      fetchNotifications();
    });

    return () => {
      socket.disconnect();
    };
  }, [user?._id]);

  useEffect(() => {
    fetchUsers(currentPage);
  }, [searchTerm, roleFilter, statusFilter, currentPage]);

  const onLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // 🗑️ Delete User
  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to permanently delete this user?")) return;
    setActionLoading(userId);
    try {
      await api.delete(`/admin/users/${userId}`);
      fetchUsers(currentPage);
    } catch (err) {
      console.error("Error deleting user:", err);
      alert(err.response?.data?.message || "Failed to delete user");
    }
    setActionLoading(null);
  };

  // 🚫 Toggle Suspend User
  const handleToggleSuspend = async (user) => {
    setActionLoading(user._id);
    try {
      if (user.status === "active") {
        await api.put(`/admin/users/${user._id}/suspend`);
      } else {
        await api.put(`/admin/users/${user._id}/activate`);
      }
      fetchUsers(currentPage);
    } catch (err) {
      console.error("Error updating user status:", err);
    }
    setActionLoading(null);
  };

  // 🗑️ Delete Feedback
  const handleDeleteFeedback = async (id) => {
    if (!window.confirm("Delete this feedback?")) return;
    setActionLoading(id);
    try {
      await api.delete(`/admin/feedbacks/${id}`);
      fetchFeedbacks();
    } catch (err) {
      console.error("Error deleting feedback:", err);
    }
    setActionLoading(null);
  };

  // 🗑️ Delete Money Feedback
  const handleDeleteMoneyFeedback = async (id) => {
    if (!window.confirm("Delete this fund donation feedback?")) return;
    setActionLoading(id);
    try {
      await api.delete(`/admin/money-feedbacks/${id}`);
      fetchFeedbacks();
    } catch (err) {
      console.error("Error deleting fund donation feedback:", err);
    }
    setActionLoading(null);
  };

  // 🗑️ Delete Donation
  const handleDeleteDonation = async (id) => {
    if (!window.confirm("Delete this donation?")) return;
    setActionLoading(id);
    try {
      await api.delete(`/admin/donations/${id}`);
      fetchDonations();
    } catch (err) {
      console.error("Error deleting donation:", err);
    }
    setActionLoading(null);
  };

  // 🗑️ Delete Money Donation
  const handleDeleteMoneyDonation = async (id) => {
    if (!window.confirm("Delete this fund donation?")) return;
    setActionLoading(id);
    try {
      await deleteMoneyDonation(id);
      fetchMoneyDonations();
    } catch (err) {
      console.error("Error deleting money donation:", err);
    }
    setActionLoading(null);
  };

  // 📋 Handle Food Request Status
  /* const handleRequestStatus = async (requestId, status) => {
    setActionLoading(requestId);
    try {
      await api.put(`/admin/requests/${requestId}/status`, { status });
      fetchRequests();
    } catch (err) {
      console.error("Error updating request:", err);
    }
    setActionLoading(null);
  }; */

  // 📦 Handle Food Donation Admin Status
  const handleDonationAdminStatus = async (donationId, adminStatus) => {
    setActionLoading(donationId);
    try {
      await api.put(`/admin/donations/${donationId}/admin-status`, { adminStatus });
      fetchDonations();
    } catch (err) {
      console.error("Error updating donation admin status:", err);
    }
    setActionLoading(null);
  };

  // 💸 Handle Fund Request Status
  const handleFundRequestStatus = async (id, status) => {
    setActionLoading(id);
    try {
      await updateMoneyRequestStatus(id, status);
      fetchFundRequests();
    } catch (err) {
      console.error("Error updating fund request:", err);
    }
    setActionLoading(null);
  };

  // 🗑️ Delete Fund Request
  const handleDeleteFundRequest = async (id) => {
    if (!window.confirm("Are you sure you want to delete this fund request?")) return;
    setActionLoading(id);
    try {
      await deleteMoneyRequest(id);
      fetchFundRequests();
    } catch (err) {
      console.error("Error deleting fund request:", err);
      alert("Failed to delete fund request");
    }
    setActionLoading(null);
  };

  // �️ Delete Food Request
  const handleDeleteRequest = async (id) => {
    if (!window.confirm("Are you sure you want to delete this food request?")) return;
    setActionLoading(id);
    try {
      await api.delete(`/admin/requests/${id}`);
      fetchRequests();
    } catch (err) {
      console.error("Error deleting food request:", err);
      alert("Failed to delete food request");
    }
    setActionLoading(null);
  };

  // �🔔 Send Notification
  const handleSendNotification = async (e) => {
    e.preventDefault();
    setActionLoading("sending_notification");
    try {
      await api.post("/admin/notifications", newNotification);
      setNewNotification({ message: "", targetRole: "all" });
      fetchNotifications();
      alert("Notification sent successfully!");
    } catch (err) {
      console.error("Error sending notification:", err);
      alert("Failed to send notification");
    }
    setActionLoading(null);
  };

  // 🗑️ Delete Notification
  const handleDeleteNotification = async (id) => {
    if (!window.confirm("Are you sure you want to delete this notification?")) return;
    setActionLoading(`delete_notification_${id}`);
    try {
      await api.delete(`/admin/notifications/${id}`);
      fetchNotifications();
      toast.success("Notification deleted successfully");
    } catch (err) {
      console.error("Error deleting notification:", err);
      toast.error("Failed to delete notification");
    }
    setActionLoading(null);
  };

  /* const mockUsers = [
    { name: "Green Leaf Restaurant", role: "Donor", donations: 42, status: "Active", joined: "Jan 2026" },
    { name: "Mary Fernando", role: "Recipient", donations: 0, requests: 8, status: "Active", joined: "Feb 2026" },
    { name: "City Market Puttalam", role: "Donor", donations: 28, status: "Active", joined: "Mar 2026" },
    { name: "Ahmed Rasheed", role: "Recipient", requests: 12, status: "Pending", joined: "Apr 2026" },
  ]; */

  const roleColors = { donor: COLORS.amber, ngo: COLORS.mint, admin: "#7b68ee" };
  const statusColors = { active: "#4CAF50", pending: COLORS.amber, suspended: "#e74c3c" };

  return (
    <div style={{ display: "flex", minHeight: "100vh", position: "relative", zIndex: 1, background: isLight ? "#f4f7fb" : "transparent", color: contentTextColor }}>
      <Sidebar role="admin" activePage={page} onNav={setPage} onLogout={onLogout} user={user} theme={theme} />
      <div style={{ flex: 1, padding: "36px 40px", overflowY: "auto", background: contentBg }}>
        
        {/* Animated Notification Bell Top Right */}
        <div 
          onClick={() => setPage("notifications")}
          style={{
            position: "absolute",
            top: 24,
            right: 36,
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: isLight ? "rgba(15,23,42,0.08)" : "rgba(255,255,255,0.06)",
            border: isLight ? "1px solid rgba(15,23,42,0.12)" : "1px solid rgba(255,255,255,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
            cursor: "pointer",
            zIndex: 100,
            transition: "all 0.2s"
          }}
          onMouseEnter={e => e.currentTarget.style.background = isLight ? "rgba(15,23,42,0.1)" : "rgba(255,255,255,0.1)"}
          onMouseLeave={e => e.currentTarget.style.background = isLight ? "rgba(15,23,42,0.08)" : "rgba(255,255,255,0.06)"}
          title="Notifications"
        >
          🔔
          {notifications.filter(n => !n.read && (n.recipientId?._id === user?._id || n.recipientId === user?._id)).length > 0 && (
            <div style={{
              position: "absolute",
              top: -5,
              right: -5,
              minWidth: 18,
              height: 18,
              borderRadius: 9,
              background: COLORS.amber,
              color: "#0f172a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 10,
              fontWeight: 800,
              padding: "0 4px",
              boxShadow: "0 0 0 2px rgba(15,23,42,0.45)",
              animation: "pulseDot 2s infinite"
            }}>
              {notifications.filter(n => !n.read && (n.recipientId?._id === user?._id || n.recipientId === user?._id)).length}
            </div>
          )}
        </div>

        {page === "adminHome" && (
          <div>
            <div style={{ marginBottom: 28 }}>
              <h2 style={{ color: "white", fontSize: 28, margin: "0 0 6px" }}>Admin Overview ⚙️</h2>
              <p style={{ color: "rgba(255,255,255,0.7)", margin: 0 }}>MealBridge Platform Dashboard · {new Date().toLocaleDateString()}</p>
            </div>

            {loading ? (
              <div style={{ textAlign: "center", padding: "40px", color: "rgba(255,255,255,0.7)" }}>
                <p>Loading stats...</p>
              </div>
            ) : stats ? (
              <>
                <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
                  <StatCard icon="🍱" label="Total Donations" value={stats.totalDonations || 0} color={COLORS.amberLight} sub="Meals" />
                  <StatCard icon="💰" label="Total Funds" value={`LKR ${stats.totalFundsDonated || 0}`} color={COLORS.amber} sub="Donated" />
                  <StatCard icon="👥" label="Total Users" value={stats.totalUsers || 0} color={COLORS.mint} sub="Registered" />
                  <StatCard icon="📍" label="Total Requests" value={stats.totalRequests || 0} color="#7b68ee" sub="Processed" />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                  <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 18, padding: "20px" }}>
                    <div style={{ fontWeight: 700, color: "white", marginBottom: 16 }}>User Breakdown</div>
                    {[
                      { label: "Donors", icon: "👤", count: stats.donors || 0, color: COLORS.amber },
                      { label: "NGOs", icon: "🏢", count: stats.ngos || 0, color: COLORS.mint },
                      { label: "Admins", icon: "⚙️", count: stats.admins || 0, color: "#7b68ee" },
                    ].map((item) => (
                      <div key={item.label} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                        <span style={{ color: "rgba(255,255,255,0.7)" }}>{item.icon} {item.label}</span>
                        <span style={{ color: item.color, fontWeight: 700, fontSize: 16 }}>{item.count}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 18, padding: "20px" }}>
                    <div style={{ fontWeight: 700, color: "white", marginBottom: 16 }}>Platform Metrics</div>
                    {[
                      { label: "Total Feedbacks", val: stats.totalFeedbacks || 0, icon: "⭐" },
                      { label: "Avg Completion Rate", val: "94%", icon: "✅" },
                    ].map((m) => (
                      <div key={m.label} style={{ padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "rgba(255,255,255,0.7)" }}>{m.icon} {m.label}</span>
                        <span style={{ color: COLORS.amber, fontWeight: 700 }}>{m.val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div style={{ color: "red", padding: "20px", background: "rgba(255,0,0,0.1)", borderRadius: "8px" }}>
                Error loading stats: {error || "Unknown error"}
              </div>
            )}
          </div>
        )}
        {page === "users" && (
          <div>
            <h2 style={{ color: "white", fontSize: 26, margin: "0 0 20px" }}>👥 User Management</h2>
            
            <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
              <input 
                type="text" 
                placeholder="Search by name or email..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ flex: 1, padding: "10px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(0,0,0,0.2)", color: "white" }}
              />
              <select 
                value={roleFilter} 
                onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }}
                style={{ padding: "10px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(0,0,0,0.2)", color: "white" }}
              >
                <option value="all">All Roles</option>
                <option value="donor">Donors</option>
                <option value="ngo">NGOs</option>
                <option value="admin">Admins</option>
              </select>
              <select 
                value={statusFilter} 
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                style={{ padding: "10px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(0,0,0,0.2)", color: "white" }}
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>

            {loading ? (
              <div style={{ textAlign: "center", padding: "40px", color: "rgba(255,255,255,0.7)" }}>Loading users...</div>
            ) : (
              <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 18, overflow: "hidden" }}>
                <div style={{ display: "grid", gridTemplateColumns: "18% 12% 18% 12% 12% 12% 16%", gap: 0, padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)", fontSize: 11, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 600, textAlign: "left" }}>
                  <span>User</span><span>Role</span><span>Email</span><span>Email Status</span><span>Status</span><span>Joined</span><span>Actions</span>
                </div>
                {users.length > 0 ? users.map((u, i) => (
                  <div key={u._id || i} style={{ display: "grid", gridTemplateColumns: "18% 12% 18% 12% 12% 12% 16%", gap: 0, padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)", alignItems: "center", textAlign: "left" }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "white", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>{u.name}</span>
                    <span style={{ fontSize: 12, color: roleColors[u.role?.toLowerCase()] || "white", fontWeight: 600, textTransform: "capitalize" }}>{u.role}</span>
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", marginRight: 10 }}>{u.email}</span>
                    <span style={{ fontSize: 12, color: u.isEmailVerified ? COLORS.mint : "#e74c3c", fontWeight: 600 }}>{u.isEmailVerified ? "✅ Verified" : "❌ Unverified"}</span>
                    <span style={{ fontSize: 12, color: statusColors[u.status?.toLowerCase()] || "white", fontWeight: 600, textTransform: "capitalize" }}>● {u.status || "active"}</span>
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>{new Date(u.createdAt).toLocaleDateString()}</span>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        onClick={() => handleToggleSuspend(u)}
                        disabled={u.role === "admin" || actionLoading === u._id}
                        style={{
                          padding: "6px 10px",
                          fontSize: 11,
                          background: u.role === "admin" ? "rgba(255,255,255,0.1)" : "rgba(255,165,0,0.2)",
                          color: u.role === "admin" ? "rgba(255,255,255,0.3)" : COLORS.amber,
                          border: `1px solid ${u.role === "admin" ? "transparent" : COLORS.amber}`,
                          borderRadius: 6,
                          cursor: u.role === "admin" ? "not-allowed" : "pointer",
                          fontWeight: 600
                        }}
                      >
                        {actionLoading === u._id ? "..." : (u.status !== "active" ? "Activate" : "Suspend")}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(u._id)}
                        disabled={u.role === "admin" || actionLoading === u._id}
                        style={{
                          padding: "6px 10px",
                          fontSize: 11,
                          background: u.role === "admin" ? "rgba(255,255,255,0.1)" : "rgba(231,76,60,0.2)",
                          color: u.role === "admin" ? "rgba(255,255,255,0.3)" : "#e74c3c",
                          border: `1px solid ${u.role === "admin" ? "transparent" : "#e74c3c"}`,
                          borderRadius: 6,
                          cursor: u.role === "admin" ? "not-allowed" : "pointer",
                          fontWeight: 600
                        }}
                      >
                        {actionLoading === u._id ? "..." : "Delete"}
                      </button>
                    </div>
                  </div>
                )) : (
                  <div style={{ padding: "20px", textAlign: "center", color: "rgba(255,255,255,0.4)" }}>No users found</div>
                )}
              </div>
            )}
            
            {totalPages > 1 && (
              <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 20 }}>
                <button 
                  disabled={currentPage === 1} 
                  onClick={() => setCurrentPage(p => p - 1)}
                  style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "white", cursor: currentPage === 1 ? "not-allowed" : "pointer", opacity: currentPage === 1 ? 0.5 : 1 }}
                >
                  Previous
                </button>
                <span style={{ display: "flex", alignItems: "center", color: "rgba(255,255,255,0.7)", fontSize: 14 }}>
                  Page {currentPage} of {totalPages}
                </span>
                <button 
                  disabled={currentPage === totalPages} 
                  onClick={() => setCurrentPage(p => p + 1)}
                  style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "white", cursor: currentPage === totalPages ? "not-allowed" : "pointer", opacity: currentPage === totalPages ? 0.5 : 1 }}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
        {page === "analytics" && (
          <div>
            <h2 style={{ color: "white", fontSize: 26, margin: "0 0 24px" }}>📊 Analytics</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 24 }}>
              {[
                { label: "Meals This Week", val: `${stats?.weeklyDonationsCount || 0}`, icon: "📅" },
                { label: "Meals This Month", val: `${stats?.monthlyDonationsCount || 0}`, icon: "🗓️" },
                { label: "Funds This Week", val: `LKR ${stats?.weeklyFunds || 0}`, icon: "💰" },
                { label: "Funds This Month", val: `LKR ${stats?.monthlyFunds || 0}`, icon: "🏦" },
                { label: "Total Platform Users", val: stats?.totalUsers || 0, icon: "👥" },
              ].map((s) => (
                <div key={s.label} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 18, padding: "20px", textAlign: "center" }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>{s.icon}</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: COLORS.amberLight }}>{s.val}</div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              {/* Meal Donations Chart */}
              <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 18, padding: "24px" }}>
                <div style={{ fontWeight: 700, color: "white", marginBottom: 20 }}>Monthly Meal Donations ({new Date().getFullYear()})</div>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 120 }}>
                  {(stats?.monthlyDistribution || [0,0,0,0,0,0,0,0,0,0,0,0]).map((h, i) => {
                     const maxVal = Math.max(...(stats?.monthlyDistribution || [1])) || 1;
                     const heightPercent = Math.max((h / maxVal) * 100, 2); // min 2% height for visibility
                     return (
                      <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                        <div style={{ width: "100%", background: "rgba(255,255,255,0.15)", height: `${heightPercent}%`, borderRadius: "4px 4px 0 0", transition: "background 0.2s" }} title={`${h} meals`} />
                        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>{["J","F","M","A","M","J","J","A","S","O","N","D"][i]}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Fund Donations Chart */}
              <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 18, padding: "24px" }}>
                <div style={{ fontWeight: 700, color: "white", marginBottom: 20 }}>Monthly Fund Donations (LKR) ({new Date().getFullYear()})</div>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 120 }}>
                  {(stats?.monthlyFundsDistribution || [0,0,0,0,0,0,0,0,0,0,0,0]).map((h, i) => {
                     const maxVal = Math.max(...(stats?.monthlyFundsDistribution || [1])) || 1;
                     const heightPercent = Math.max((h / maxVal) * 100, 2); // min 2% height for visibility
                     return (
                      <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                        <div style={{ width: "100%", background: "rgba(46, 204, 113, 0.4)", height: `${heightPercent}%`, borderRadius: "4px 4px 0 0", transition: "background 0.2s" }} title={`LKR ${h}`} />
                        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>{["J","F","M","A","M","J","J","A","S","O","N","D"][i]}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
        {page === "fundApprovals" && (
          <div>
            <h2 style={{ color: "white", fontSize: 26, margin: "0 0 20px" }}>⚖️ Fund Approvals</h2>
            {loading ? (
              <div style={{ textAlign: "center", padding: "40px", color: "rgba(255,255,255,0.7)" }}>Loading fund requests...</div>
            ) : fundRequests.length > 0 ? (
              <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 18, overflow: "hidden" }}>
                <div style={{ display: "grid", gridTemplateColumns: "16% 12% 12% 10% 24% 6% 20%", gap: 0, padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)", fontSize: 11, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 600, textAlign: "left" }}>
                  <span>NGO Name</span><span>Purpose</span><span>Amount</span><span>Status</span><span>Documents</span><span>Details</span><span>Actions</span>
                </div>
                {fundRequests.map((r, i) => (
                  <div key={r._id || i} style={{ display: "grid", gridTemplateColumns: "16% 12% 12% 10% 24% 6% 20%", gap: 0, padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)", alignItems: "center", textAlign: "left" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, overflow: "hidden" }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: "white", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                        {r.ngoId?.name || "Unknown"}
                      </span>
                    </div>
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", paddingRight: 10 }}>{r.purpose}</span>
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.8)" }}>LKR {r.amountNeeded}</span>
                    <span style={{ fontSize: 12, color: r.status === "approved" ? COLORS.mint : r.status === "rejected" ? "#e74c3c" : COLORS.amber, fontWeight: 600, textTransform: "capitalize" }}>● {r.status}</span>
                    <div style={{ fontSize: 14, display: "flex", flexDirection: "row", flexWrap: "nowrap", overflowX: "auto", gap: 8, fontWeight: 500, paddingBottom: 4 }}>
                      <a href="#" onClick={(e) => { e.preventDefault(); setViewDocUrl(r.documents?.needStatement?.startsWith('http') ? r.documents.needStatement : `http://${window.location.hostname}:5000/uploads/${r.documents?.needStatement?.split(/[\\/]/).pop()}`); }} style={{color: COLORS.mint, textDecoration: "none", background: "rgba(46, 204, 113, 0.1)", padding: "6px 12px", borderRadius: 6, display: "flex", alignItems: "center", gap: 4, whiteSpace: "nowrap"}}>📄 Need Statement</a>
                      <a href="#" onClick={(e) => { e.preventDefault(); setViewDocUrl(r.documents?.registrationCertificate?.startsWith('http') ? r.documents.registrationCertificate : `http://${window.location.hostname}:5000/uploads/${r.documents?.registrationCertificate?.split(/[\\/]/).pop()}`); }} style={{color: COLORS.mint, textDecoration: "none", background: "rgba(46, 204, 113, 0.1)", padding: "6px 12px", borderRadius: 6, display: "flex", alignItems: "center", gap: 4, whiteSpace: "nowrap"}}>📄 Registration</a>
                      <a href="#" onClick={(e) => { e.preventDefault(); setViewDocUrl(r.documents?.bankDetails?.startsWith('http') ? r.documents.bankDetails : `http://${window.location.hostname}:5000/uploads/${r.documents?.bankDetails?.split(/[\\/]/).pop()}`); }} style={{color: COLORS.mint, textDecoration: "none", background: "rgba(46, 204, 113, 0.1)", padding: "6px 12px", borderRadius: 6, display: "flex", alignItems: "center", gap: 4, whiteSpace: "nowrap"}}>📄 Bank Details</a>
                    </div>
                    <div>
                      <button 
                        onClick={() => setSelectedNgo(r.ngoId)}
                        style={{ background: "rgba(126, 200, 160, 0.1)", border: "1px solid rgba(126, 200, 160, 0.3)", color: COLORS.mint, padding: "4px 10px", borderRadius: 6, fontSize: 11, cursor: "pointer" }}
                      >
                        View
                      </button>
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <button 
                        onClick={() => handleFundRequestStatus(r._id, "approved")}
                        disabled={actionLoading === r._id || r.status !== "pending"}
                        style={{ background: "rgba(46, 204, 113, 0.1)", border: "1px solid rgba(46, 204, 113, 0.3)", color: "#2ecc71", padding: "4px 10px", borderRadius: 6, fontSize: 11, cursor: r.status === "pending" ? "pointer" : "not-allowed", opacity: r.status === "pending" ? 1 : 0.5 }}
                      >
                        Approve
                      </button>
                      <button 
                        onClick={() => handleFundRequestStatus(r._id, "rejected")}
                        disabled={actionLoading === r._id || r.status !== "pending"}
                        style={{ background: "rgba(231,76,60,0.1)", border: "1px solid rgba(231,76,60,0.3)", color: "#e74c3c", padding: "4px 10px", borderRadius: 6, fontSize: 11, cursor: r.status === "pending" ? "pointer" : "not-allowed", opacity: r.status === "pending" ? 1 : 0.5 }}
                      >
                        Reject
                      </button>
                      <button 
                        onClick={() => handleDeleteFundRequest(r._id)}
                        disabled={actionLoading === r._id}
                        style={{ background: "rgba(231,76,60,0.1)", border: "1px solid rgba(231,76,60,0.3)", color: "#e74c3c", padding: "4px 10px", borderRadius: 6, fontSize: 11, cursor: actionLoading === r._id ? "not-allowed" : "pointer" }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "40px", color: "rgba(255,255,255,0.5)" }}>No fund requests found.</div>
            )}
          </div>
        )}
        {page === "requests" && (
          <div>
            <h2 style={{ color: "white", fontSize: 26, margin: "0 0 20px" }}>🍱 Food Approval</h2>

            {/* Food Donations Table */}
            {loading ? (
              <div style={{ textAlign: "center", padding: "40px", color: "rgba(255,255,255,0.7)" }}>Loading food donations...</div>
            ) : donations.length > 0 ? (
              <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 18, overflow: "hidden" }}>
                <div style={{ display: "grid", gridTemplateColumns: "20% 16% 14% 14% 8% 28%", gap: 0, padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.08)", fontSize: 11, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 600, textAlign: "left" }}>
                  <span>Food Item</span><span>Donor</span><span>Status</span><span>Posted Date</span><span>Details</span><span>Action</span>
                </div>
                {donations.map((d, i) => (
                  <div key={d._id || i} style={{ display: "grid", gridTemplateColumns: "20% 16% 14% 14% 8% 28%", gap: 0, padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.04)", alignItems: "center", textAlign: "left" }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "white", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>{d.foodName}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, paddingRight: 8, overflow: "hidden" }}>
                      <span style={{ fontSize: 12, color: "rgba(255,255,255,0.85)", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", fontWeight: 500 }}>
                        {d.donor?.name || "Unknown"}
                      </span>
                    </div>
                    <span style={{ fontSize: 12, color: d.adminStatus === "approved" ? COLORS.mint : d.adminStatus === "rejected" ? "#e74c3c" : COLORS.amber, fontWeight: 600, textTransform: "capitalize" }}>{d.adminStatus || "pending"}</span>
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>{new Date(d.createdAt).toLocaleDateString()}</span>
                    <div>
                      <button
                        onClick={() => setSelectedDonation(d)}
                        style={{ background: "rgba(126, 200, 160, 0.1)", border: "1px solid rgba(126, 200, 160, 0.3)", color: COLORS.mint, padding: "3px 8px", borderRadius: 4, fontSize: 10, cursor: "pointer", fontWeight: 500 }}
                      >
                        View
                      </button>
                    </div>
                    <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                      <button
                        onClick={() => handleDonationAdminStatus(d._id, "approved")}
                        disabled={actionLoading === d._id || d.adminStatus === "approved"}
                        style={{ background: "rgba(46, 204, 113, 0.1)", border: "1px solid rgba(46, 204, 113, 0.3)", color: "#2ecc71", padding: "3px 8px", borderRadius: 4, fontSize: 10, cursor: d.adminStatus === "pending" ? "pointer" : "not-allowed", opacity: d.adminStatus === "pending" ? 1 : 0.5, fontWeight: 500 }}
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleDonationAdminStatus(d._id, "rejected")}
                        disabled={actionLoading === d._id || d.adminStatus === "rejected"}
                        style={{ background: "rgba(231,76,60,0.1)", border: "1px solid rgba(231,76,60,0.3)", color: "#e74c3c", padding: "3px 8px", borderRadius: 4, fontSize: 10, cursor: d.adminStatus === "pending" ? "pointer" : "not-allowed", opacity: d.adminStatus === "pending" ? 1 : 0.5, fontWeight: 500 }}
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleDeleteDonation(d._id)}
                        disabled={actionLoading === d._id}
                        style={{ background: "rgba(231,76,60,0.1)", border: "1px solid rgba(231,76,60,0.3)", color: "#e74c3c", padding: "3px 8px", borderRadius: 4, fontSize: 10, cursor: "pointer", fontWeight: 500 }}
                      >
                        {actionLoading === d._id ? "..." : "Delete"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 18, padding: "24px", textAlign: "center", color: "rgba(255,255,255,0.4)" }}>
                <p>No food donations found.</p>
              </div>
            )}
          </div>
        )}
        {page === "feedbacks" && (
          <div>
            <h2 style={{ color: "white", fontSize: 26, margin: "0 0 20px" }}>⭐ Feedback & Ratings</h2>
            {loading ? (
              <div style={{ textAlign: "center", padding: "40px", color: "rgba(255,255,255,0.7)" }}>Loading feedbacks...</div>
            ) : (feedbacks.length > 0 || moneyFeedbacks.length > 0) ? (
              <>
                {/* Food Feedbacks */}
                {feedbacks.length > 0 && (
                  <div style={{ marginBottom: 32 }}>
                    <h3 style={{ color: COLORS.mint, marginBottom: 16 }}>Food Donation Feedbacks (NGOs rating Donors)</h3>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                      {feedbacks.map((f, i) => (
                        <div key={f._id || i} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 18, padding: "20px", display: "flex", flexDirection: "column", gap: 10 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <div style={{ width: 32, height: 32, borderRadius: 16, background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", color: "white" }}>
                                {f.ngoId?.name ? f.ngoId.name[0].toUpperCase() : "?"}
                              </div>
                              <div>
                                <div style={{ fontWeight: 600, color: "white", fontSize: 14 }}>{f.ngoId?.name || "Unknown NGO"}</div>
                                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>rating {f.donorId?.name || "Unknown Donor"}</div>
                              </div>
                            </div>
                            <div style={{ color: COLORS.amberLight, fontSize: 14 }}>
                              {"★".repeat(f.rating || 5)}{"☆".repeat(5 - (f.rating || 5))}
                            </div>
                          </div>
                          <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 14, lineHeight: 1.5, flex: 1 }}>"{f.comment}"</div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
                            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{new Date(f.createdAt).toLocaleDateString()}</span>
                            <button 
                              onClick={() => handleDeleteFeedback(f._id)}
                              disabled={actionLoading === f._id}
                              style={{ background: "rgba(231,76,60,0.1)", border: "1px solid rgba(231,76,60,0.3)", color: "#e74c3c", padding: "4px 10px", borderRadius: 6, fontSize: 11, cursor: "pointer" }}
                            >
                              {actionLoading === f._id ? "..." : "Delete"}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Money Feedbacks */}
                {moneyFeedbacks.length > 0 && (
                  <div>
                    <h3 style={{ color: COLORS.amberLight, marginBottom: 16 }}>Fund Donation Feedbacks (Donors rating NGOs)</h3>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                      {moneyFeedbacks.map((m, i) => (
                        <div key={m._id || i} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 18, padding: "20px", display: "flex", flexDirection: "column", gap: 10 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <div style={{ width: 32, height: 32, borderRadius: 16, background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", color: "white" }}>
                                {m.donorId?.name ? m.donorId.name[0].toUpperCase() : "?"}
                              </div>
                              <div>
                                <div style={{ fontWeight: 600, color: "white", fontSize: 14 }}>{m.donorId?.name || "Unknown Donor"}</div>
                                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>rating {m.moneyRequestId?.ngoId?.name || "Unknown NGO"}</div>
                              </div>
                            </div>
                            <div style={{ color: COLORS.amberLight, fontSize: 14 }}>
                              {"★".repeat(m.feedback.rating || 5)}{"☆".repeat(5 - (m.feedback.rating || 5))}
                            </div>
                          </div>
                          <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 14, lineHeight: 1.5, flex: 1 }}>"{m.feedback.comment}"</div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
                            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{new Date(m.createdAt).toLocaleDateString()}</span>
                              <span style={{ fontSize: 11, color: COLORS.amberLight }}>Donated LKR {m.amount}</span>
                            </div>
                            <button 
                              onClick={() => handleDeleteMoneyFeedback(m._id)}
                              disabled={actionLoading === m._id}
                              style={{ background: "rgba(231,76,60,0.1)", border: "1px solid rgba(231,76,60,0.3)", color: "#e74c3c", padding: "4px 10px", borderRadius: 6, fontSize: 11, cursor: "pointer" }}
                            >
                              {actionLoading === m._id ? "..." : "Delete"}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 18, padding: "24px", textAlign: "center", color: "rgba(255,255,255,0.4)" }}>
                <p>No feedback found.</p>
              </div>
            )}
          </div>
        )}
        {page === "notifications" && (
          <div>
            <h2 style={{ color: "white", fontSize: 26, margin: "0 0 20px" }}>🔔 Notifications</h2>
            
            <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 18, padding: "20px", marginBottom: "24px" }}>
               <h3 style={{ color: "white", fontSize: 16, marginTop: 0, marginBottom: 16 }}>Send New Notification</h3>
               <form onSubmit={handleSendNotification} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <input
                    type="text"
                    required
                    placeholder="Enter notification message..."
                    value={newNotification.message}
                    onChange={(e) => setNewNotification({ ...newNotification, message: e.target.value })}
                    style={{ flex: 1, padding: "10px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(0,0,0,0.2)", color: "white" }}
                  />
                  <select
                    value={newNotification.targetRole}
                    onChange={(e) => setNewNotification({ ...newNotification, targetRole: e.target.value })}
                    style={{ padding: "10px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(0,0,0,0.2)", color: "white" }}
                  >
                    <option value="all">All Users</option>
                    <option value="donor">Donors</option>
                    <option value="ngo">NGOs</option>
                  </select>
                  <button
                    type="submit"
                    disabled={actionLoading === "sending_notification"}
                    style={{ padding: "10px 20px", borderRadius: 8, background: COLORS.amber, color: "#000", fontWeight: "bold", border: "none", cursor: "pointer" }}
                  >
                    {actionLoading === "sending_notification" ? "Sending..." : "Send"}
                  </button>
               </form>
            </div>

            {loading ? (
              <div style={{ textAlign: "center", padding: "40px", color: "rgba(255,255,255,0.7)" }}>Loading notifications...</div>
            ) : notifications.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {notifications.map((n, i) => (
                  <div key={n._id || i} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ color: "white", fontSize: 14, marginBottom: 4 }}>{n.message}</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>To: {n.recipientId?.name || "Unknown"} ({n.recipientId?.role || "user"})</div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" }}>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{new Date(n.createdAt).toLocaleString()}</div>
                      <button 
                        onClick={() => handleDeleteNotification(n._id)}
                        disabled={actionLoading === `delete_notification_${n._id}`}
                        style={{ 
                          background: "rgba(231,76,60,0.1)", border: "1px solid rgba(231,76,60,0.3)", 
                          color: "#e74c3c", padding: "4px 8px", borderRadius: 6, fontSize: 11, cursor: "pointer",
                          fontWeight: 600
                        }}
                      >
                        {actionLoading === `delete_notification_${n._id}` ? "..." : "Delete"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 18, padding: "24px", textAlign: "center", color: "rgba(255,255,255,0.4)" }}>
                <p>No notifications found.</p>
              </div>
            )}
          </div>
        )}
        {(page === "donations" || page === "settings") && (
          <div>
            <h2 style={{ color: "white", fontSize: 26, margin: "0 0 20px" }}>
              {page === "donations" ? "📦 All Donations" : "⚙️ Settings"}
            </h2>
            {page === "donations" ? (
              loading ? (
                <div style={{ textAlign: "center", padding: "40px", color: "rgba(255,255,255,0.7)" }}>Loading donations...</div>
              ) : (
                <>
                  {/* Food Donations */}
                  <h3 style={{ color: COLORS.mint, marginBottom: 16 }}>🍱 Food Donations</h3>
                  {donations.length > 0 ? (
                    <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 18, overflow: "hidden", marginBottom: 32 }}>
                      <div style={{ display: "grid", gridTemplateColumns: "20% 15% 10% 10% 15% 15% 15%", gap: 0, padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)", fontSize: 11, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 600, textAlign: "left" }}>
                        <span>Food Item</span><span>Donor</span><span>Qty</span><span>Status</span><span>Posted</span><span>Admin Status</span><span>View</span>
                      </div>
                      {donations.map((d, i) => (
                        <div key={d._id || i} style={{ display: "grid", gridTemplateColumns: "20% 15% 10% 10% 15% 15% 15%", gap: 0, padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)", alignItems: "center", textAlign: "left" }}>
                          <span style={{ fontSize: 14, fontWeight: 600, color: "white", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>{d.foodName}</span>
                          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", paddingRight: 10 }}>{d.donor?.name || "Unknown"}</span>
                          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>
                            <div>O: {d.originalQuantity || d.quantity}</div>
                            <div style={{color: COLORS.mint, fontWeight: 600}}>R: {d.quantity}</div>
                          </span>
                          <span style={{ fontSize: 12, color: d.status === "pending" ? COLORS.amber : COLORS.mint, fontWeight: 600, textTransform: "capitalize" }}>● {d.status}</span>
                          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>{new Date(d.createdAt).toLocaleDateString()}</span>
                          <span style={{ fontSize: 12, color: d.adminStatus === "approved" ? COLORS.mint : d.adminStatus === "rejected" ? "#e74c3c" : COLORS.amber, fontWeight: 600, textTransform: "capitalize" }}>● {d.adminStatus || "pending"}</span>
                          <div style={{ display: "flex", gap: 4 }}>
                            <button
                              onClick={() => setSelectedDonation(d)}
                              style={{ background: "rgba(126, 200, 160, 0.1)", border: "1px solid rgba(126, 200, 160, 0.3)", color: COLORS.mint, padding: "4px 10px", borderRadius: 6, fontSize: 11, cursor: "pointer" }}
                            >
                              View
                            </button>
                            <button
                              onClick={() => handleDeleteDonation(d._id)}
                              disabled={actionLoading === d._id}
                              style={{ background: "rgba(231,76,60,0.1)", border: "1px solid rgba(231,76,60,0.3)", color: "#e74c3c", padding: "4px 10px", borderRadius: 6, fontSize: 11, cursor: "pointer" }}
                            >
                              {actionLoading === d._id ? "..." : "Delete"}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 18, padding: "24px", textAlign: "center", color: "rgba(255,255,255,0.4)", marginBottom: 32 }}>
                      <p>No food donations found.</p>
                    </div>
                  )}

                  {/* Fund Donations */}
                  <h3 style={{ color: COLORS.amber, marginBottom: 16 }}>💰 Fund Donations</h3>
                  {moneyDonations.length > 0 ? (
                    <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 18, overflow: "hidden" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "18% 24% 12% 12% 12% 12% 10%", gap: 0, padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)", fontSize: 11, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 600, textAlign: "left" }}>
                        <span>Donor</span><span>NGO Requested</span><span>Amount</span><span>Method</span><span>Status</span><span>Date</span><span>View</span>
                      </div>
                      {moneyDonations.map((md, i) => (
                        <div key={md._id || i} style={{ display: "grid", gridTemplateColumns: "18% 24% 12% 12% 12% 12% 10%", gap: 0, padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)", alignItems: "center", textAlign: "left" }}>
                          <span 
                            style={{ fontSize: 14, fontWeight: 600, color: COLORS.amber, textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", cursor: "pointer" }}
                            onClick={() => setSelectedDonor(md.donorId)}
                          >
                            {md.donorId?.name || "Unknown"}
                          </span>
                          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", paddingRight: 10 }}>{md.moneyRequestId?.ngoId?.name || "Unknown NGO"}</span>
                          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>LKR {md.amount}</span>
                          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", textTransform: "capitalize" }}>{METHOD_LABELS[md.donationMethod] || md.donationMethod || "online"}{md.isRecurring ? " 🔁" : ""}</span>
                          <span style={{ fontSize: 12, color: md.paymentStatus === "success" ? COLORS.mint : COLORS.amber, fontWeight: 600, textTransform: "capitalize" }}>● {md.paymentStatus}</span>
                          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>{new Date(md.createdAt).toLocaleDateString()}</span>
                          <div style={{ display: "flex", gap: 4 }}>
                            <button
                              onClick={() => setSelectedMoneyDonation(md)}
                              style={{ background: "rgba(232, 146, 58, 0.1)", border: "1px solid rgba(232, 146, 58, 0.3)", color: COLORS.amber, padding: "4px 10px", borderRadius: 6, fontSize: 11, cursor: "pointer" }}
                            >
                              View
                            </button>
                            <button
                              onClick={() => handleDeleteMoneyDonation(md._id)}
                              disabled={actionLoading === md._id}
                              style={{ background: "rgba(231,76,60,0.1)", border: "1px solid rgba(231,76,60,0.3)", color: "#e74c3c", padding: "4px 10px", borderRadius: 6, fontSize: 11, cursor: "pointer" }}
                            >
                              {actionLoading === md._id ? "..." : "Delete"}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 18, padding: "24px", textAlign: "center", color: "rgba(255,255,255,0.4)" }}>
                      <p>No fund donations found.</p>
                    </div>
                  )}
                </>
              )
            ) : (
              <AdminSettings user={user} token={localStorage.getItem("token")} setUser={setUser} />
            )}
          </div>
        )}
      </div>

      {/* Food Donation Details Popup */}
      {selectedDonation && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }} onClick={() => setSelectedDonation(null)}>
          <div style={{ background: "linear-gradient(160deg, #1a3a2a, #152a20)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 20, padding: 32, width: "100%", maxWidth: 700, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 24px 80px rgba(0,0,0,0.6)" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h3 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "white" }}>🍱 Food Donation Details</h3>
              <button onClick={() => setSelectedDonation(null)} style={{ background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 8, color: "white", width: 32, height: 32, cursor: "pointer", fontSize: 16 }}>✕</button>
            </div>

            {/* Food Image */}
            <div style={{ marginBottom: 20 }}>
              {selectedDonation.image ? (
                <img src={selectedDonation.image} alt={selectedDonation.foodName} style={{ width: "100%", height: 200, objectFit: "cover", borderRadius: 12, cursor: "pointer" }} onClick={() => window.open(selectedDonation.image, '_blank')} />
              ) : (
                <div style={{ width: "100%", height: 200, borderRadius: 12, background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48 }}>🍱</div>
              )}
            </div>

            {/* Food Information */}
            <div style={{ marginBottom: 20 }}>
              <h4 style={{ margin: "0 0 16px", fontSize: 16, color: COLORS.mint, display: "flex", alignItems: "center", gap: 8 }}><span>🍽️</span> Food Information</h4>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
                <div style={{ background: "rgba(255,255,255,0.03)", padding: "12px 16px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>🏷️ Food Item</div>
                  <div style={{ color: "white", fontWeight: 600, fontSize: 14 }}>{selectedDonation.foodName}</div>
                </div>
                <div style={{ background: "rgba(255,255,255,0.03)", padding: "12px 16px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.05)", gridColumn: "span 2" }}>
                  <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>⚖️ Quantity Breakdown</div>
                  <div style={{ display: "flex", gap: "16px", marginTop: "8px" }}>
                    <div>
                      <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 10 }}>Original</div>
                      <div style={{ color: "white", fontWeight: 600, fontSize: 13 }}>{selectedDonation.originalQuantity || selectedDonation.quantity} {selectedDonation.unit}</div>
                    </div>
                    <div>
                      <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 10 }}>Claimed</div>
                      <div style={{ color: "white", fontWeight: 600, fontSize: 13 }}>{(selectedDonation.originalQuantity || selectedDonation.quantity) - selectedDonation.quantity} {selectedDonation.unit}</div>
                    </div>
                    <div>
                      <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 10 }}>Remaining</div>
                      <div style={{ color: COLORS.mint, fontWeight: 600, fontSize: 13 }}>{selectedDonation.quantity} {selectedDonation.unit}</div>
                    </div>
                  </div>
                </div>
                <div style={{ background: "rgba(255,255,255,0.03)", padding: "12px 16px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>🥗 Food Type</div>
                  <div style={{ color: "white", fontWeight: 600, fontSize: 14, textTransform: "capitalize" }}>{selectedDonation.foodType || "N/A"}</div>
                </div>
                <div style={{ background: "rgba(255,255,255,0.03)", padding: "12px 16px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>👥 People Served</div>
                  <div style={{ color: "white", fontWeight: 600, fontSize: 14 }}>{selectedDonation.peopleServed || "N/A"}</div>
                </div>
                <div style={{ gridColumn: "1 / -1", background: "rgba(255,255,255,0.03)", padding: "12px 16px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>📝 Description</div>
                  <div style={{ color: "white", fontSize: 14, lineHeight: 1.5 }}>{selectedDonation.description || "N/A"}</div>
                </div>
                <div style={{ gridColumn: "1 / -1", background: "rgba(255,255,255,0.03)", padding: "12px 16px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>📍 Location</div>
                  <div style={{ color: "white", fontSize: 14, lineHeight: 1.5 }}>{selectedDonation.location?.address || "N/A"}</div>
                </div>
                <div style={{ background: "rgba(255,255,255,0.03)", padding: "12px 16px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>🔄 Status</div>
                  <div style={{ color: selectedDonation.status === "pending" ? COLORS.amber : COLORS.mint, fontWeight: 600, fontSize: 14, textTransform: "capitalize" }}>{selectedDonation.status}</div>
                </div>
                <div style={{ background: "rgba(255,255,255,0.03)", padding: "12px 16px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>🛡️ Admin Status</div>
                  <div style={{ color: selectedDonation.adminStatus === "approved" ? COLORS.mint : selectedDonation.adminStatus === "rejected" ? "#e74c3c" : COLORS.amber, fontWeight: 600, fontSize: 14, textTransform: "capitalize" }}>{selectedDonation.adminStatus || "pending"}</div>
                </div>
                <div style={{ background: "rgba(255,255,255,0.03)", padding: "12px 16px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>🕒 Posted At</div>
                  <div style={{ color: "white", fontSize: 14 }}>{new Date(selectedDonation.createdAt).toLocaleString()}</div>
                </div>
                <div style={{ background: "rgba(255,255,255,0.03)", padding: "12px 16px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>⏳ Expiry</div>
                  <div style={{ color: "white", fontSize: 14 }}>{new Date(selectedDonation.expiryTime).toLocaleString()}</div>
                </div>
                {selectedDonation.pickupTime && (
                  <div style={{ background: "rgba(255,255,255,0.03)", padding: "12px 16px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.05)" }}>
                    <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>⏰ Pickup Time</div>
                    <div style={{ color: "white", fontSize: 14 }}>{new Date(selectedDonation.pickupTime).toLocaleString()}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Other Donors of this food */}
            {donations.filter(d => d.foodName.toLowerCase() === selectedDonation.foodName.toLowerCase() && d.donor?._id !== selectedDonation.donor?._id).length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <h4 style={{ margin: "0 0 12px", fontSize: 14, color: "#7b68ee", textTransform: "uppercase", letterSpacing: "1px", display: "flex", alignItems: "center", gap: 8 }}><span>🤝</span> Others who donated "{selectedDonation.foodName}"</h4>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, background: "rgba(123,104,238,0.03)", padding: 16, borderRadius: 16, border: "1px dashed rgba(123,104,238,0.2)" }}>
                  {Array.from(new Set(donations.filter(d => d.foodName.toLowerCase() === selectedDonation.foodName.toLowerCase() && d.donor?._id !== selectedDonation.donor?._id).map(d => d.donor?.name))).filter(Boolean).map((donorName, i) => (
                    <span key={i} style={{ background: "rgba(123,104,238,0.1)", border: "1px solid rgba(123,104,238,0.3)", color: "#a596fc", padding: "6px 14px", borderRadius: 20, fontSize: 13, fontWeight: 500 }}>{donorName}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Donor Information */}
            <div style={{ marginBottom: 24 }}>
              <h4 style={{ margin: "0 0 16px", fontSize: 16, color: COLORS.amber, display: "flex", alignItems: "center", gap: 8 }}><span>👤</span> Donor Profile</h4>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
                <div style={{ background: "rgba(255,255,255,0.03)", padding: "12px 16px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>Name</div>
                  <div style={{ color: "white", fontWeight: 600, fontSize: 14 }}>{selectedDonation.donor?.name || "Unknown"}</div>
                </div>
                <div style={{ background: "rgba(255,255,255,0.03)", padding: "12px 16px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>Email</div>
                  <div style={{ color: "white", fontSize: 14 }}>{selectedDonation.donor?.email || "N/A"}</div>
                </div>
                <div style={{ background: "rgba(255,255,255,0.03)", padding: "12px 16px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>Phone</div>
                  <div style={{ color: "white", fontSize: 14 }}>{selectedDonation.donor?.phone || "N/A"}</div>
                </div>
                <div style={{ background: "rgba(255,255,255,0.03)", padding: "12px 16px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>Organization</div>
                  <div style={{ color: "white", fontSize: 14 }}>{selectedDonation.donor?.organization || "N/A"}</div>
                </div>
              </div>
            </div>

            {/* Donor's Donation History */}
            <div style={{ marginBottom: 24, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 16, padding: 24 }}>
              <h4 style={{ margin: "0 0 20px", fontSize: 16, color: COLORS.mint, display: "flex", alignItems: "center", gap: 8 }}><span>📈</span> Donation History (This Donor)</h4>
              
              <div style={{ marginBottom: 24 }}>
                <h5 style={{ margin: "0 0 12px", fontSize: 14, color: "rgba(255,255,255,0.8)", display: "flex", alignItems: "center", gap: 6 }}><span>🍱</span> Food Donations</h5>
                {donations.filter(d => d.donor?._id === selectedDonation.donor?._id).length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {donations.filter(d => d.donor?._id === selectedDonation.donor?._id).map((d, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", background: "rgba(255,255,255,0.04)", borderRadius: 12, transition: "transform 0.2s ease, background 0.2s ease", cursor: "default" }}>
                        <div>
                          <div style={{ color: "white", fontWeight: 600, fontSize: 15, marginBottom: 2 }}>{d.foodName}</div>
                          <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>{d.quantity} {d.unit}</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ color: d.status === "pending" ? COLORS.amber : COLORS.mint, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 2 }}>{d.status}</div>
                          <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>{new Date(d.createdAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, fontStyle: "italic" }}>No other food donations.</div>
                )}
              </div>

              <div>
                <h5 style={{ margin: "0 0 12px", fontSize: 14, color: "rgba(255,255,255,0.8)", display: "flex", alignItems: "center", gap: 6 }}><span>💰</span> Fund Donations</h5>
                {moneyDonations.filter(md => md.donorId?._id === selectedDonation.donor?._id).length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {moneyDonations.filter(md => md.donorId?._id === selectedDonation.donor?._id).map((md, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", background: "rgba(255,255,255,0.04)", borderRadius: 12 }}>
                        <div>
                          <div style={{ color: "white", fontWeight: 600, fontSize: 15, marginBottom: 2 }}>LKR {md.amount}</div>
                          <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>{md.moneyRequestId?.ngoId?.name || "General Fund"}</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ color: md.paymentStatus === "success" ? COLORS.mint : COLORS.amber, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 2 }}>{md.paymentStatus}</div>
                          <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>{new Date(md.createdAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, fontStyle: "italic" }}>No fund donations found.</div>
                )}
              </div>
            </div>

            {/* Ratings & Feedback */}
            <div>
              <h4 style={{ margin: "0 0 16px", fontSize: 16, color: COLORS.amberLight, display: "flex", alignItems: "center", gap: 8 }}><span>⭐</span> Ratings & Feedback (from NGOs)</h4>
              {feedbacks.filter(f => f.donorId?._id === selectedDonation.donor?._id).length > 0 ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
                  {feedbacks.filter(f => f.donorId?._id === selectedDonation.donor?._id).map((f, i) => (
                    <div key={i} style={{ padding: 18, background: "linear-gradient(145deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                        <div style={{ color: "white", fontWeight: 600, fontSize: 14 }}>{f.ngoId?.name || "Unknown NGO"}</div>
                        <div style={{ color: COLORS.amberLight, fontSize: 14, letterSpacing: "2px" }}>{"★".repeat(f.rating || 5)}{"☆".repeat(5 - (f.rating || 5))}</div>
                      </div>
                      <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, lineHeight: 1.5, fontStyle: "italic" }}>"{f.comment}"</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ background: "rgba(255,255,255,0.02)", padding: 20, borderRadius: 12, textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: 14 }}>No ratings or feedback received yet.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Fund Donor Profile Popup */}
      {selectedDonor && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }} onClick={() => setSelectedDonor(null)}>
          <div style={{ background: "linear-gradient(160deg, #1a3a2a, #152a20)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 20, padding: 32, width: "100%", maxWidth: 700, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 24px 80px rgba(0,0,0,0.6)" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h3 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "white" }}>💰 Donor Profile</h3>
              <button onClick={() => setSelectedDonor(null)} style={{ background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 8, color: "white", width: 32, height: 32, cursor: "pointer", fontSize: 16 }}>✕</button>
            </div>

            {/* Personal Information */}
            <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 14, padding: 20, marginBottom: 20 }}>
              <h4 style={{ margin: "0 0 12px", fontSize: 14, color: COLORS.amber, textTransform: "uppercase", letterSpacing: "1px" }}>Personal Information</h4>
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10 }}>
                <div style={{ background: "rgba(255,255,255,0.03)", padding: "12px 14px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.05)" }}><div style={{ color: "rgba(255,255,255,0.55)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>Name</div><div style={{ color: "white", fontWeight: 600 }}>{selectedDonor.name || "Unknown"}</div></div>
                <div style={{ background: "rgba(255,255,255,0.03)", padding: "12px 14px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.05)" }}><div style={{ color: "rgba(255,255,255,0.55)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>Email</div><div style={{ color: "white" }}>{selectedDonor.email || "N/A"}</div></div>
                <div style={{ background: "rgba(255,255,255,0.03)", padding: "12px 14px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.05)" }}><div style={{ color: "rgba(255,255,255,0.55)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>Phone</div><div style={{ color: "white" }}>{selectedDonor.phone || "N/A"}</div></div>
                <div style={{ background: "rgba(255,255,255,0.03)", padding: "12px 14px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.05)" }}><div style={{ color: "rgba(255,255,255,0.55)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>Organization</div><div style={{ color: "white" }}>{selectedDonor.organization || "N/A"}</div></div>
              </div>
            </div>

            {/* Donation Statistics */}
            <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 14, padding: 20, marginBottom: 20 }}>
              <h4 style={{ margin: "0 0 12px", fontSize: 14, color: COLORS.mint, textTransform: "uppercase", letterSpacing: "1px" }}>Donation Statistics</h4>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
                <div style={{ textAlign: "center", padding: 12, background: "rgba(255,255,255,0.03)", borderRadius: 8 }}>
                  <div style={{ fontSize: 24, fontWeight: 700, color: COLORS.amber }}>{moneyDonations.filter(md => md.donorId?._id === selectedDonor._id).length}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>Total Donations</div>
                </div>
                <div style={{ textAlign: "center", padding: 12, background: "rgba(255,255,255,0.03)", borderRadius: 8 }}>
                  <div style={{ fontSize: 24, fontWeight: 700, color: COLORS.mint }}>LKR {moneyDonations.filter(md => md.donorId?._id === selectedDonor._id).reduce((sum, md) => sum + (md.amount || 0), 0).toLocaleString()}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>Total Amount</div>
                </div>
                <div style={{ textAlign: "center", padding: 12, background: "rgba(255,255,255,0.03)", borderRadius: 8 }}>
                  <div style={{ fontSize: 24, fontWeight: 700, color: "#7b68ee" }}>{moneyDonations.filter(md => md.donorId?._id === selectedDonor._id).length > 0 ? Math.round(moneyDonations.filter(md => md.donorId?._id === selectedDonor._id).reduce((sum, md) => sum + (md.amount || 0), 0) / moneyDonations.filter(md => md.donorId?._id === selectedDonor._id).length) : 0}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>Avg Donation</div>
                </div>
              </div>
            </div>

            {/* Donation History */}
            <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 14, padding: 20, marginBottom: 20 }}>
              <h4 style={{ margin: "0 0 12px", fontSize: 14, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: "1px" }}>Recent Donations</h4>
              {moneyDonations.filter(md => md.donorId?._id === selectedDonor._id).length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {moneyDonations.filter(md => md.donorId?._id === selectedDonor._id).slice(0, 5).map((md, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: 10, background: "rgba(255,255,255,0.03)", borderRadius: 8 }}>
                      <div>
                        <div style={{ color: "white", fontWeight: 600 }}>LKR {md.amount}</div>
                        <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 11 }}>{md.moneyRequestId?.ngoId?.name || "General Fund"}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ color: md.paymentStatus === "success" ? COLORS.mint : COLORS.amber, fontSize: 11, fontWeight: 600 }}>{md.paymentStatus}</div>
                        <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 11 }}>{new Date(md.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }}>No supported NGOs found.</div>
              )}
            </div>

            <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 14, padding: 20, marginBottom: 20 }}>
              <h4 style={{ margin: "0 0 12px", fontSize: 14, color: COLORS.amberLight, textTransform: "uppercase", letterSpacing: "1px" }}>Supported NGOs</h4>
              {moneyDonations.filter(md => md.donorId?._id === selectedDonor._id).length > 0 ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {Array.from(new Set(moneyDonations.filter(md => md.donorId?._id === selectedDonor._id).map(md => md.moneyRequestId?.ngoId?.name))).filter(Boolean).map((ngoName, i) => (
                    <span key={i} style={{ background: "rgba(232,146,58,0.1)", border: "1px solid rgba(232,146,58,0.3)", color: COLORS.amber, padding: "6px 12px", borderRadius: 20, fontSize: 12 }}>{ngoName}</span>
                  ))}
                </div>
              ) : (
                <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }}>No supported NGOs yet.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Money Donation Details Popup */}
      {selectedMoneyDonation && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }} onClick={() => setSelectedMoneyDonation(null)}>
          <div style={{ background: "linear-gradient(160deg, #1a3a2a, #152a20)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 20, padding: 32, width: "100%", maxWidth: 600, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 24px 80px rgba(0,0,0,0.6)" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h3 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "white" }}>💰 Fund Donation Details</h3>
              <button onClick={() => setSelectedMoneyDonation(null)} style={{ background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 8, color: "white", width: 32, height: 32, cursor: "pointer", fontSize: 16 }}>✕</button>
            </div>

            {/* Donation Information */}
            <div style={{ marginBottom: 24 }}>
              <h4 style={{ margin: "0 0 16px", fontSize: 16, color: COLORS.amber, display: "flex", alignItems: "center", gap: 8 }}><span>💳</span> Donation Information</h4>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
                <div style={{ background: "rgba(255,255,255,0.03)", padding: "12px 16px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>Amount</div>
                  <div style={{ color: "white", fontWeight: 600, fontSize: 14 }}>LKR {selectedMoneyDonation.amount}</div>
                </div>
                <div style={{ background: "rgba(255,255,255,0.03)", padding: "12px 16px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>Method</div>
                  <div style={{ color: "white", fontSize: 14 }}>{METHOD_LABELS[selectedMoneyDonation.donationMethod] || selectedMoneyDonation.donationMethod || "online"}</div>
                </div>
                <div style={{ background: "rgba(255,255,255,0.03)", padding: "12px 16px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>Status</div>
                  <div style={{ color: selectedMoneyDonation.paymentStatus === "success" ? COLORS.mint : COLORS.amber, fontWeight: 600, fontSize: 14 }}>{selectedMoneyDonation.paymentStatus}</div>
                </div>
                <div style={{ background: "rgba(255,255,255,0.03)", padding: "12px 16px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>Date</div>
                  <div style={{ color: "white", fontSize: 14 }}>{new Date(selectedMoneyDonation.createdAt).toLocaleString()}</div>
                </div>
                <div style={{ background: "rgba(255,255,255,0.03)", padding: "12px 16px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>Recurring</div>
                  <div style={{ color: "white", fontSize: 14 }}>{selectedMoneyDonation.isRecurring ? "Yes" : "No"}</div>
                </div>
              </div>
            </div>

            {/* Other Donors of this Request */}
            {moneyDonations.filter(md => md.moneyRequestId?._id === selectedMoneyDonation.moneyRequestId?._id && md.donorId?._id !== selectedMoneyDonation.donorId?._id).length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <h4 style={{ margin: "0 0 12px", fontSize: 14, color: "#7b68ee", textTransform: "uppercase", letterSpacing: "1px", display: "flex", alignItems: "center", gap: 8 }}><span>🤝</span> Others who donated to this request</h4>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, background: "rgba(123,104,238,0.03)", padding: 16, borderRadius: 16, border: "1px dashed rgba(123,104,238,0.2)" }}>
                  {Array.from(new Set(moneyDonations.filter(md => md.moneyRequestId?._id === selectedMoneyDonation.moneyRequestId?._id && md.donorId?._id !== selectedMoneyDonation.donorId?._id).map(md => md.donorId?.name))).filter(Boolean).map((donorName, i) => (
                    <span key={i} style={{ background: "rgba(123,104,238,0.1)", border: "1px solid rgba(123,104,238,0.3)", color: "#a596fc", padding: "6px 14px", borderRadius: 20, fontSize: 13, fontWeight: 500 }}>{donorName}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Donor Information */}
            <div style={{ marginBottom: 24 }}>
              <h4 style={{ margin: "0 0 16px", fontSize: 16, color: COLORS.mint, display: "flex", alignItems: "center", gap: 8 }}><span>👤</span> Donor Profile</h4>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
                <div style={{ background: "rgba(255,255,255,0.03)", padding: "12px 16px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>Name</div>
                  <div style={{ color: "white", fontWeight: 600, fontSize: 14 }}>{selectedMoneyDonation.donorId?.name || "Unknown"}</div>
                </div>
                <div style={{ background: "rgba(255,255,255,0.03)", padding: "12px 16px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>Email</div>
                  <div style={{ color: "white", fontSize: 14 }}>{selectedMoneyDonation.donorId?.email || "N/A"}</div>
                </div>
                <div style={{ background: "rgba(255,255,255,0.03)", padding: "12px 16px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>Phone</div>
                  <div style={{ color: "white", fontSize: 14 }}>{selectedMoneyDonation.donorId?.phone || "N/A"}</div>
                </div>
              </div>
            </div>

            {/* NGO Information */}
            <div style={{ marginBottom: 24 }}>
              <h4 style={{ margin: "0 0 16px", fontSize: 16, color: "#7b68ee", display: "flex", alignItems: "center", gap: 8 }}><span>🏢</span> NGO Information</h4>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
                <div style={{ background: "rgba(255,255,255,0.03)", padding: "12px 16px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>NGO Name</div>
                  <div style={{ color: "white", fontWeight: 600, fontSize: 14 }}>{selectedMoneyDonation.moneyRequestId?.ngoId?.name || "Unknown"}</div>
                </div>
                <div style={{ background: "rgba(255,255,255,0.03)", padding: "12px 16px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>Email</div>
                  <div style={{ color: "white", fontSize: 14 }}>{selectedMoneyDonation.moneyRequestId?.ngoId?.email || "N/A"}</div>
                </div>
                <div style={{ background: "rgba(255,255,255,0.03)", padding: "12px 16px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>Phone</div>
                  <div style={{ color: "white", fontSize: 14 }}>{selectedMoneyDonation.moneyRequestId?.ngoId?.phone || "N/A"}</div>
                </div>
                <div style={{ gridColumn: "1 / -1", background: "rgba(255,255,255,0.03)", padding: "12px 16px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>Request Purpose</div>
                  <div style={{ color: "white", fontSize: 14, lineHeight: 1.5 }}>{selectedMoneyDonation.moneyRequestId?.purpose || "N/A"}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NGO Profile Popup */}
      {selectedNgo && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }} onClick={() => setSelectedNgo(null)}>
          <div style={{ background: "linear-gradient(160deg, #1a3a2a, #152a20)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 20, padding: 32, width: "100%", maxWidth: 700, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 24px 80px rgba(0,0,0,0.6)" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h3 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "white" }}>🏢 NGO Profile</h3>
              <button onClick={() => setSelectedNgo(null)} style={{ background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 8, color: "white", width: 32, height: 32, cursor: "pointer", fontSize: 16 }}>✕</button>
            </div>

            {/* Personal Information */}
            <div style={{ marginBottom: 24 }}>
              <h4 style={{ margin: "0 0 16px", fontSize: 16, color: COLORS.amber, display: "flex", alignItems: "center", gap: 8 }}><span>🏢</span> Personal Information</h4>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
                <div style={{ background: "rgba(255,255,255,0.03)", padding: "12px 16px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>Name</div>
                  <div style={{ color: "white", fontWeight: 600, fontSize: 14 }}>{selectedNgo.name || "Unknown"}</div>
                </div>
                <div style={{ background: "rgba(255,255,255,0.03)", padding: "12px 16px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>Email</div>
                  <div style={{ color: "white", fontSize: 14 }}>{selectedNgo.email || "N/A"}</div>
                </div>
                <div style={{ background: "rgba(255,255,255,0.03)", padding: "12px 16px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>Phone</div>
                  <div style={{ color: "white", fontSize: 14 }}>{selectedNgo.phone || "N/A"}</div>
                </div>
                <div style={{ background: "rgba(255,255,255,0.03)", padding: "12px 16px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>Address</div>
                  <div style={{ color: "white", fontSize: 14 }}>{selectedNgo.organization || "N/A"}</div>
                </div>
              </div>
            </div>

            {/* Fund Details */}
            <div style={{ marginBottom: 24, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 16, padding: 24 }}>
              <h4 style={{ margin: "0 0 20px", fontSize: 16, color: COLORS.mint, display: "flex", alignItems: "center", gap: 8 }}><span>💰</span> Fund Requests History</h4>
              {fundRequests.filter(req => req.ngoId?._id === selectedNgo._id).length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {fundRequests.filter(req => req.ngoId?._id === selectedNgo._id).map((req, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", background: "rgba(255,255,255,0.04)", borderRadius: 12 }}>
                      <div>
                        <div style={{ color: "white", fontWeight: 600, fontSize: 15, marginBottom: 2 }}>{req.purpose}</div>
                        <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>Requested: LKR {req.amountNeeded} | Raised: LKR {req.amountRaised}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ color: req.status === "approved" ? COLORS.mint : COLORS.amber, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 2 }}>{req.status}</div>
                        <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>{new Date(req.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, fontStyle: "italic" }}>No fund requests found.</div>
              )}
            </div>

            {/* Food Picked Up Details */}
            <div style={{ marginBottom: 24, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 16, padding: 24 }}>
              <h4 style={{ margin: "0 0 20px", fontSize: 16, color: COLORS.mint, display: "flex", alignItems: "center", gap: 8 }}><span>🍱</span> Food Picked Up So Far</h4>
              {requests.filter(req => req.ngoId?._id === selectedNgo._id && (req.status === "picked_up" || req.status === "completed")).length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {requests.filter(req => req.ngoId?._id === selectedNgo._id && (req.status === "picked_up" || req.status === "completed")).map((req, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", background: "rgba(255,255,255,0.04)", borderRadius: 12 }}>
                      <div>
                        <div style={{ color: "white", fontWeight: 600, fontSize: 15, marginBottom: 2 }}>{req.foodId?.foodName || "Unknown Food"}</div>
                        <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>{req.foodId?.quantity} {req.foodId?.unit}</div>
                      </div>
                      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ color: COLORS.mint, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 2 }}>{req.status.replace('_', ' ')}</div>
                          <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>{new Date(req.updatedAt).toLocaleDateString()}</div>
                        </div>
                        <button
                          onClick={() => handleDeleteRequest(req._id)}
                          disabled={actionLoading === req._id}
                          style={{ background: "rgba(231,76,60,0.1)", border: "1px solid rgba(231,76,60,0.3)", color: "#e74c3c", padding: "4px 10px", borderRadius: 6, fontSize: 11, cursor: "pointer" }}
                        >
                          {actionLoading === req._id ? "..." : "Delete"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, fontStyle: "italic" }}>No food picked up yet.</div>
              )}
            </div>

            {/* Ratings & Feedback */}
            <div>
              <h4 style={{ margin: "0 0 16px", fontSize: 16, color: COLORS.amberLight, display: "flex", alignItems: "center", gap: 8 }}><span>⭐</span> Ratings & Feedback (from Donors)</h4>
              {moneyFeedbacks.filter(f => f.ngoId?._id === selectedNgo._id).length > 0 ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
                  {moneyFeedbacks.filter(f => f.ngoId?._id === selectedNgo._id).map((f, i) => (
                    <div key={i} style={{ padding: 18, background: "linear-gradient(145deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                        <div style={{ color: "white", fontWeight: 600, fontSize: 14 }}>{f.donorId?.name || "Unknown Donor"}</div>
                        <div style={{ color: COLORS.amberLight, fontSize: 14, letterSpacing: "2px" }}>{"★".repeat(f.rating || 5)}{"☆".repeat(5 - (f.rating || 5))}</div>
                      </div>
                      <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, lineHeight: 1.5, fontStyle: "italic" }}>"{f.comment}"</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ background: "rgba(255,255,255,0.02)", padding: 20, borderRadius: 12, textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: 14 }}>No ratings or feedback received yet.</div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Document Viewer Modal */}
      {viewDocUrl && createPortal(
        <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999999, padding: 20, boxSizing: "border-box" }} onClick={() => setViewDocUrl(null)}>
          <div style={{ background: isLight ? "#fff" : "#1a3a2a", padding: 16, borderRadius: 12, width: "100%", maxWidth: 1000, height: "90vh", display: "flex", flexDirection: "column", boxShadow: "0 25px 60px rgba(0,0,0,0.5)" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h3 style={{ color: isLight ? "#111" : "white", margin: 0, fontSize: 18 }}>Document Viewer</h3>
              <button onClick={() => setViewDocUrl(null)} style={{ background: "transparent", border: "none", color: isLight ? "#111" : "white", fontSize: 24, cursor: "pointer", padding: 0 }}>✕</button>
            </div>
            <div style={{ flex: 1, overflow: "auto", display: "flex", justifyContent: "center", alignItems: "center", background: isLight ? "#f1f1f1" : "rgba(0,0,0,0.3)", borderRadius: 8 }}>
              {viewDocUrl.toLowerCase().endsWith(".pdf") ? (
                <iframe src={viewDocUrl} style={{ width: "100%", height: "100%", border: "none" }} title="Document" />
              ) : (
                <img src={viewDocUrl} alt="Document" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
              )}
            </div>
            <div style={{ marginTop: 12, textAlign: "center" }}>
              <a href={viewDocUrl} target="_blank" rel="noreferrer" style={{ color: COLORS.mint, textDecoration: "none", fontWeight: 600, fontSize: 14 }}>Open Original File ↗</a>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}



