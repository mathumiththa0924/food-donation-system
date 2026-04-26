import React, { useState } from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import StatCard from "../components/StatCard";
import Input from "../components/Input";
import Btn from "../components/Btn";
import { getDonations } from "../api/donation";
import { createRequest, getRequests, updateRequest } from "../api/request";

export default function NgoDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  })();
  const [page, setPage] = useState("ngoHome");
  const [claimed, setClaimed] = useState([]);
  const [available, setAvailable] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const onLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const [donationsRes, requestsRes] = await Promise.all([getDonations(), getRequests()]);
      setAvailable(donationsRes.data || []);
      setClaimed(requestsRes.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRequest = async (foodItem) => {
    try {
      setError("");
      setSuccess("");
      await createRequest({
        foodId: foodItem._id,
      });
      setSuccess(`Request sent for "${foodItem.foodName}"`);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Request failed");
    }
  };

  const handleStatus = async (requestId, status) => {
    try {
      setError("");
      setSuccess("");
      await updateRequest(requestId, { status });
      setSuccess(`Request moved to ${status}`);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Status update failed");
    }
  };

  function BrowsePage() {
    const filtered = available.filter(
      (a) =>
        a.foodName.toLowerCase().includes(search.toLowerCase()) || search === ""
    );

    return (
      <div>
        <h2 style={{ color: "white" }}>🔍 Browse Food</h2>

        <Input
          placeholder="Search food..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {filtered.map((item) => (
            <div
              key={item._id}
              style={{
                background: "rgba(255,255,255,0.06)",
                padding: 20,
                borderRadius: 16,
              }}
            >
              <h3 style={{ color: "white" }}>{item.foodName}</h3>
              <p style={{ color: "gray" }}>{item.donor?.name || "Donor"}</p>

              <p style={{ color: "gray" }}>
                Qty: {item.quantity} • {item.location}
              </p>

              <Btn onClick={() => handleRequest(item)} disabled={loading}>
                Request Food
              </Btn>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function NgoHome() {
    return (
      <div>
        <h2 style={{ color: "white" }}>
          {greeting}, {user?.name || "NGO"} 🌿
        </h2>

        <div style={{ display: "flex", gap: 16 }}>
          <StatCard icon="🍱" label="Available" value={available.length} />
          <StatCard icon="📋" label="Requests" value={claimed.length} />
        </div>

        <Btn onClick={() => setPage("browse")} style={{ marginTop: 20 }}>
          Browse Food →
        </Btn>
      </div>
    );
  }

  function MyRequests() {
    return (
      <div>
        <h2 style={{ color: "white" }}>📋 My Requests</h2>

        {claimed.length === 0 ? (
          <p style={{ color: "gray" }}>No requests yet</p>
        ) : (
          claimed.map((item) => (
            <div
              key={item._id}
              style={{
                background: "rgba(255,255,255,0.05)",
                padding: 16,
                marginBottom: 10,
                borderRadius: 12,
              }}
            >
              <h4 style={{ color: "white" }}>{item.foodId?.foodName || "Food item"}</h4>
              <p style={{ color: "gray" }}>Status: {item.status}</p>
              {item.status === "Pending" ? (
                <Btn onClick={() => handleStatus(item._id, "Picked")}>Mark Picked</Btn>
              ) : null}
              {item.status === "Picked" ? (
                <Btn onClick={() => handleStatus(item._id, "Delivered")}>Mark Delivered</Btn>
              ) : null}
            </div>
          ))
        )}
      </div>
    );
  }

  const pages = {
    ngoHome: <NgoHome />,
    browse: <BrowsePage />,
    myRequests: <MyRequests />,
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar
        role="ngo"
        activePage={page}
        onNav={setPage}
        onLogout={onLogout}
        user={user}
      />

      <div style={{ flex: 1, padding: 30 }}>
        {loading ? <p style={{ color: "white" }}>Loading...</p> : null}
        {error ? <p style={{ color: "#ffb3b3" }}>{error}</p> : null}
        {success ? <p style={{ color: "#b8f2b8" }}>{success}</p> : null}
        {pages[page]}
      </div>
    </div>
  );
}