import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import StatCard from "../components/StatCard";
import RatingStars from "../components/RatingStars";
import LocationSelector from "../components/LocationSelector";
import { createDonation, getMyDonations, getMyStats, deleteDonation } from "../api/donation";
import { getNotifications, markNotificationsAsRead } from "../api/notification";
import { getRequests, updateRequest } from "../api/request";
import { getDonorRatingStats, getMySubmittedFeedbacks, getMyReceivedFeedbacks, getMyPendingFeedbacks } from "../api/feedback";
import { getMoneyRequests } from "../api/moneyRequest";
import { addMoneyDonationFeedback } from "../api/moneyDonation";
import DonationCheckoutModal from "../components/DonationCheckoutModal";
import { COLORS } from "../theme";
import toast from "react-hot-toast";
import ChatWidget from "../components/ChatWidget";
import Leaderboard from "../components/Leaderboard";
import io from "socket.io-client";

const FOOD_CATEGORIES = ["Cooked Food", "Raw Vegetables", "Grains & Rice", "Dairy", "Fruits", "Bakery", "Other"];

function DonorHome({ setActive, user, stats, recentDonations, ratingStats, theme }) {
  const isLight = theme === "light";
  const textColor = isLight ? "#111" : "white";
  const mutedColor = isLight ? "rgba(15,23,42,0.65)" : "rgba(255,255,255,0.65)";
  const cardBorder = isLight ? "1px solid rgba(148,163,184,0.25)" : "1px solid rgba(255,255,255,0.15)";
  const pageBg = isLight ? "rgba(248,250,252,0.75)" : "transparent";
  const panelText = isLight ? "#0f172a" : "white";
  const panelSubText = isLight ? "rgba(15,23,42,0.6)" : "rgba(255,255,255,0.55)";
  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  })();

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center", background: pageBg, padding: isLight ? "28px 20px 0" : 0, borderRadius: isLight ? 24 : 0 }}>
      <h2 style={{ color: textColor, fontSize: 28, fontWeight: 700, marginBottom: 8 }}>{greeting}, {user?.name || "Donor"}! 👋</h2>
      <p style={{ color: mutedColor, fontSize: 16, marginBottom: 32 }}>Your generosity is making a difference every day.</p>

      <div style={{ display: "flex", gap: 16, marginBottom: 36, flexWrap: "wrap", justifyContent: "center", textAlign: "left" }}>
        <StatCard icon="🏆" label="My Badge" value={user?.badge || "Newcomer"} sub={`${user?.points || 0} Points`} />
        <StatCard icon="🍱" label="Total Donated" value={stats.totalDonated || 0} sub="donations posted" />
        <StatCard icon="👥" label="People Helped" value={stats.peopleHelped || 0} sub="people fed" />
        <StatCard icon="✅" label="Completed" value={stats.completed || 0} sub="fully collected" />
      </div>

      {ratingStats && ratingStats.donor && (
        <div style={{
          background: isLight ? "#fff" : `linear-gradient(135deg, ${COLORS.amber}15, ${COLORS.orange}15)`,
          border: cardBorder,
          borderRadius: 16,
          padding: 20,
          marginBottom: 36,
          textAlign: "left",
        }}>
          <h3 style={{ color: panelText, fontSize: 18, fontWeight: 700, marginBottom: 12 }}>⭐ Your Rating</h3>
          <div style={{ display: "flex", alignItems: "center", gap: 20, justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 36, fontWeight: 800, color: COLORS.amber }}>
                {ratingStats.donor.averageRating?.toFixed(1) || "0.0"}
              </div>
              <p style={{ color: panelSubText, fontSize: 13, margin: 0 }}>
                Based on {ratingStats.donor.totalFeedback || 0} review{ratingStats.donor.totalFeedback !== 1 ? "s" : ""}
              </p>
            </div>
            <RatingStars rating={Math.round(ratingStats.donor.averageRating || 0)} readOnly size={32} />
          </div>
          <p style={{ color: isLight ? "rgba(15,23,42,0.65)" : "rgba(255,255,255,0.65)", fontSize: 13, margin: "12px 0 0" }}>
            🎯 Maintain high-quality donations and good communication to keep your rating strong!
          </p>
        </div>
      )}

      <div style={{ marginBottom: 36 }}>
        <h3 style={{ color: panelText, fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Quick Actions</h3>
        <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
          <button onClick={() => setActive("donate")} style={{
            background: COLORS.amber, color: COLORS.forest, border: "none", borderRadius: 12,
            padding: "14px 28px", fontWeight: 700, fontSize: 16, cursor: "pointer", boxShadow: "0 4px 15px rgba(232,146,58,0.3)"
          }}>➕ Post Donation</button>
          <button onClick={() => setActive("myDonations")} style={{
            background: "transparent", color: COLORS.amber, border: `2px solid ${COLORS.amber}`,
            borderRadius: 12, padding: "12px 28px", fontWeight: 600, fontSize: 16, cursor: "pointer",
          }}>📦 View Donations</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, textAlign: "left" }}>
        <div>
          <h3 style={{ color: panelText, fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Recent Activity</h3>
          {recentDonations.length === 0 ? <p style={{ color: isLight ? "rgba(15,23,42,0.55)" : "rgba(255,255,255,0.4)" }}>No recent donations.</p> : null}
          {recentDonations.slice(0, 3).map(d => (
            <div key={d._id} style={{
              background: isLight ? "rgba(255,255,255,0.94)" : "rgba(255,255,255,0.06)", border: isLight ? "1px solid rgba(15,23,42,0.12)" : `1px solid rgba(255,255,255,0.15)`, borderRadius: 12,
              padding: "16px 20px", marginBottom: 12, display: "flex", alignItems: "center", gap: 14,
            }}>
              <div style={{ fontSize: 24 }}>🍱</div>
              <div style={{ flex: 1 }}>
                <div style={{ color: textColor, fontWeight: 600, fontSize: 16 }}>{d.foodName}</div>
                <div style={{ color: mutedColor, fontSize: 13, marginTop: 4 }}>{d.quantity} {d.unit} • {typeof d.location === 'object' ? d.location?.address : d.location}</div>
              </div>
              <span style={{
                background: d.status === "pending" ? "rgba(45, 99, 71, 0.5)" : isLight ? "rgba(15,23,42,0.08)" : "rgba(255, 255, 255, 0.1)",
                color: d.status === "pending" ? COLORS.mint : (isLight ? "#0f172a" : "white"),
                fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 20,
              }}>{d.status}</span>
            </div>
          ))}
        </div>
        <div>
           <Leaderboard limit={5} />
        </div>
      </div>
    </div>
  );
}

