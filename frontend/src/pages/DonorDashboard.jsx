import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Input from "../components/Input";
import Btn from "../components/Btn";
import StatCard from "../components/StatCard";
import { createDonation, getDonations } from "../api/donation";

export default function DonorDashboard() {
  const navigate = useNavigate();
  const [page, setPage] = useState("donorHome");
  const [foodName, setFoodName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [location, setLocation] = useState("");
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const user = useMemo(() => JSON.parse(localStorage.getItem("user") || "null"), []);

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  })();

  const onLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const loadDonations = async () => {
    try {
      setFetching(true);
      const response = await getDonations();
      const all = response.data || [];
      const mine = all.filter((d) => d?.donor?._id === user?._id);
      setDonations(mine);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch donations");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    loadDonations();
  }, []);

  const handleCreateDonation = async () => {
    if (!foodName || !quantity || !location) {
      setError("food name, quantity and location are required.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");
      await createDonation({
        foodName,
        quantity: Number(quantity),
        location,
      });
      setFoodName("");
      setQuantity("");
      setLocation("");
      setSuccess("Donation posted successfully.");
      await loadDonations();
      setPage("myDonations");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create donation");
    } finally {
      setLoading(false);
    }
  };

  const totalQuantity = donations.reduce((sum, d) => sum + (Number(d.quantity) || 0), 0);

  const renderContent = () => {
    if (page === "donate") {
      return (
        <div>
          <h2 style={{ color: "white" }}>Create Donation</h2>
          <Input label="Food Name" value={foodName} onChange={(e) => setFoodName(e.target.value)} />
          <Input label="Quantity" type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
          <Input label="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
          <Btn onClick={handleCreateDonation}>{loading ? "Posting..." : "Post Donation"}</Btn>
        </div>
      );
    }

    if (page === "myDonations") {
      return (
        <div>
          <h2 style={{ color: "white" }}>My Donations</h2>
          {fetching ? <p style={{ color: "white" }}>Loading donations...</p> : null}
          {!fetching && donations.length === 0 ? <p style={{ color: "white" }}>No donations yet.</p> : null}
          {donations.map((item) => (
            <div
              key={item._id}
              style={{
                background: "rgba(255,255,255,0.06)",
                borderRadius: 12,
                padding: 14,
                marginBottom: 10,
                color: "white",
              }}
            >
              <strong>{item.foodName}</strong> - {item.quantity} - {item.location} - {item.status}
            </div>
          ))}
        </div>
      );
    }

    return (
      <div>
        <h2 style={{ color: "white" }}>
          {greeting}, {user?.name || "Donor"}!
        </h2>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <StatCard icon="📦" label="My Donations" value={donations.length} />
          <StatCard icon="⚖️" label="Total Quantity" value={totalQuantity} />
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar role="donor" activePage={page} onNav={setPage} onLogout={onLogout} user={user} />
      <div style={{ flex: 1, padding: 28 }}>
        {error ? <p style={{ color: "#ffb3b3" }}>{error}</p> : null}
        {success ? <p style={{ color: "#b8f2b8" }}>{success}</p> : null}
        {renderContent()}
      </div>
    </div>
  );
}