function DonateForm({ setActive, reloadDonations, theme }) {
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const isLight = theme === "light";
  const textColor = isLight ? "#111" : "white";
  const mutedColor = isLight ? "rgba(15,23,42,0.65)" : "rgba(255,255,255,0.55)";
  const panelText = isLight ? "#0f172a" : "white";
  const panelSubText = isLight ? "rgba(15,23,42,0.65)" : "rgba(255,255,255,0.65)";
  const inputBg = isLight ? "rgba(15,23,42,0.04)" : "rgba(255,255,255,0.03)";
  const inputBorder = isLight ? "1px solid rgba(15,23,42,0.12)" : "1px solid rgba(255,255,255,0.15)";
  const panelBg = isLight ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.06)";
  const panelBorder = isLight ? "1px solid rgba(148,163,184,0.22)" : "1px solid rgba(255,255,255,0.15)";
  const [form, setForm] = useState({
    name: "", category: "", qty: "", unit: "kg", peopleServed: "",
    pickup: "", expiry: "", description: "", foodType: "veg", isEmergency: false
  });
  
  const [district, setDistrict] = useState("");
  const [place, setPlace] = useState("");
  const [formErrors, setFormErrors] = useState({ district: "", place: "" });
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileRef = useRef();

  const handleImg = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    const newErrors = { district: "", place: "" };

    if (!district) {
      newErrors.district = "Select District";
    }
    if (!place) {
      newErrors.place = "Select Area";
    }
    setFormErrors(newErrors);

    const missing = [];
    if (!form.name) missing.push("Food Name");
    if (!form.category) missing.push("Category");
    if (!form.qty) missing.push("Quantity");
    if (!form.peopleServed) missing.push("People Can Be Fed");
    if (!district || !place) missing.push("Pickup Location");
    if (!form.expiry) missing.push("Expiry Time");
    if (!form.description) missing.push("Description");

    if (missing.length > 0) {
      toast.error(`Missing required fields: ${missing.join(", ")}`);
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("foodName", form.name);
      formData.append("description", `${form.category}: ${form.description}`);
      formData.append("foodType", form.foodType);
      formData.append("quantity", form.qty);
      formData.append("unit", form.unit);
      formData.append("peopleServed", form.peopleServed);
      formData.append("location", `${place}, ${district}`);
      formData.append("expiryTime", form.expiry);
      formData.append("isEmergency", form.isEmergency);
      if (form.pickup) formData.append("pickupTime", form.pickup);
      if (imageFile) formData.append("image", imageFile);

      await createDonation(formData);
      
      localStorage.setItem("lastLocation", JSON.stringify({ district, place }));
      setSuccess(true);
      toast.success("Donation posted successfully!");
      reloadDonations();
      setTimeout(() => { setSuccess(false); setActive("myDonations"); }, 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create donation");
    } finally {
      setLoading(false);
    }
  };

  if (success) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 400 }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
      <h2 style={{ color: COLORS.amber, fontSize: 24, fontWeight: 700 }}>Donation Posted!</h2>
      <p style={{ color: "rgba(255,255,255,0.55)" }}>NGOs can now see your donation.</p>
    </div>
  );

  const field = (label, key, type = "text", opts = {}) => (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", color: mutedColor, fontSize: 12, fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</label>
      {opts.select ? (
        <select value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} style={inputStyle}>
          <option value="">Select {label}</option>
          {opts.options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : opts.textarea ? (
        <textarea value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} placeholder={opts.placeholder || ""} rows={3} style={{ ...inputStyle, resize: "vertical" }} />
      ) : (
        <input type={type} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} placeholder={opts.placeholder || ""} style={inputStyle} />
      )}
    </div>
  );

  const inputStyle = {
    width: "100%", background: inputBg, border: inputBorder,
    borderRadius: 8, padding: "10px 14px", color: textColor, fontSize: 14,
    outline: "none", boxSizing: "border-box",
  };

  return (
    <div style={{ background: panelBg, border: panelBorder, borderRadius: 24, padding: 28, color: textColor, boxShadow: isLight ? "0 25px 60px rgba(15,23,42,0.08)" : "0 25px 60px rgba(0,0,0,0.25)" }}>
      <div style={{ marginBottom: 24, padding: 20, borderRadius: 20, background: isLight ? "rgba(248,250,252,0.95)" : "rgba(255,255,255,0.05)", border: isLight ? "1px solid rgba(148,163,184,0.12)" : "1px solid rgba(255,255,255,0.12)" }}>
        <h2 style={{ color: panelText, fontSize: 28, fontWeight: 700, margin: 0 }}>➕ Post Donation</h2>
        <p style={{ color: panelSubText, fontSize: 15, margin: "10px 0 0", lineHeight: 1.7 }}>
          Share your donation quickly with verified NGOs. Add a few details, upload an optional photo, and post instantly.
        </p>
      </div>

      <div style={{ marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div>
          <div style={{ color: panelText, fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Donation Details</div>
          <div style={{ color: mutedColor, fontSize: 13 }}>Only required fields are mandatory. NGOs see this summary first.</div>
        </div>
        <div style={{ padding: "10px 16px", borderRadius: 18, background: isLight ? "rgba(15,23,42,0.05)" : "rgba(255,255,255,0.08)", color: panelText, fontSize: 13, fontWeight: 600 }}>
          Tip: Add a photo to increase visibility
        </div>
      </div>

      {/* Image Upload */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: "block", color: mutedColor, fontSize: 12, fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>Food Photo (Optional)</label>
        <div
          onClick={() => fileRef.current.click()}
          style={{
            border: `2px dashed ${isLight ? "rgba(15,23,42,0.16)" : "rgba(255,255,255,0.15)"}`, borderRadius: 12, height: 160,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", overflow: "hidden", position: "relative",
            background: isLight ? "rgba(15,23,42,0.04)" : "rgba(255,255,255,0.03)",
          }}
        >
          {imagePreview ? (
            <img src={imagePreview} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <div style={{ textAlign: "center", color: mutedColor }}>
              <div style={{ fontSize: 32, marginBottom: 6 }}>📷</div>
              <div style={{ fontSize: 13 }}>Click to upload an optional food photo</div>
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImg} />
        </div>
        {imagePreview && (
          <button onClick={() => {setImagePreview(null); setImageFile(null);}} style={{ marginTop: 6, background: "transparent", border: "none", color: "#ff6b6b", fontSize: 12, cursor: "pointer" }}>✕ Remove</button>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
        <div style={{ gridColumn: "1/-1" }}>{field("Food Name *", "name", "text", { placeholder: "e.g. Basmati Rice" })}</div>
        {field("Category *", "category", "text", { select: true, options: FOOD_CATEGORIES })}
        <div>
          <label style={{ display: "block", color: mutedColor, fontSize: 12, fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>Quantity *</label>
          <div style={{ display: "flex", gap: 8 }}>
            <input type="number" min="1" value={form.qty} onChange={e => setForm({ ...form, qty: e.target.value })} placeholder="e.g. 100" style={{ ...inputStyle, flex: 1 }} />
            <select value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} style={{ ...inputStyle, width: 72 }}>
              {["kg", "g", "L", "packs", "items"].map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label style={{ display: "block", color: mutedColor, fontSize: 12, fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>People Can Be Fed *</label>
          <input
            type="number"
            min="1"
            value={form.peopleServed}
            onChange={e => setForm({ ...form, peopleServed: e.target.value })}
            placeholder="e.g. 50"
            style={inputStyle}
          />
          <div style={{ fontSize: 11, color: mutedColor, marginTop: 6 }}>How many people can eat from this donation?</div>
        </div>
        
        <div style={{ gridColumn: "1/-1" }}>
          <LocationSelector 
            district={district} 
            setDistrict={(val) => { setDistrict(val); setFormErrors(prev => ({ ...prev, district: "" })); }} 
            place={place} 
            setPlace={(val) => { setPlace(val); setFormErrors(prev => ({ ...prev, place: "" })); }} 
            districtError={formErrors.district}
            placeError={formErrors.place}
            label="Pickup Location *"
          />
        </div>
        
        {field("Pickup Time", "pickup", "datetime-local")}
        {field("Expiry Time *", "expiry", "datetime-local")}
        <div>
          <label style={{ display: "block", color: mutedColor, fontSize: 12, fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>Food Type *</label>
          <div style={{ display: "flex", gap: 10 }}>
            {["veg", "non-veg"].map(t => (
              <label key={t} style={{ display: "flex", alignItems: "center", gap: 6, color: textColor, fontSize: 14, cursor: "pointer" }}>
                <input type="radio" name="foodType" value={t} checked={form.foodType === t} onChange={() => setForm({ ...form, foodType: t })} />
                {t === "veg" ? "🌿 Veg" : "🍗 Non-Veg"}
              </label>
            ))}
          </div>
        </div>
        <div style={{ gridColumn: "1/-1" }}>{field("Description *", "description", "text", { textarea: true, placeholder: "Briefly describe the food, freshness, allergies..." })}</div>
        <div style={{ gridColumn: "1/-1", marginTop: 12, padding: "12px 16px", background: "rgba(231,76,60,0.1)", border: "1px solid rgba(231,76,60,0.2)", borderRadius: 12 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", color: textColor, fontWeight: 600, fontSize: 14 }}>
            <input type="checkbox" checked={form.isEmergency} onChange={e => setForm({ ...form, isEmergency: e.target.checked })} style={{ width: 18, height: 18, accentColor: "#e74c3c" }} />
            🚨 Mark as Emergency / Urgent Pickup
          </label>
          <div style={{ color: mutedColor, fontSize: 12, marginTop: 4, marginLeft: 28 }}>
            Check this if the food is large in quantity or perishing very soon, to immediately alert all nearby NGOs and Volunteers.
          </div>
        </div>
      </div>

      <button disabled={loading} onClick={handleSubmit} style={{
        width: "100%", background: COLORS.amber, color: COLORS.forest, border: "none",
        borderRadius: 10, padding: "14px", fontWeight: 700, fontSize: 16, cursor: loading ? "not-allowed" : "pointer",
        marginTop: 8, letterSpacing: 0.3, opacity: loading ? 0.7 : 1
      }}>
        {loading ? "Posting..." : "🍱 Submit Donation"}
      </button>
    </div>
  );
}

const DonationTimeline = ({ status, theme }) => {
  const isLight = theme === "light";
  const steps = ["pending", "picked_up", "delivered"];
  const labels = ["Pending", "Picked Up", "Delivered"];
  const currentIndex = steps.indexOf(status) >= 0 ? steps.indexOf(status) : 0;

  return (
    <div style={{ display: "flex", alignItems: "center", width: "100%", margin: "8px 0 16px", padding: "0 10px" }}>
      {steps.map((step, idx) => {
        const isCompleted = idx <= currentIndex;
        const isLast = idx === steps.length - 1;
        const color = isCompleted ? "#2ecc71" : (isLight ? "#cbd5e1" : "rgba(255,255,255,0.2)");
        return (
          <React.Fragment key={step}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative", zIndex: 2 }}>
              <div style={{ 
                width: 24, height: 24, borderRadius: "50%", background: color,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: isCompleted ? "#fff" : (isLight ? "#64748b" : "rgba(255,255,255,0.5)"), 
                fontSize: 12, fontWeight: "bold",
                boxShadow: isCompleted ? "0 0 8px rgba(46, 204, 113, 0.4)" : "none"
              }}>
                {isCompleted ? "✓" : idx + 1}
              </div>
              <div style={{ fontSize: 11, color: isLight ? "#475569" : "rgba(255,255,255,0.7)", marginTop: 6, position: "absolute", top: 28, whiteSpace: "nowrap", fontWeight: isCompleted ? 600 : 400 }}>
                {labels[idx]}
              </div>
            </div>
            {!isLast && (
              <div style={{ flex: 1, height: 3, background: color, margin: "0 8px", position: "relative", top: -8, zIndex: 1, transition: "background 0.3s ease" }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

function MyDonations({ donations, onDelete, theme }) {
  const isLight = theme === "light";
  const textColor = isLight ? "#111" : "white";
  const mutedColor = isLight ? "rgba(15,23,42,0.65)" : "rgba(255,255,255,0.55)";
  const cardBg = isLight ? "rgba(255,255,255,0.93)" : "rgba(255,255,255,0.06)";
  const borderColor = isLight ? "1px solid rgba(15,23,42,0.12)" : "1px solid rgba(255,255,255,0.15)";
  const statusColor = { pending: COLORS.mint, delivered: "#7aab7a", picked_up: COLORS.amber };
  return (
    <div>
      <div style={{ background: isLight ? "rgba(255,255,255,0.92)" : "transparent", borderRadius: 24, padding: 24, color: textColor }}>
        <h2 style={{ color: textColor, fontSize: 26, fontWeight: 600, margin: "0 0 16px" }}>📦 My Donations</h2>
        <p style={{ color: mutedColor, fontSize: 14, marginBottom: 20 }}>{donations.length} total donations</p>
      {donations.length === 0 ? <p style={{ color: isLight ? "rgba(15,23,42,0.75)" : "white" }}>You haven't posted any donations yet.</p> : null}
      
      {donations.map(d => (
        <div key={d._id} style={{
          background: cardBg, border: borderColor, borderRadius: 12,
          padding: "16px", marginBottom: 16, display: "flex", flexDirection: "column", gap: 16,
        }}>
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            {d.image ? (
              <img src={d.image} alt={d.foodName} style={{ width: 56, height: 56, borderRadius: 8, objectFit: "cover" }} />
            ) : (
              <div style={{ width: 56, height: 56, borderRadius: 8, background: isLight ? "rgba(15,23,42,0.04)" : "rgba(255,255,255,0.03)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>🍱</div>
            )}
            <div style={{ flex: 1 }}>
              <div style={{ color: textColor, fontWeight: 600, fontSize: 15 }}>{d.foodName}</div>
              <div style={{ color: mutedColor, fontSize: 12, marginTop: 2 }}>{d.quantity} {d.unit} • {typeof d.location === 'object' ? d.location?.address : d.location}</div>
              <div style={{ color: mutedColor, fontSize: 11, marginTop: 2 }}>{new Date(d.createdAt).toLocaleString()}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
              <span style={{
                background: d.status === "pending" ? "rgba(45, 99, 71, 0.5)" : "rgba(255, 255, 255, 0.1)",
                color: statusColor[d.status] || "white", fontSize: 11, fontWeight: 700,
                padding: "4px 12px", borderRadius: 20, textAlign: "center"
              }}>Status: {d.status}</span>
              <span style={{
                background: d.adminStatus === "approved" ? "rgba(46, 204, 113, 0.2)" : d.adminStatus === "rejected" ? "rgba(231,76,60,0.2)" : "rgba(243,156,18,0.2)",
                color: d.adminStatus === "approved" ? "#2ecc71" : d.adminStatus === "rejected" ? "#e74c3c" : "#f39c12", fontSize: 10, fontWeight: 700,
                padding: "2px 8px", borderRadius: 12, textAlign: "center"
              }}>Admin: {d.adminStatus || "pending"}</span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {d.status === "delivered" && (
                <button 
                  onClick={async () => {
                    try {
                      const { downloadDonationReceipt } = await import("../api/donation");
                      const res = await downloadDonationReceipt(d._id);
                      if (res.success && res.data.receiptUrl) {
                        window.open(res.data.receiptUrl, "_blank");
                      }
                    } catch (err) {
                      toast.error("Certificate not available yet.");
                    }
                  }}
                  style={{ 
                    background: "rgba(46,204,113,0.1)", border: "1px solid rgba(46,204,113,0.3)", 
                    color: "#2ecc71", padding: "6px 10px", borderRadius: 8, fontSize: 12, cursor: "pointer",
                    fontWeight: 600
                  }}
                >
                  📄 Certificate
                </button>
              )}
              <button 
                onClick={() => onDelete && onDelete(d._id)}
                style={{ 
                  background: "rgba(231,76,60,0.1)", border: "1px solid rgba(231,76,60,0.3)", 
                  color: "#e74c3c", padding: "6px 10px", borderRadius: 8, fontSize: 12, cursor: "pointer",
                  fontWeight: 600
                }}
              >
                Delete
              </button>
            </div>
          </div>
          <div style={{ borderTop: isLight ? "1px dashed rgba(15,23,42,0.1)" : "1px dashed rgba(255,255,255,0.1)", paddingTop: 16 }}>
            <DonationTimeline status={d.status} theme={theme} />
          </div>
        </div>
      ))}
      </div>
    </div>
  );
}

function ImpactPage({ stats, theme }) {
  const isLight = theme === "light";
  const textColor = isLight ? "#111" : "white";
  const mutedColor = isLight ? "rgba(15,23,42,0.65)" : "rgba(255,255,255,0.55)";
  const cardBg = isLight ? "rgba(255,255,255,0.94)" : "rgba(255,255,255,0.06)";
  const metrics = [
    { icon: "🍱", label: "Meals Donated", value: stats.totalDonated || 0, sub: "donations posted" },
    { icon: "👥", label: "People Fed", value: stats.peopleHelped || 0, sub: "people fed" },
    { icon: "✅", label: "Completed", value: stats.completed || 0, sub: "fully collected" },
    { icon: "🔥", label: "Active Streak", value: "1 Days", sub: "keep it up!" },
  ];
  return (
    <div style={{ background: isLight ? "rgba(255,255,255,0.94)" : "transparent", borderRadius: 24, padding: 24, color: textColor }}>
      <h2 style={{ color: textColor, fontSize: 26, fontWeight: 600, margin: "0 0 16px" }}>📊 My Impact</h2>
      <p style={{ color: mutedColor, fontSize: 14, marginBottom: 24 }}>Here's the difference you've made.</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 24 }}>
        {metrics.map(m => (
          <div key={m.label} style={{ background: cardBg, border: `1px solid ${isLight ? "rgba(15,23,42,0.12)" : "rgba(255,255,255,0.15)"}`, borderRadius: 12, padding: "20px 18px" }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{m.icon}</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: COLORS.amber }}>{m.value}</div>
            <div style={{ fontSize: 13, color: textColor, fontWeight: 500 }}>{m.label}</div>
            <div style={{ fontSize: 11, color: mutedColor, marginTop: 3 }}>{m.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RequestsPage({ requests, onRequestAction, theme, user }) {
  const isLight = theme === "light";
  const textColor = isLight ? "#111" : "white";
  const mutedColor = isLight ? "rgba(15,23,42,0.65)" : "rgba(255,255,255,0.55)";
  const panelBg = isLight ? "rgba(255,255,255,0.94)" : "rgba(255,255,255,0.04)";
  const pending = requests.filter(r => r.status === "pending");
  const history = requests.filter(r => r.status !== "pending");
  const [activeChat, setActiveChat] = useState(null);

  return (
    <div style={{ background: panelBg, borderRadius: 24, padding: 24, color: textColor }}>
      <h2 style={{ color: textColor, fontSize: 26, fontWeight: 600, margin: "0 0 16px" }}>📋 My Requests</h2>
      <p style={{ color: mutedColor, fontSize: 14, marginBottom: 24 }}>NGOs have requested your food. Accept or reject them here.</p>

      {pending.length === 0 && history.length === 0 ? (
        <p style={{ color: isLight ? "rgba(15,23,42,0.5)" : "rgba(255,255,255,0.4)" }}>No requests yet.</p>
      ) : null}

      {pending.length > 0 && (
        <div style={{ marginBottom: 30 }}>
          <h3 style={{ color: textColor, fontSize: 16, fontWeight: 600, marginBottom: 14 }}>Pending Approvals</h3>
          {pending.map(r => (
            <div key={r._id} style={{
              background: "rgba(232,146,58,0.06)", border: `1px solid rgba(232,146,58,0.2)`, borderRadius: 12,
              padding: "16px", marginBottom: 12, display: "flex", gap: 14, alignItems: "center",
            }}>
              <div style={{ fontSize: 32 }}>📋</div>
              <div style={{ flex: 1 }}>
                <div style={{ color: textColor, fontWeight: 600, fontSize: 15 }}>{r.foodId?.foodName}</div>
                <div style={{ color: mutedColor, fontSize: 13, marginTop: 2 }}>
                  Requested by <strong style={{color: textColor}}>{r.ngoId?.name}</strong> • {r.qty} {r.foodId?.unit || 'units'}
                </div>
                {r.message && <div style={{ color: isLight ? "rgba(15,23,42,0.55)" : "rgba(255,255,255,0.45)", fontSize: 12, marginTop: 4, fontStyle: "italic" }}>"{r.message}"</div>}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => onRequestAction(r._id, "rejected")} style={{ background: isLight ? "rgba(15,23,42,0.06)" : "rgba(255,255,255,0.05)", color: textColor, border: "none", padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>Reject</button>
                <button onClick={() => onRequestAction(r._id, "accepted")} style={{ background: COLORS.mint, color: COLORS.forest, border: "none", padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontWeight: 700 }}>Accept</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {history.length > 0 && (
        <div>
          <h3 style={{ color: textColor, fontSize: 16, fontWeight: 600, marginBottom: 14 }}>History</h3>
          {history.map(r => (
            <React.Fragment key={r._id}>
              <div style={{
                background: isLight ? "rgba(15,23,42,0.04)" : "rgba(255,255,255,0.04)", border: isLight ? "1px solid rgba(15,23,42,0.12)" : `1px solid rgba(255,255,255,0.1)`, borderRadius: 12,
                padding: "14px 16px", marginBottom: 10, display: "flex", gap: 14, alignItems: "center",
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ color: textColor, fontWeight: 600, fontSize: 14 }}>{r.foodId?.foodName}</div>
                  <div style={{ color: mutedColor, fontSize: 12 }}>{r.ngoId?.name} • {r.qty} {r.foodId?.unit}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {r.status === "accepted" && (
                    <button 
                      onClick={() => setActiveChat({ requestId: r._id, otherUserId: r.ngoId?._id })}
                      style={{ background: isLight ? "rgba(15,23,42,0.06)" : "rgba(255,255,255,0.1)", color: textColor, border: "none", padding: "6px 12px", borderRadius: 16, cursor: "pointer", fontSize: 12, fontWeight: 600 }}
                    >
                      💬 Chat
                    </button>
                  )}
                  <span style={{
                    background: r.status === "accepted" ? "rgba(46,155,78,0.2)" : r.status === "rejected" ? "rgba(231,76,60,0.2)" : "rgba(107,140,255,0.2)",
                    color: r.status === "accepted" ? COLORS.mint : r.status === "rejected" ? "#f1948a" : "#7ec8a0", 
                    fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 20, textTransform: "capitalize"
                  }}>{r.status}</span>
                </div>
              </div>
              {activeChat?.requestId === r._id && (
                <div style={{ marginTop: 4, marginBottom: 20, display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                  <button onClick={() => setActiveChat(null)} style={{ background: "transparent", color: "#e74c3c", border: "none", cursor: "pointer", fontSize: 12, marginBottom: 8, fontWeight: 600 }}>✖ Close Chat</button>
                  <ChatWidget requestId={r._id} currentUserId={user?._id} currentUserRole="donor" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── PAGE: DONOR PROFILE ────────────────────────────────────────────────────────

const ProfileInputField = ({ label, icon, theme, ...props }) => {
  const isLight = theme === "light";
  const textColor = isLight ? "#111" : "white";
  const mutedColor = isLight ? "rgba(15,23,42,0.65)" : "rgba(255,255,255,0.55)";
  const inputBg = isLight ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.04)";
  const inputBorder = isLight ? "1px solid rgba(15,23,42,0.12)" : "1px solid rgba(255,255,255,0.15)";
  
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: "block", color: mutedColor, fontSize: 12, fontWeight: 600, marginBottom: 6, textTransform: "uppercase" }}>{label}</label>
      <div style={{ position: "relative" }}>
        {icon && <span style={{ position: "absolute", left: 14, top: 10, fontSize: 14 }}>{icon}</span>}
        <input {...props} style={{ width: "100%", background: inputBg, border: inputBorder, borderRadius: 10, padding: "10px 14px", paddingLeft: icon ? 38 : 14, color: textColor, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
      </div>
    </div>
  );
};

function ProfilePage({ user, setUser, theme }) {
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({ 
    name: user?.name || "Donor Name", 
    email: user?.email || "", 
    phone: user?.phone || "0771234567", 
    address: user?.organization || "42 Main Street, Colombo 7", 
    district: "Colombo" 
  });
  const [officeLoc, setOfficeLoc] = useState(() => user?.officeLocation || null);
  const [profileImage, setProfileImage] = useState(user?.profileImage || null);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef(null);
  const isLight = theme === "light";
  const textColor = isLight ? "#111" : "white";
  const mutedColor = isLight ? "rgba(15,23,42,0.65)" : "rgba(255,255,255,0.55)";

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const [saved, setSaved] = useState(false);

  const handleImg = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setProfileImage(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported");
      return;
    }

    toast.loading("Getting current location...");
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
        const data = await res.json();
        const address = data?.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        setForm((f) => ({ ...f, address }));
        setOfficeLoc({ lat, lng, address });
        toast.dismiss();
        toast.success("Location set");
      } catch {
        setOfficeLoc({ lat, lng, address: "" });
        setForm((f) => ({ ...f, address: `${lat.toFixed(6)}, ${lng.toFixed(6)}` }));
        toast.dismiss();
        toast.success("Location coordinates set");
      }
    }, () => {
      toast.dismiss();
      toast.error("Failed to get location");
    }, { enableHighAccuracy: true, timeout: 8000 });
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("email", form.email);
      formData.append("phone", form.phone);
      if (officeLoc?.address !== undefined) formData.append("officeAddress", officeLoc.address || form.address);
      if (officeLoc?.lat !== undefined) formData.append("officeLat", officeLoc.lat);
      if (officeLoc?.lng !== undefined) formData.append("officeLng", officeLoc.lng);
      if (imageFile) formData.append("profileImage", imageFile);
      
      const { updateProfile } = await import("../api/auth");
      const res = await updateProfile(formData);
      
      localStorage.setItem("user", JSON.stringify(res.data));
      if (setUser) setUser(res.data);
      setProfileImage(res.data.profileImage);
      setOfficeLoc(res.data.officeLocation || officeLoc);
      setImageFile(null);
      setEdit(false); 
      setSaved(true); 
      setTimeout(() => setSaved(false), 2500); 
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: isLight ? "rgba(255,255,255,0.94)" : "transparent", borderRadius: 24, padding: 24, color: textColor }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, marginBottom: 24, textAlign: "center" }}>
        <h2 style={{ color: textColor, fontSize: 26, margin: 0 }}>🏢 Donor Profile</h2>
        {!edit && <button onClick={() => setEdit(true)} style={{ background: isLight ? "rgba(15,23,42,0.06)" : "rgba(255,255,255,0.05)", color: textColor, border: "none", padding: "10px 20px", borderRadius: 10, cursor: "pointer", fontWeight: 600 }}>Edit Profile</button>}
      </div>

      {saved && <div style={{ background: "rgba(232,146,58,0.15)", border: `1px solid rgba(232,146,58,0.3)`, borderRadius: 12, padding: "12px 18px", marginBottom: 18, fontSize: 14, color: COLORS.amberLight }}>✅ Profile updated successfully!</div>}



      <div style={{ background: isLight ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.06)", border: isLight ? "1px solid rgba(15,23,42,0.12)" : "1px solid rgba(255,255,255,0.15)", borderRadius: 18, padding: "28px 30px", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 28 }}>
          <div 
            onClick={() => edit && fileRef.current?.click()}
            style={{ 
              width: 72, height: 72, borderRadius: 20, 
              background: `linear-gradient(135deg, ${COLORS.amber}, ${COLORS.amberLight})`, 
              display: "flex", alignItems: "center", justifyContent: "center", 
              fontSize: 28, fontWeight: 800, color: COLORS.forest,
              cursor: edit ? "pointer" : "default",
              overflow: "hidden", position: "relative"
            }}>
            {profileImage ? (
              <img src={profileImage} alt="profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              form.name.substring(0, 2).toUpperCase()
            )}
            {edit && (
              <div style={{
                position: "absolute", bottom: 0, left: 0, right: 0,
                background: "rgba(0,0,0,0.6)", color: "white", fontSize: 10,
                textAlign: "center", padding: "4px 0", textTransform: "uppercase"
              }}>
                Edit
              </div>
            )}
            <input type="file" ref={fileRef} accept="image/*" style={{ display: "none" }} onChange={handleImg} />
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, color: textColor }}>{form.name}</div>
            <div style={{ fontSize: 13, color: mutedColor, marginTop: 3 }}>Donor Account</div>
          </div>
        </div>

        {edit ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
            <ProfileInputField theme={theme} label="Organization / Donor Name" value={form.name} onChange={set("name")} icon="🏢" />
            <ProfileInputField theme={theme} label="Email" type="email" value={form.email} onChange={set("email")} icon="✉️" />
            <ProfileInputField theme={theme} label="Phone" value={form.phone} onChange={set("phone")} icon="📱" />
            <ProfileInputField theme={theme} label="District" value={form.district} onChange={set("district")} icon="🏘️" />
            <div style={{ gridColumn: "1/-1" }}>
              <ProfileInputField theme={theme} label="Address" value={form.address} onChange={set("address")} icon="📍" />
              <div style={{ marginTop: 8 }}>
                <button type="button" onClick={handleUseCurrentLocation} style={{ background: "transparent", border: "none", color: COLORS.amber, fontWeight: 700, cursor: "pointer", padding: 0 }}>
                  📍 Use My Current Location
                </button>
              </div>
            </div>
            <div style={{ gridColumn: "1/-1", display: "flex", gap: 12, marginTop: 8 }}>
              <button disabled={loading} onClick={() => { setEdit(false); setProfileImage(user?.profileImage || null); setImageFile(null); }} style={{ flex: 1, background: isLight ? "rgba(15,23,42,0.06)" : "rgba(255,255,255,0.05)", color: textColor, border: "none", padding: "12px", borderRadius: 10, cursor: "pointer", fontWeight: 600 }}>Cancel</button>
              <button disabled={loading} onClick={handleSave} style={{ flex: 1, background: COLORS.amber, color: COLORS.forest, border: "none", padding: "12px", borderRadius: 10, cursor: "pointer", fontWeight: 700 }}>{loading ? "Saving..." : "Save Changes ✓"}</button>
            </div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {[["✉️ Email", form.email], ["📱 Phone", form.phone], ["📍 Address", form.address], ["🏘️ District", form.district]].map(([k, v]) => (
              <div key={k} style={{ background: isLight ? "rgba(15,23,42,0.04)" : "rgba(255,255,255,0.04)", borderRadius: 12, padding: "14px 16px" }}>
                <div style={{ fontSize: 12, color: mutedColor, marginBottom: 5 }}>{k}</div>
                <div style={{ fontSize: 14, color: textColor }}>{v}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── PAGE: FEEDBACKS ──────────────────────────────────────────────────────────
function FeedbacksPage({ theme, refreshTrigger }) {
  const [activeTab, setActiveTab] = useState("pending");
  const [pending, setPending] = useState([]);
  const [submitted, setSubmitted] = useState([]);
  const [received, setReceived] = useState([]);
  const [loading, setLoading] = useState(false);
  const [feedbackDonationId, setFeedbackDonationId] = useState(null);
  const [feedbackData, setFeedbackData] = useState({ rating: 0, comment: "" });
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  const isLight = theme === "light";
  const textColor = isLight ? "#111" : "white";
  const mutedColor = isLight ? "rgba(15,23,42,0.65)" : "rgba(255,255,255,0.55)";

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const resPend = await getMyPendingFeedbacks();
      if (resPend.success) setPending(resPend.data || []);
      
      const resSub = await getMySubmittedFeedbacks();
      if (resSub.success) setSubmitted(resSub.data || []);
      
      const resRec = await getMyReceivedFeedbacks();
      if (resRec.success) setReceived(resRec.data.received || []);
    } catch (err) {
      console.error("Error fetching feedbacks", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, [refreshTrigger]);

  const handleSubmitFeedback = async () => {
    if (!feedbackDonationId || feedbackData.rating === 0) return;
    setSubmittingFeedback(true);
    try {
      await addMoneyDonationFeedback(feedbackDonationId, feedbackData.rating, feedbackData.comment);
      toast.success("Thank you for your feedback!");
      setFeedbackDonationId(null);
      setFeedbackData({ rating: 0, comment: "" });
      fetchFeedbacks();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Error saving feedback");
    } finally {
      setSubmittingFeedback(false);
    }
  };

  return (
    <div>
      <h2 style={{ color: textColor, fontSize: 26, margin: "0 0 22px" }}>⭐ Feedback & Ratings</h2>

      <div style={{ display: "flex", gap: 14, marginBottom: 28, flexWrap: "wrap" }}>
        <StatCard icon="📝" label="Pending Feedback" value={pending.length} color={COLORS.amber} />
        <StatCard icon="✅" label="Submitted Feedbacks" value={submitted.length} color={COLORS.mint} />
        <StatCard icon="⭐" label="Received Feedbacks" value={received.length} color={COLORS.indigo || "#6366f1"} />
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        {[["pending", "📝 Pending Feedback"], ["submitted", "✅ Submitted Feedbacks"], ["received", "⭐ Received Feedbacks"]].map(([val, label]) => (
          <button
            key={val}
            onClick={() => setActiveTab(val)}
            style={{
              padding: "10px 20px",
              borderRadius: 22,
              border: `1px solid ${activeTab === val ? (isLight ? "rgba(245,158,11,0.5)" : "rgba(232,146,58,0.5)") : (isLight ? "rgba(15,23,42,0.12)" : "rgba(255,255,255,0.15)")}`,
              background: activeTab === val ? (isLight ? "rgba(245,158,11,0.15)" : "rgba(232,146,58,0.2)") : (isLight ? "rgba(15,23,42,0.04)" : "rgba(255,255,255,0.05)"),
              color: activeTab === val ? (isLight ? "#d97706" : COLORS.amber) : mutedColor,
              fontSize: 13,
              cursor: "pointer",
              fontWeight: activeTab === val ? 600 : 400,
              transition: "all 0.15s",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === "pending" && (
        <div>
          {loading ? (
            <div style={{ textAlign: "center", padding: 40, color: mutedColor }}>⏳ Loading feedbacks...</div>
          ) : pending.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", color: mutedColor }}>
              <div style={{ fontSize: 52, marginBottom: 14 }}>✅</div>
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: textColor }}>No pending feedback</div>
              <p style={{ margin: 0, fontSize: 14 }}>All donations have feedback! Great work 🎉</p>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 20 }}>
              {pending.map((item) => (
                <div
                  key={item._id}
                  style={{
                    background: isLight ? "rgba(245,158,11,0.05)" : `linear-gradient(135deg, ${COLORS.amber}15, ${COLORS.orange}15)`,
                    border: isLight ? `1px solid rgba(245,158,11,0.3)` : `1px solid ${COLORS.amber}40`,
                    borderRadius: 18,
                    padding: 24,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
                    <div
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: 14,
                        background: isLight ? "rgba(245,158,11,0.15)" : "rgba(255,255,255,0.08)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 28,
                      }}
                    >
                      💰
                    </div>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: textColor }}>{item.moneyRequestId?.purpose || "Fundraiser Support"}</div>
                      <div style={{ fontSize: 13, color: mutedColor }}>
                        ₹{item.amount} to {item.ngoId?.name || "NGO"} · {new Date(item.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  {/* Inline Feedback UI */}
                  {feedbackDonationId === item._id ? (
                    <div style={{ background: isLight ? "#fff" : "rgba(0,0,0,0.2)", padding: 20, borderRadius: 14, border: isLight ? "1px solid rgba(15,23,42,0.1)" : "1px solid rgba(255,255,255,0.1)" }}>
                      <div style={{ marginBottom: 16 }}>
                        <label style={{ display: "block", color: textColor, fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Rating *</label>
                        <RatingStars rating={feedbackData.rating} onRatingChange={r => setFeedbackData({...feedbackData, rating: r})} size={28} />
                      </div>
                      <div style={{ marginBottom: 16 }}>
                        <label style={{ display: "block", color: textColor, fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Comment (Optional)</label>
                        <textarea
                          value={feedbackData.comment}
                          onChange={e => setFeedbackData({...feedbackData, comment: e.target.value})}
                          placeholder="Share your experience..."
                          style={{
                            width: "100%", padding: 12, borderRadius: 8,
                            background: isLight ? "#f8fafc" : "rgba(255,255,255,0.05)",
                            border: isLight ? "1px solid rgba(15,23,42,0.12)" : "1px solid rgba(255,255,255,0.15)",
                            color: textColor, resize: "vertical", minHeight: 80, boxSizing: "border-box"
                          }}
                        />
                      </div>
                      <div style={{ display: "flex", gap: 12 }}>
                        <button onClick={() => setFeedbackDonationId(null)} style={{ flex: 1, padding: "10px", borderRadius: 8, background: isLight ? "rgba(15,23,42,0.05)" : "rgba(255,255,255,0.1)", border: "none", color: textColor, cursor: "pointer", fontWeight: 600 }}>Cancel</button>
                        <button 
                          onClick={handleSubmitFeedback} 
                          disabled={submittingFeedback || feedbackData.rating === 0}
                          style={{ flex: 2, padding: "10px", borderRadius: 8, background: feedbackData.rating === 0 ? "rgba(15,23,42,0.1)" : COLORS.amber, border: "none", color: feedbackData.rating === 0 ? "rgba(15,23,42,0.4)" : COLORS.forest, cursor: feedbackData.rating === 0 ? "not-allowed" : "pointer", fontWeight: 700 }}
                        >
                          {submittingFeedback ? "Submitting..." : "Submit Feedback"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setFeedbackDonationId(item._id)}
                      style={{
                        width: "100%", padding: "12px", borderRadius: 12,
                        background: isLight ? "rgba(245,158,11,0.15)" : "rgba(245, 158, 11, 0.2)",
                        border: isLight ? `1px solid ${COLORS.amber}` : `1px solid ${COLORS.amber}60`,
                        color: isLight ? "#d97706" : COLORS.amber,
                        fontSize: 14, fontWeight: 700, cursor: "pointer",
                      }}
                    >
                      Leave Feedback
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "submitted" && (
        <div>
          {loading ? (
            <div style={{ textAlign: "center", padding: 40, color: mutedColor }}>⏳ Loading feedbacks...</div>
          ) : submitted.length === 0 ? (
             <div style={{ textAlign: "center", padding: "60px 20px", color: mutedColor }}>
              <div style={{ fontSize: 52, marginBottom: 14 }}>📝</div>
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: textColor }}>No submitted feedbacks yet</div>
              <p style={{ margin: 0, fontSize: 14 }}>Submit feedback after supporting a fundraiser</p>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 16 }}>
              {submitted.map((feedback) => (
                <div key={feedback._id} style={{ background: isLight ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.06)", border: isLight ? "1px solid rgba(15,23,42,0.12)" : "1px solid rgba(255,255,255,0.15)", borderRadius: 14, padding: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: textColor, marginBottom: 4 }}>🎯 {feedback.ngoId?.name || "NGO"}</div>
                      <div style={{ fontSize: 12, color: mutedColor }}>{new Date(feedback.createdAt).toLocaleDateString()}</div>
                    </div>
                    <RatingStars rating={feedback.rating} readOnly size={24} />
                  </div>
                  {feedback.comment && (
                    <p style={{ background: isLight ? "rgba(15,23,42,0.04)" : "rgba(0,0,0,0.2)", borderRadius: 10, padding: 12, color: textColor, fontSize: 13, lineHeight: 1.6, margin: 0, marginTop: 12, borderLeft: `3px solid ${COLORS.amber}` }}>
                      "{feedback.comment}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "received" && (
        <div>
          {loading ? (
            <div style={{ textAlign: "center", padding: 40, color: mutedColor }}>⏳ Loading feedbacks...</div>
          ) : received.length === 0 ? (
             <div style={{ textAlign: "center", padding: "60px 20px", color: mutedColor }}>
              <div style={{ fontSize: 52, marginBottom: 14 }}>⭐</div>
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: textColor }}>No received feedbacks yet</div>
              <p style={{ margin: 0, fontSize: 14 }}>Keep doing great work to earn feedback</p>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 16 }}>
              {received.map((feedback) => (
                <div key={feedback._id} style={{ background: isLight ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.06)", border: isLight ? "1px solid rgba(15,23,42,0.12)" : "1px solid rgba(255,255,255,0.15)", borderRadius: 14, padding: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: textColor, marginBottom: 4 }}>
                        {feedback.ngoId?.name ? `🎯 ${feedback.ngoId.name}` : (feedback.donorId?.name ? `👤 ${feedback.donorId.name}` : "NGO")}
                      </div>
                      <div style={{ fontSize: 12, color: mutedColor }}>{new Date(feedback.createdAt).toLocaleDateString()}</div>
                    </div>
                    <RatingStars rating={feedback.rating} readOnly size={24} />
                  </div>
                  {feedback.comment && (
                    <p style={{ background: isLight ? "rgba(15,23,42,0.04)" : "rgba(0,0,0,0.2)", borderRadius: 10, padding: 12, color: textColor, fontSize: 13, lineHeight: 1.6, margin: 0, marginTop: 12, borderLeft: `3px solid ${COLORS.amber}` }}>
                      "{feedback.comment}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}


    </div>
  );
}

// ─── PAGE: NOTIFICATIONS ──────────────────────────────────────────────────────
function NotificationsPage({ notifications, setNotifications, theme }) {
  const isLight = theme === "light";
  const textColor = isLight ? "#111" : "white";
  return (
    <div style={{ padding: 24, background: isLight ? "rgba(255,255,255,0.94)" : "rgba(255,255,255,0.04)", borderRadius: 24 }}>
      <h2 style={{ color: textColor, fontSize: 26, margin: "0 0 4px" }}>🔔 Notifications</h2>
      <p style={{ color: isLight ? "rgba(15,23,42,0.65)" : "rgba(255,255,255,0.55)", fontSize: 14, marginBottom: 20 }}>{notifications.filter(m => !m.read).length} unread notifications</p>
      
      {notifications.length === 0 ? <p style={{ color: isLight ? "rgba(15,23,42,0.5)" : "rgba(255,255,255,0.4)" }}>No notifications yet.</p> : null}
      
      {notifications.map(m => (
        <div key={m._id} onClick={() => setNotifications(notifications.map(x => x._id === m._id ? { ...x, read: true } : x))} style={{
          background: m.read ? (isLight ? "rgba(15,23,42,0.04)" : "rgba(255,255,255,0.06)") : (isLight ? "#fff" : "rgba(255,255,255,0.1)"),
          border: `1px solid ${m.read ? (isLight ? "rgba(15,23,42,0.1)" : "rgba(255,255,255,0.15)") : COLORS.amber}`,
          borderRadius: 12, padding: "14px 16px", marginBottom: 10,
          display: "flex", gap: 12, alignItems: "flex-start", cursor: "pointer",
        }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(232, 146, 58, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: COLORS.amber, fontSize: 16, flexShrink: 0 }}>🔔</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: textColor, fontWeight: 600, fontSize: 14 }}>Notification</span>
              <span style={{ color: isLight ? "rgba(15,23,42,0.5)" : "rgba(255,255,255,0.55)", fontSize: 11 }}>{new Date(m.createdAt).toLocaleDateString()}</span>
            </div>
            <div style={{ color: m.read ? (isLight ? "rgba(15,23,42,0.6)" : "rgba(255,255,255,0.55)") : textColor, fontSize: 13, marginTop: 3 }}>{m.message}</div>
          </div>
          {!m.read && <div style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS.amber, flexShrink: 0, marginTop: 6 }} />}
        </div>
      ))}
    </div>
  );
}

// ─── PAGE: FUNDRAISERS (MONEY DONATIONS) ───────────────────────────────────────
function FundraisersPage({ fundRequests, reload, theme, user }) {
  const [selectedReq, setSelectedReq] = useState(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [paymentStep, setPaymentStep] = useState(0); // 0: off, 2: feedback
  const [donationId, setDonationId] = useState(null);
  const [feedback, setFeedback] = useState({ rating: 5, comment: "" });
  const [loading, setLoading] = useState(false);
  const [viewDocUrl, setViewDocUrl] = useState(null);

  const handleDonate = (req) => {
    setSelectedReq(req);
    setCheckoutOpen(true);
  };

  const handleOnlinePay = ({ amount, requestId, purpose, maxAmount }) => {
    window.location.href = `/mock-checkout?amount=${amount}&request_id=${requestId}&purpose=${encodeURIComponent(purpose)}&max=${maxAmount}`;
  };

  const isLight = theme === "light";
  const textColor = isLight ? "#111" : "white";
  const mutedColor = isLight ? "rgba(15,23,42,0.65)" : "rgba(255,255,255,0.55)";
  const surfaceBg = isLight ? "rgba(255,255,255,0.94)" : "rgba(255,255,255,0.04)";

  const submitFeedback = async () => {
    setLoading(true);
    try {
      await addMoneyDonationFeedback(donationId, feedback.rating, feedback.comment);
      toast.success("Thank you for your feedback!");
      setPaymentStep(0);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Error saving feedback");
    } finally {
      setLoading(false);
    }
  };

  // Check URL params for success state from MockCheckout
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("payment") === "success" && urlParams.get("request_id")) {
      setPaymentStep(2); // Show feedback
      if (urlParams.get("donation_id")) {
         
        setDonationId(urlParams.get("donation_id"));
      }
      reload();
      // clean url
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  return (
    <div style={{ background: surfaceBg, borderRadius: 24, padding: 24, color: textColor }}>
      <div style={{ textAlign: "center", maxWidth: 720, margin: "0 auto 24px" }}>
        <h2 style={{ color: textColor, fontSize: 26, fontWeight: 600, margin: "0 0 6px" }}>💰 Fundraisers</h2>
        <p style={{ color: mutedColor, fontSize: 14, margin: 0, maxWidth: 620, marginLeft: "auto", marginRight: "auto" }}>
          Choose from 3 payment options — Online Card, Bank Transfer, or Cash Hand Over.
        </p>
      </div>
      {fundRequests.length === 0 ? <p style={{ color: mutedColor }}>No active fundraisers right now.</p> : (
        <div style={{ display: "grid", gap: 18 }}>
          {fundRequests.map(req => {
            const remaining = Math.max(0, Number(req.amountNeeded) - Number(req.amountRaised));
            const goalReached = remaining <= 0;
            return (
            <div key={req._id} style={{ background: isLight ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.06)", border: isLight ? "1px solid rgba(15,23,42,0.12)" : "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: 22, display: "grid", gridTemplateColumns: "110px 1fr auto", gap: 18, alignItems: "center" }}>
              <div style={{ width: 110, height: 110, borderRadius: 20, background: isLight ? "rgba(15,23,42,0.04)" : "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                {req.image ? (
                  <img src={req.image} alt={req.purpose} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <div style={{ width: 90, height: 90, borderRadius: 18, background: isLight ? "rgba(15,23,42,0.08)" : "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40 }}>
                    💰
                  </div>
                )}
              </div>
              <div style={{ minWidth: 0 }}>
                <h3 style={{ color: textColor, margin: "0 0 10px", fontSize: 20 }}>{req.purpose}</h3>
                <div style={{ fontSize: 13, color: mutedColor, marginBottom: 10 }}>By {req.ngoId?.name || "Verified NGO"}</div>
                {req.documents && (
                  <div style={{ display: "flex", gap: 12, flexWrap: "nowrap", overflowX: "auto", marginBottom: 16, fontSize: 16, fontWeight: 600, paddingBottom: 4 }}>
                    {req.documents.needStatement && (
                      <a href="#" onClick={(e) => { e.preventDefault(); setViewDocUrl(req.documents.needStatement.startsWith('http') ? req.documents.needStatement : `http://${window.location.hostname}:5000/uploads/${req.documents.needStatement.split(/[\\/]/).pop()}`); }} style={{color: COLORS.amber, textDecoration: "none", background: isLight ? "rgba(245,158,11,0.1)" : "rgba(245,158,11,0.2)", padding: "8px 16px", borderRadius: 8, display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap"}}>📄 Need Statement</a>
                    )}
                    {req.documents.registrationCertificate && (
                      <a href="#" onClick={(e) => { e.preventDefault(); setViewDocUrl(req.documents.registrationCertificate.startsWith('http') ? req.documents.registrationCertificate : `http://${window.location.hostname}:5000/uploads/${req.documents.registrationCertificate.split(/[\\/]/).pop()}`); }} style={{color: COLORS.amber, textDecoration: "none", background: isLight ? "rgba(245,158,11,0.1)" : "rgba(245,158,11,0.2)", padding: "8px 16px", borderRadius: 8, display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap"}}>📄 Registration</a>
                    )}
                    {req.documents.bankDetails && (
                      <a href="#" onClick={(e) => { e.preventDefault(); setViewDocUrl(req.documents.bankDetails.startsWith('http') ? req.documents.bankDetails : `http://${window.location.hostname}:5000/uploads/${req.documents.bankDetails.split(/[\\/]/).pop()}`); }} style={{color: COLORS.amber, textDecoration: "none", background: isLight ? "rgba(245,158,11,0.1)" : "rgba(245,158,11,0.2)", padding: "8px 16px", borderRadius: 8, display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap"}}>📄 Bank Details</a>
                    )}
                  </div>
                )}
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
                  <span style={{ fontSize: 13, color: textColor, background: isLight ? "rgba(15,23,42,0.04)" : "rgba(255,255,255,0.05)", padding: "8px 12px", borderRadius: 14 }}>Goal: LKR {req.amountNeeded.toLocaleString()}</span>
                  <span style={{ fontSize: 13, color: textColor, background: isLight ? "rgba(15,23,42,0.04)" : "rgba(255,255,255,0.05)", padding: "8px 12px", borderRadius: 14 }}>Raised: LKR {req.amountRaised.toLocaleString()}</span>
                  <span style={{ fontSize: 13, color: goalReached ? "#ef4444" : COLORS.mint, background: isLight ? "rgba(15,23,42,0.04)" : "rgba(255,255,255,0.05)", padding: "8px 12px", borderRadius: 14 }}>
                    {goalReached ? "Fully funded" : `Remaining: LKR ${remaining.toLocaleString()}`}
                  </span>
                </div>
                <div style={{ width: "100%", maxWidth: 420, height: 8, background: isLight ? "rgba(15,23,42,0.08)" : "rgba(255,255,255,0.1)", borderRadius: 999 }}>
                  <div style={{ height: "100%", background: COLORS.amber, borderRadius: 999, width: `${Math.min((req.amountRaised / req.amountNeeded) * 100, 100)}%` }} />
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                <button 
                  onClick={() => !goalReached && handleDonate(req)}
                  disabled={goalReached}
                  style={{ background: goalReached ? "rgba(148,163,184,0.35)" : COLORS.amber, color: goalReached ? "#64748b" : COLORS.forest, border: "none", padding: "14px 26px", borderRadius: 14, fontWeight: 700, cursor: goalReached ? "not-allowed" : "pointer", minWidth: 120 }}
                >
                  {goalReached ? "Funded" : "Donate Now"}
                </button>
              </div>
            </div>
          );})}
        </div>
      )}

      <DonationCheckoutModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        fundraiser={selectedReq}
        onSuccess={(donationData) => {
          reload();
          if (donationData && donationData._id) {
            setDonationId(donationData._id);
            setPaymentStep(2);
          }
        }}
        onOnlinePay={handleOnlinePay}
        currentUserId={user?._id}
      />

      {/* Feedback Modal */}
      {paymentStep === 2 && createPortal(
        <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999999, padding: 20, boxSizing: "border-box" }}>
          <div style={{ background: isLight ? "#fff" : "#1a3a2a", padding: 32, borderRadius: 12, width: 450, border: isLight ? "1px solid rgba(15,23,42,0.12)" : "1px solid rgba(255,255,255,0.1)", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.4)" }}>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <h3 style={{ color: isLight ? "#111" : "white", fontSize: 18, fontWeight: 700, margin: "0 0 6px" }}>
                ⭐ Rate Your Experience
              </h3>
              <p style={{ color: isLight ? "rgba(17,24,39,0.7)" : "rgba(255,255,255,0.65)", fontSize: 13, margin: 0 }}>
                Help others by rating this NGO's fundraiser
              </p>
            </div>
            
            <div style={{ marginBottom: 16, textAlign: "center" }}>
              <label style={{ display: "block", color: isLight ? "rgba(17,24,39,0.85)" : "rgba(255,255,255,0.85)", fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
                Select Rating *
              </label>
              <div style={{ display: "inline-block" }}>
                <RatingStars rating={feedback.rating} onRatingChange={r => setFeedback({...feedback, rating: r})} size={36} />
              </div>
            </div>
            
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", color: isLight ? "rgba(17,24,39,0.85)" : "rgba(255,255,255,0.85)", fontSize: 14, fontWeight: 600, marginBottom: 6 }}>
                📝 Add Comments (Optional)
              </label>
              <textarea 
                value={feedback.comment} 
                onChange={e => setFeedback({...feedback, comment: e.target.value})} 
                placeholder="Describe your experience with this fundraiser..."
                maxLength={500}
                style={{ 
                  width: "100%", 
                  minHeight: 80, 
                  padding: 12, 
                  background: isLight ? "#f8fafc" : "rgba(0,0,0,0.2)",
                  border: isLight ? "1px solid rgba(15,23,42,0.12)" : `1px solid ${COLORS.amber}60`,
                  borderRadius: 12,
                  color: isLight ? "#111" : "white",
                  fontSize: 14,
                  resize: "vertical",
                  boxSizing: "border-box",
                }} 
              />
              <div style={{ fontSize: 12, color: isLight ? "rgba(15,23,42,0.6)" : "rgba(255,255,255,0.7)", marginTop: 4, textAlign: "right" }}>
                {feedback.comment.length} / 500
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
              <button 
                onClick={() => setPaymentStep(0)} 
                style={{ 
                  flex: 1, 
                  background: isLight ? "rgba(15,23,42,0.05)" : "rgba(255,255,255,0.1)", 
                  color: isLight ? "#111" : "white", 
                  padding: "12px", 
                  border: "none", 
                  borderRadius: 12, 
                  cursor: "pointer",
                  fontSize: 15,
                  fontWeight: 600
                }}
              >
                Skip
              </button>
              <button 
                disabled={loading || feedback.rating === 0} 
                onClick={submitFeedback} 
                style={{ 
                  flex: 2, 
                  background: feedback.rating === 0 ? (isLight ? "rgba(15,23,42,0.05)" : "rgba(255,255,255,0.1)") : COLORS.amber, 
                  color: feedback.rating === 0 ? (isLight ? "rgba(17,24,39,0.4)" : "rgba(255,255,255,0.4)") : COLORS.forest, 
                  padding: "12px", 
                  border: "none", 
                  borderRadius: 12, 
                  cursor: feedback.rating === 0 ? "not-allowed" : loading ? "wait" : "pointer", 
                  fontSize: 15,
                  fontWeight: 700,
                  transition: "all 0.3s ease",
                  opacity: loading ? 0.8 : 1
                }}
              >
                {loading ? "⏳ Submitting..." : "✅ Submit Feedback"}
              </button>
            </div>
            
            <p style={{ fontSize: 11, color: isLight ? "rgba(15,23,42,0.5)" : "rgba(255,255,255,0.4)", marginTop: 16, marginBottom: 0, textAlign: "center" }}>
              * Rating is required. Your feedback helps maintain quality standards.
            </p>
          </div>
        </div>,
        document.body
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
              <a href={viewDocUrl} target="_blank" rel="noreferrer" style={{ color: COLORS.amber, textDecoration: "none", fontWeight: 600, fontSize: 14 }}>Open Original File ↗</a>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

export default function DonorDashboard({ theme }) {
  const navigate = useNavigate();
  const [active, setActive] = useState("donorHome");
  const [donations, setDonations] = useState([]);
  const [stats, setStats] = useState({});
  const [ratingStats, setRatingStats] = useState(null);
  const [donorRequests, setDonorRequests] = useState([]);
  const [fundRequests, setFundRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user") || "null"));

  const onLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const loadData = async () => {
    try {
      const resStats = await getMyStats();
      setStats(resStats.stats || {});
      const resDonations = await getMyDonations();
      setDonations(resDonations.data || []);
      const reqRes = await getRequests();
      setDonorRequests(reqRes.data || []);
      const fundReqRes = await getMoneyRequests().catch(() => ({ data: [] }));
      setFundRequests(fundReqRes.data || []);

      // Load rating stats
      if (user?._id) {
        try {
          const ratingRes = await getDonorRatingStats(user._id);
          if (ratingRes.success) {
            setRatingStats(ratingRes);
          }
        } catch (err) {
          console.error("Error loading rating stats:", err);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteDonation = async (id) => {
    if (!window.confirm("Are you sure you want to delete this donation?")) return;
    try {
      await deleteDonation(id);
      toast.success("Donation deleted successfully!");
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete donation");
    }
  };

  useEffect(() => {
    loadData();

    // Notification polling
    let intervalId;
    const fetchNotifications = async () => {
      try {
        const res = await getNotifications();
        const allNotifs = res.data || [];
        setNotifications(allNotifs);
        const unread = allNotifs.filter(n => !n.read);
        if (unread.length > 0) {
          await markNotificationsAsRead();
        }
      } catch (err) {
        console.error("Error fetching notifications", err);
      }
    };
    
    fetchNotifications();
    intervalId = setInterval(fetchNotifications, 10000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (!user?._id) return;
    const socket = io(`http://${window.location.hostname}:5000`);
    socket.emit("join_user_room", user._id);
    
    socket.on("new_notification", (notif) => {
      setNotifications(prev => [notif, ...prev]);
      toast(notif.message, { 
        icon: notif.type === "new_message" ? "💬" : "🔔",
        style: { borderRadius: '10px', background: '#333', color: '#fff' },
        duration: 4000
      });
    });

    socket.on("admin_deleted_item", () => {
      setRefreshTrigger(prev => prev + 1);
      loadData();
    });
    
    return () => {
      socket.disconnect();
    };
  }, [user?._id]);

  const handleRequestAction = async (requestId, status) => {
    try {
      await updateRequest(requestId, { status });
      toast.success(`Request ${status} successfully!`);
      loadData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update request");
    }
  };

  const pages = {
    donorHome: <DonorHome setActive={setActive} user={user} stats={stats} recentDonations={donations} ratingStats={ratingStats} theme={theme} />,
    donate: <DonateForm setActive={setActive} reloadDonations={loadData} theme={theme} />,
    myDonations: <MyDonations donations={donations} onDelete={handleDeleteDonation} theme={theme} />,
    fundraisers: <FundraisersPage fundRequests={fundRequests} reload={loadData} theme={theme} user={user} />,
    impact: <ImpactPage stats={stats} theme={theme} />,
    requests: <RequestsPage requests={donorRequests} onRequestAction={handleRequestAction} theme={theme} user={user} />,
    feedbacks: <FeedbacksPage theme={theme} refreshTrigger={refreshTrigger} />,
    notifications: <NotificationsPage notifications={notifications} setNotifications={setNotifications} theme={theme} />,
    profile: <ProfilePage user={user} setUser={setUser} theme={theme} />,
  };

  return (
    <DashboardLayout 
      role="donor" 
      activePage={active} 
      onNav={setActive} 
      onLogout={onLogout} 
      user={user}
      theme={theme}
    >
      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulseDot { 0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(232, 146, 58, 0.7); } 70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(232, 146, 58, 0); } 100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(232, 146, 58, 0); } }
      `}</style>
      
      {/* Animated Notification Bell Top Right */}
      <div 
        onClick={() => setActive("notifications")}
        style={{
          position: "absolute",
          top: 24,
          right: 36,
          width: 44,
          height: 44,
          borderRadius: "50%",
          background: theme === "light" ? "rgba(15,23,42,0.08)" : "rgba(255,255,255,0.06)",
          border: theme === "light" ? "1px solid rgba(15,23,42,0.12)" : "1px solid rgba(255,255,255,0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 20,
          cursor: "pointer",
          zIndex: 100,
          transition: "all 0.2s"
        }}
        onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
        onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
        title="Notifications"
      >
        🔔
        {notifications.filter(n => !n.read).length > 0 && (
          <div style={{
            position: "absolute",
            top: 10,
            right: 12,
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: COLORS.amber,
            animation: "pulseDot 2s infinite"
          }} />
        )}
      </div>

      <div
        style={{
          animation: "slideUp 0.3s ease forwards",
          maxHeight: "calc(100vh - 120px)",
          overflowY: "auto",
          overflowX: "hidden",
          paddingRight: 12,
          paddingBottom: 20,
          color: theme === "light" ? "#111" : "inherit",
        }}
        key={active}
      >
        {pages[active] || pages.donorHome}
      </div>
    </DashboardLayout>
  );
}


