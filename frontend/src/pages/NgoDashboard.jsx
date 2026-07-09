import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import StatCard from "../components/StatCard";
import Input from "../components/Input";
import Btn from "../components/Btn";
import LocationSelector from "../components/LocationSelector";
import RatingStars from "../components/RatingStars";
import FeedbackForm from "../components/FeedbackForm";
import { getDonations } from "../api/donation";
import { verifyAuth } from "../api/auth";
import { createRequest, getRequests, updateRequest } from "../api/request";
import { getNotifications } from "../api/notification";
import { getMySubmittedFeedbacks, getMyReceivedFeedbacks } from "../api/feedback";
import { createMoneyRequest, getMoneyRequests } from "../api/moneyRequest";
import { getNgoMoneyDonations, confirmPendingDonation, cancelPendingDonation, METHOD_LABELS } from "../api/moneyDonation";
import { COLORS } from "../theme";
import toast from "react-hot-toast";
import ChatWidget from "../components/ChatWidget";
import io from "socket.io-client";
import MapComponent from "../components/MapComponent";
import Leaderboard from "../components/Leaderboard";

// ─── REUSABLE UI COMPONENTS (Internal for NGO Dashboard specific logic) ────
function Badge({ children, color = "amber" }) {
  const colors = {
    amber: { bg: "rgba(232,146,58,0.18)", text: COLORS.amberLight },
    green: { bg: "rgba(46,155,78,0.2)", text: COLORS.mint },
    red: { bg: "rgba(231,76,60,0.18)", text: "#f1948a" },
    blue: { bg: "rgba(107,140,255,0.2)", text: "#7ec8a0" },
    gray: { bg: "rgba(255,255,255,0.1)", text: "rgba(255,255,255,0.55)" },
  };
  const c = colors[color] || colors.gray;
  return <span style={{ background: c.bg, color: c.text, fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 20, whiteSpace: "nowrap" }}>{children}</span>;
}

function Tag({ children, icon }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.65)", padding: "4px 10px", borderRadius: 8 }}>
      {icon && <span>{icon}</span>}{children}
    </span>
  );
}

function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }} onClick={onClose}>
      <div style={{ background: "linear-gradient(160deg, #1a3a2a, #152a20)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 20, padding: "32px 36px", width: "100%", maxWidth: 480, boxShadow: "0 24px 80px rgba(0,0,0,0.6)", animation: "slideUp 0.25s ease forwards" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "white" }}>{title}</h3>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 8, color: "white", width: 32, height: 32, cursor: "pointer", fontSize: 16 }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function DonationCard({ donation, onRequest, onViewDetails, requested }) {
  const isVeg = donation.foodType === "veg";
  const typeLabel = isVeg ? "Veg" : "Non-Veg";
  
  return (
    <div style={{ 
      background: "rgba(25, 35, 29, 0.6)", 
      border: "1px solid rgba(255,255,255,0.08)", 
      borderRadius: 24, 
      overflow: "hidden",
      display: "flex", 
      flexDirection: "column", 
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
    }}
      onMouseEnter={e => { 
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 20px 40px rgba(0,0,0,0.4)";
        e.currentTarget.style.borderColor = "rgba(126, 200, 160, 0.3)";
      }}
      onMouseLeave={e => { 
        e.currentTarget.style.transform = "none";
        e.currentTarget.style.boxShadow = "0 10px 30px rgba(0,0,0,0.2)";
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
      }}>
      
      {/* Image Header */}
      <div style={{ position: "relative", height: 160, width: "100%", background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {donation.image ? (
          <img src={donation.image} alt={donation.foodName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <span style={{ fontSize: 48, filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.3))" }}>🍱</span>
        )}
        
        {/* Gradients */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(25, 35, 29, 1) 0%, rgba(25, 35, 29, 0) 100%)" }} />
        
        {/* Badges on Image */}
        <div style={{ position: "absolute", top: 12, right: 12, display: "flex", gap: 8 }}>
          {donation.isEmergency && (
            <span style={{ 
              background: "rgba(231,76,60,0.95)", 
              color: "white", fontSize: 11, fontWeight: 800, padding: "4px 10px", borderRadius: 20,
              backdropFilter: "blur(4px)", boxShadow: "0 0 15px rgba(231,76,60,0.8)"
            }}>🚨 URGENT</span>
          )}
          <span style={{ 
            background: isVeg ? "rgba(46,155,78,0.9)" : "rgba(231,76,60,0.9)", 
            color: "white", fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20,
            backdropFilter: "blur(4px)", boxShadow: "0 4px 10px rgba(0,0,0,0.2)"
          }}>{typeLabel}</span>
        </div>
        
        {/* Title over Image */}
        <div style={{ position: "absolute", bottom: 12, left: 16, right: 16 }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: "white", textShadow: "0 2px 4px rgba(0,0,0,0.5)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {donation.foodName}
          </div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", textShadow: "0 1px 2px rgba(0,0,0,0.5)", display: "flex", alignItems: "center", gap: 6 }}>
            <span>🏢</span> {donation.donor?.name || "Anonymous Donor"}
          </div>
        </div>
      </div>

      {/* Content Body */}
      <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 16, flex: 1 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(126, 200, 160, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: COLORS.mint, fontSize: 14 }}>📦</div>
            <div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", fontWeight: 700, letterSpacing: 0.5 }}>Quantity</div>
              <div style={{ fontSize: 12, color: "white", lineHeight: "1.4" }}>
                <div style={{ color: "rgba(255,255,255,0.7)" }}>Orig: {donation.originalQuantity || donation.quantity} {donation.unit}</div>
                <div style={{ color: "rgba(255,255,255,0.7)" }}>Claimed: {(donation.originalQuantity || donation.quantity) - donation.quantity} {donation.unit}</div>
                <div style={{ fontWeight: 600 }}>Rem: {donation.quantity} {donation.unit}</div>
              </div>
            </div>
          </div>
          {donation.peopleServed > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(232,146,58,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: COLORS.amberLight, fontSize: 14 }}>👥</div>
              <div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", fontWeight: 700, letterSpacing: 0.5 }}>Serves</div>
                <div style={{ fontSize: 13, color: "white", fontWeight: 600 }}>{donation.peopleServed} People</div>
              </div>
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 8, gridColumn: "1/-1" }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(107,140,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#7ec8a0", fontSize: 14 }}>📍</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", fontWeight: 700, letterSpacing: 0.5 }}>Location</div>
              <div style={{ fontSize: 13, color: "white", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {typeof donation.location === 'object' ? donation.location?.address : donation.location}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, gridColumn: "1/-1" }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(231,76,60,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#f1948a", fontSize: 14 }}>⏰</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", fontWeight: 700, letterSpacing: 0.5 }}>Expires</div>
              <div style={{ fontSize: 13, color: "white", fontWeight: 600 }}>{new Date(donation.expiryTime).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: 10, marginTop: "auto", paddingTop: 8 }}>
          <Btn variant="secondary" onClick={() => onViewDetails(donation)} style={{ width: "auto", flex: "0 0 auto", padding: "12px 18px", background: "rgba(255,255,255,0.05)" }}>ℹ️</Btn>
          {requested ? (
            <Btn variant="secondary" disabled style={{ flex: 1, background: "rgba(46,155,78,0.1)", color: COLORS.mint, borderColor: "rgba(46,155,78,0.2)" }}>✅ Requested</Btn>
          ) : (
            <Btn style={{ flex: 1, background: "linear-gradient(135deg, #2e9b4e 0%, #1c6d35 100%)", color: "white", border: "none", boxShadow: "0 4px 12px rgba(46,155,78,0.3)" }} onClick={() => onRequest(donation)}>Request Food</Btn>
          )}
        </div>
      </div>
    </div>
  );
}

function getTimeGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

const getMethodLabel = (don) => METHOD_LABELS[don.donationMethod] || don.donationMethod;

// ─── PAGE: DASHBOARD ──────────────────────────────────────────────────────────
function DashboardPage({ availableDonations, requests, onNav, user, fundDonations, feedbacks }) {
  const accepted = requests.filter(r => r.status === "accepted").length;
  const completed = requests.filter(r => r.status === "completed").length;
  const greeting = getTimeGreeting();

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ color: "white", fontSize: 28, margin: "0 0 5px" }}>{greeting}, {user?.name || "NGO"}! 🌿</h2>
        <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 15, margin: 0 }}>Here's what's available near you today</p>
      </div>
      <div style={{ display: "flex", gap: 14, marginBottom: 28, flexWrap: "wrap" }}>
        <StatCard icon="🍱" label="Available Now" value={availableDonations.length} color={COLORS.mint} sub="Near you" onClick={() => onNav("browse")} />
        <StatCard icon="📋" label="My Requests" value={requests.length} color="white" sub="Total" onClick={() => onNav("myRequests")} />
        <StatCard icon="✅" label="Accepted" value={accepted} color={COLORS.mint} sub="Ready for pickup" />
        <StatCard icon="🏆" label="Completed" value={completed} color={COLORS.amberLight} sub="Pickups done" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 14, marginBottom: 22 }}>
        <div>
          <Leaderboard />
        </div>
      </div>

      {/* Available Donations Preview */}
      <div style={{ background: "rgba(126, 200, 160, 0.07)", border: `1px solid rgba(126, 200, 160, 0.2)`, borderRadius: 18, padding: "22px", marginBottom: 22 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 18, fontWeight: 700, color: "white" }}>
            <span>🗺️</span>
            <span>Available Food Near You</span>
          </div>
          <span onClick={() => onNav("browse")} style={{ fontSize: 13, color: COLORS.mint, cursor: "pointer", fontWeight: 600 }}>See all →</span>
        </div>
        {availableDonations.length === 0 ? <p style={{color: "rgba(255,255,255,0.4)"}}>No food available right now.</p> : null}
        {availableDonations.slice(0, 3).map(d => (
          <div key={d._id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
            <span style={{ fontSize: 26, width: 36, textAlign: "center" }}>🍱</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "white" }}>{d.foodName}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)" }}>{d.donor?.name} · {d.quantity} {d.unit} · Exp: {new Date(d.expiryTime).toLocaleDateString()}</div>
            </div>
            <Tag icon="📍">{typeof d.location === 'object' ? d.location?.address : d.location}</Tag>
          </div>
        ))}
        {availableDonations.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <Btn onClick={() => onNav("browse")} style={{ width: "100%", padding: "12px", background: "rgba(255,255,255,0.05)", color: "white" }}>Browse All Available Food →</Btn>
          </div>
        )}
      </div>

      {/* Recent Requests */}
      {requests.length > 0 && (
        <div style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 18, padding: "22px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "white" }}>📋 My Recent Requests</div>
            <span onClick={() => onNav("myRequests")} style={{ fontSize: 13, color: "white", cursor: "pointer", fontWeight: 600 }}>View all →</span>
          </div>
          {requests.slice(0, 3).map((r) => {
            const requestFeedback = feedbacks?.find(f => f.requestId === r._id);
            return (
            <div key={r._id} style={{ padding: "11px 0", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <span style={{ fontSize: 24 }}>📋</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "white" }}>{r.foodId?.foodName}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)" }}>{r.foodId?.donor?.name} · {r.qty} {r.foodId?.unit || 'units'} · Requested {new Date(r.createdAt).toLocaleDateString()}</div>
                </div>
                <Badge color={r.status === "accepted" ? "green" : r.status === "rejected" ? "red" : r.status === "completed" ? "blue" : "amber"}>
                  {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                </Badge>
              </div>
              {requestFeedback && (
                <div style={{ marginTop: 10, padding: "10px", background: "rgba(255,255,255,0.04)", borderRadius: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                   <div style={{ fontSize: 13, color: "rgba(255,255,255,0.8)" }}>My Feedback:</div>
                   <div style={{ textAlign: "right" }}>
                     <RatingStars rating={requestFeedback.rating} readOnly size={14} />
                     {requestFeedback.comment && <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 4, fontStyle: "italic" }}>"{requestFeedback.comment}"</div>}
                   </div>
                </div>
              )}
            </div>
            );
          })}
        </div>
      )}

      {/* Recent Money Donations Feed */}
      {fundDonations && fundDonations.length > 0 && (
        <div style={{ background: "rgba(126, 200, 160, 0.04)", border: "1px solid rgba(126, 200, 160, 0.15)", borderRadius: 18, padding: "22px", marginTop: 22 }}>
          <h3 style={{ color: "white", fontSize: 18, marginTop: 0, marginBottom: 14 }}>💸 Recent Money Donations</h3>
          {fundDonations.slice(0, 3).map(don => (
            <div key={don._id} style={{ background: "rgba(126, 200, 160, 0.08)", border: "1px solid rgba(126, 200, 160, 0.24)", borderRadius: 18, padding: "18px 20px", marginBottom: 14, boxShadow: "0 16px 50px rgba(0,0,0,0.08)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                <div>
                  <div style={{ color: "white", fontWeight: 600 }}>{don.donorId?.name} donated LKR {don.amount.toLocaleString()}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>For: {don.moneyRequestId?.purpose}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 4 }}>
                    {getMethodLabel(don)}{don.isRecurring ? " • 🔁 Monthly" : ""}
                    {don.confirmedAt ? ` • Confirmed ${new Date(don.confirmedAt).toLocaleDateString()}` : ""}
                  </div>
                </div>
                {don.feedback && don.feedback.rating ? (
                   <div style={{ textAlign: "right" }}>
                     <RatingStars rating={don.feedback.rating} readOnly size={16} />
                     {don.feedback.comment && <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 4, fontStyle: "italic" }}>"{don.feedback.comment}"</div>}
                   </div>
                ) : <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>No feedback</span>}
              </div>
            </div>
          ))}
          <div style={{ marginTop: 16 }}>
             <Btn onClick={() => onNav("fundRequests")} style={{ width: "100%", padding: "12px", background: "rgba(255,255,255,0.05)", color: "white" }}>View All Fund Requests & Donations →</Btn>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── PAGE: BROWSE ─────────────────────────────────────────────────────────────
function BrowsePage({ donations, requests, onRequest, user }) {
  const [search, setSearch] = useState("");
  const [district, setDistrict] = useState("");
  const [place, setPlace] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [detailDonation, setDetailDonation] = useState(null);
  const [requestModal, setRequestModal] = useState(null);
  const [reqQty, setReqQty] = useState("");
  const [reqMsg, setReqMsg] = useState("");
  const [ngoCurrentLoc, setNgoCurrentLoc] = useState(() => user?.officeLocation || null);

  const filtered = donations.filter(d => {
    const foodNameStr = (d.foodName || "").toLowerCase();
    const donorNameStr = (d.donor?.name || "").toLowerCase();
    const searchStr = search.toLowerCase();
    const matchSearch = foodNameStr.includes(searchStr) || donorNameStr.includes(searchStr);
    
    const locStr = (typeof d.location === 'object' ? d.location?.address : d.location) || "";
    const matchDistrict = district ? locStr.includes(district) : true;
    const matchPlace = place ? locStr.includes(place) : true;
    const matchType = typeFilter === "all" || d.foodType === typeFilter;
    return matchSearch && matchDistrict && matchPlace && matchType;
  });

  const isRequested = (id) => requests.some(r => r.foodId?._id === id);

  const handleRequestSubmit = () => {
    if (!reqQty) return;
    if (Number(reqQty) > requestModal.quantity) {
      alert("Requested quantity cannot exceed available remaining quantity.");
      return;
    }
    onRequest(requestModal, reqQty, reqMsg);
    setRequestModal(null);
    setReqQty("");
    setReqMsg("");
  };

  return (
    <div>
      <h2 style={{ color: "white", fontSize: 26, margin: "0 0 22px" }}>🔍 Browse Available Food</h2>

      {/* Search & Filters */}
      <div style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 16, padding: "20px", marginBottom: 22 }}>
        <Input placeholder="Search by food name or donor..." value={search} onChange={e => setSearch(e.target.value)} icon="🔍" />
        <LocationSelector 
          district={district} 
          setDistrict={(val) => { setDistrict(val); setPlace(""); }} 
          place={place} 
          setPlace={setPlace}
          label="Filter by Location"
        />
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: "16px" }}>
          {["all", "veg", "non-veg"].map(f => (
            <button key={f} onClick={() => setTypeFilter(f)} style={{ padding: "8px 18px", borderRadius: 20, border: `1px solid ${typeFilter === f ? "rgba(126, 200, 160, 0.5)" : "rgba(255,255,255,0.15)"}`, background: typeFilter === f ? "rgba(126, 200, 160, 0.2)" : "rgba(255,255,255,0.05)", color: typeFilter === f ? COLORS.mint : "rgba(255,255,255,0.6)", fontSize: 13, cursor: "pointer", fontWeight: typeFilter === f ? 600 : 400, textTransform: "capitalize", transition: "all 0.15s" }}>
              {f === "all" ? "🍽️ All" : f === "veg" ? "🥦 Veg" : "🍗 Non-Veg"}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "rgba(255,255,255,0.4)" }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>🫙</div>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: "rgba(255,255,255,0.7)" }}>No food available</div>
          <p style={{ margin: 0, fontSize: 14 }}>Try adjusting your filters or check back later</p>
        </div>
      ) : (
        <>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", marginBottom: 14 }}>{filtered.length} donation{filtered.length !== 1 ? "s" : ""} found</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {filtered.map(d => (
              <DonationCard key={d._id} donation={d} requested={isRequested(d._id)} onRequest={setRequestModal} onViewDetails={setDetailDonation} />
            ))}
          </div>
        </>
      )}

      {/* Details Modal */}
      <Modal open={!!detailDonation} onClose={() => setDetailDonation(null)} title="Donation Details">
        {detailDonation && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
              {detailDonation.image ? (
                <img src={detailDonation.image} alt="food" style={{ width: 60, height: 60, borderRadius: 16, objectFit: "cover" }} />
              ) : (
                <div style={{ width: 60, height: 60, borderRadius: 16, background: "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>🍱</div>
              )}
              <div>
              {detailDonation.claims && detailDonation.claims.length > 0 && (
                <div style={{ fontSize: 14, color: "rgba(255,255,255,0.55)" }}>{detailDonation.donor?.name}</div>
              )}
              </div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 14, padding: "16px", marginBottom: 18 }}>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", lineHeight: 1.7, margin: 0 }}>{detailDonation.description}</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
              {[
                ["📦 Original Qty", `${detailDonation.originalQuantity || detailDonation.quantity} ${detailDonation.unit}`],
                ["📉 Claimed Qty", `${(detailDonation.originalQuantity || detailDonation.quantity) - detailDonation.quantity} ${detailDonation.unit}`],
                ["✨ Remaining Qty", `${detailDonation.quantity} ${detailDonation.unit}`],
                ["📍 Location", typeof detailDonation.location === 'object' ? detailDonation.location?.address : detailDonation.location], 
                ["⏰ Expiry", new Date(detailDonation.expiryTime).toLocaleString()], 
                ["🌿 Type", detailDonation.foodType === 'veg' ? 'Veg' : 'Non-Veg']
              ].map(([k, v]) => (
                <div key={k} style={{ background: "rgba(255,255,255,0.06)", borderRadius: 10, padding: "12px 14px" }}>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", marginBottom: 4 }}>{k}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "white" }}>{v}</div>
                </div>
              ))}
            </div>
            {/* Map showing route from NGO (if available) to donor location */}
            {typeof detailDonation.location === 'object' && detailDonation.location?.lat && detailDonation.location?.lng && (
              <div style={{ marginBottom: 16 }}>
                <MapComponent
                  height="220px"
                  readOnly={true}
                  routeFrom={ngoCurrentLoc ? [ngoCurrentLoc.lat, ngoCurrentLoc.lng] : null}
                  routeTo={[detailDonation.location.lat, detailDonation.location.lng]}
                  markers={[]}
                />
              </div>
            )}

            {/* attempt to resolve NGO geolocation when details open */}
            {detailDonation && navigator.geolocation && !ngoCurrentLoc && (function(){
              try { navigator.geolocation.getCurrentPosition(pos => setNgoCurrentLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude })); } catch { /* ignore */ }
              return null;
            })()}
            
            {detailDonation.claims && detailDonation.claims.length > 0 && (
              <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: "14px", marginBottom: 20 }}>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginBottom: 10, fontWeight: 600 }}>👥 Claimed By:</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {detailDonation.claims.map((claim, idx) => (
                    <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.03)", padding: "8px 12px", borderRadius: 8 }}>
                      <span style={{ fontSize: 14, color: "white" }}>{claim.ngoId?.name || "Unknown NGO"}</span>
                      <span style={{ fontSize: 14, color: COLORS.amberLight, fontWeight: 600 }}>{claim.quantityRequested} {detailDonation.unit}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {isRequested(detailDonation._id) ? (
              <Btn variant="secondary" disabled style={{ width: "100%", background: "rgba(255,255,255,0.05)" }}>✅ Already Requested</Btn>
            ) : (
              <Btn style={{ width: "100%", background: COLORS.mint, color: COLORS.forest }} onClick={() => { setDetailDonation(null); setRequestModal(detailDonation); }}>Request This Food →</Btn>
            )}
          </div>
        )}
      </Modal>

      {/* Request Modal */}
      <Modal open={!!requestModal} onClose={() => setRequestModal(null)} title={`Request: ${requestModal?.foodName}`}>
        {requestModal && (
          <div>
            <div style={{ background: "rgba(126, 200, 160, 0.1)", border: "1px solid rgba(126, 200, 160, 0.3)", borderRadius: 12, padding: "14px", marginBottom: 20, fontSize: 14, color: "rgba(255,255,255,0.75)" }}>
              Available: <strong style={{ color: "white" }}>{requestModal.quantity} {requestModal.unit}</strong> from {requestModal.donor?.name}
            </div>
            <Input label="Requested Quantity *" type="number" max={requestModal.quantity} placeholder={`Max ${requestModal.quantity} ${requestModal.unit}`} value={reqQty} onChange={e => setReqQty(e.target.value)} icon="📦" />
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.55)", letterSpacing: "1.2px", textTransform: "uppercase", marginBottom: 7 }}>Message (Optional)</label>
              <textarea placeholder="Any special notes for the donor..." value={reqMsg} onChange={e => setReqMsg(e.target.value)} style={{ width: "100%", padding: "13px 14px", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 10, color: "white", fontSize: 14, outline: "none", resize: "vertical", minHeight: 80, boxSizing: "border-box" }} />
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <Btn variant="secondary" onClick={() => setRequestModal(null)} style={{ flex: "0 0 auto", padding: "12px 20px" }}>Cancel</Btn>
              <Btn onClick={handleRequestSubmit} disabled={!reqQty} style={{ flex: 1, background: COLORS.mint, color: COLORS.forest }}>Send Request 🚀</Btn>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

// ─── PAGE: MY REQUESTS ────────────────────────────────────────────────────────
function MyRequestsPage({ requests, onPickup, user }) {
  const [filter, setFilter] = useState("all");
  const [confirmPickup, setConfirmPickup] = useState(null);
  const [activeChat, setActiveChat] = useState(null);
  const statusMap = { pending: "amber", accepted: "green", rejected: "red", completed: "blue" };

  const filtered = filter === "all" ? requests : requests.filter(r => r.status === filter);

  const counts = { all: requests.length, pending: requests.filter(r => r.status === "pending").length, accepted: requests.filter(r => r.status === "accepted").length, completed: requests.filter(r => r.status === "completed").length };

  return (
    <div>
      <h2 style={{ color: "white", fontSize: 26, margin: "0 0 22px" }}>📋 My Requests</h2>
      <div style={{ display: "flex", gap: 8, marginBottom: 22, flexWrap: "wrap" }}>
        {[["all", "All"], ["pending", "Pending"], ["accepted", "Accepted"], ["completed", "Completed"]].map(([val, label]) => (
          <button key={val} onClick={() => setFilter(val)} style={{ padding: "9px 20px", borderRadius: 22, border: `1px solid ${filter === val ? "rgba(126, 200, 160, 0.5)" : "rgba(255,255,255,0.15)"}`, background: filter === val ? "rgba(126, 200, 160, 0.2)" : "rgba(255,255,255,0.05)", color: filter === val ? COLORS.mint : "rgba(255,255,255,0.6)", fontSize: 13, cursor: "pointer", fontWeight: filter === val ? 600 : 400, transition: "all 0.15s" }}>
            {label} {counts[val] > 0 && <span style={{ background: "rgba(255,255,255,0.15)", padding: "2px 7px", borderRadius: 10, marginLeft: 5, fontSize: 11 }}>{counts[val]}</span>}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "rgba(255,255,255,0.4)" }}>
          <div style={{ fontSize: 52, marginBottom: 14 }}>🫙</div>
          <div style={{ fontSize: 15 }}>No requests matching this status.</div>
        </div>
      ) : (
        filtered.map((r) => (
          <React.Fragment key={r._id}>
            <div style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 16, padding: "18px 22px", marginBottom: 12, display: "flex", alignItems: "center", gap: 16 }}>
              {r.foodId?.image ? (
               <img src={r.foodId.image} alt="food" style={{ width: 44, height: 44, borderRadius: 10, objectFit: "cover" }} />
            ) : <span style={{ fontSize: 34, width: 44, textAlign: "center" }}>🍱</span>}
            
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "white", marginBottom: 4 }}>{r.foodId?.foodName}</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.55)" }}>{r.foodId?.donor?.name} · {r.qty} {r.foodId?.unit} · Requested {new Date(r.createdAt).toLocaleDateString()}</div>
              {r.message && <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 4, fontStyle: "italic" }}>"{r.message}"</div>}
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {r.status === "accepted" && (
                  <button 
                    onClick={() => setActiveChat({ requestId: r._id, otherUserId: r.foodId?.donor?._id })}
                    style={{ background: "rgba(255,255,255,0.1)", color: "white", border: "none", padding: "6px 12px", borderRadius: 16, cursor: "pointer", fontSize: 12, fontWeight: 600 }}
                  >
                    💬 Chat
                  </button>
                )}
                <Badge color={statusMap[r.status]}>{r.status.charAt(0).toUpperCase() + r.status.slice(1)}</Badge>
              </div>
              {r.status === "accepted" && (
                <Btn style={{background: COLORS.mint, color: COLORS.forest}} size="sm" onClick={() => setConfirmPickup(r)}>Mark Picked Up</Btn>
              )}
            </div>
          </div>
          {activeChat?.requestId === r._id && (
            <div style={{ marginTop: -4, marginBottom: 16, display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
              <button onClick={() => setActiveChat(null)} style={{ background: "transparent", color: "#e74c3c", border: "none", cursor: "pointer", fontSize: 12, marginBottom: 8, fontWeight: 600 }}>✖ Close Chat</button>
              <ChatWidget requestId={r._id} currentUserId={user?._id} currentUserRole="ngo" />
            </div>
          )}
          </React.Fragment>
        ))
      )}

      <Modal open={!!confirmPickup} onClose={() => setConfirmPickup(null)} title="Confirm Pickup">
        {confirmPickup && (
          <div>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.7)", lineHeight: 1.6 }}>
              Are you confirming pickup of <strong style={{ color: "white" }}>{confirmPickup.qty} {confirmPickup.foodId?.unit}</strong> of <strong style={{ color: "white" }}>{confirmPickup.foodId?.foodName}</strong> from {confirmPickup.foodId?.donor?.name}?
            </p>
            <div style={{ background: "rgba(46,155,78,0.1)", border: "1px solid rgba(46,155,78,0.25)", borderRadius: 12, padding: "14px 16px", marginBottom: 22, fontSize: 13, color: "rgba(255,255,255,0.7)" }}>
              ✅ This will mark the donation request as completed. Please make sure you have received the food.
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <Btn variant="secondary" onClick={() => setConfirmPickup(null)} style={{ flex: 1 }}>Cancel</Btn>
              <Btn style={{background: COLORS.mint, color: COLORS.forest, flex: 1}} onClick={() => { onPickup(confirmPickup); setConfirmPickup(null); }}>✅ Confirm Pickup</Btn>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

// ─── PAGE: PICKUPS ────────────────────────────────────────────────────────────
function PickupsPage({ requests }) {
  const completed = requests.filter(r => r.status === "completed");
  return (
    <div>
      <h2 style={{ color: "white", fontSize: 26, margin: "0 0 22px" }}>✅ Pickup History</h2>
      <div style={{ display: "flex", gap: 14, marginBottom: 24 }}>
        <StatCard icon="🏆" label="Total Pickups" value={completed.length} color={COLORS.amberLight} />
        <StatCard icon="🍱" label="Meals Received" value={completed.reduce((a, r) => a + parseInt(r.qty || 0), 0)} color={COLORS.mint} />
      </div>
      {completed.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "rgba(255,255,255,0.4)" }}>
          <div style={{ fontSize: 52, marginBottom: 14 }}>🫙</div>
          <div>No completed pickups yet. Accept requests and mark them as picked up!</div>
        </div>
      ) : completed.map((r) => (
        <div key={r._id} style={{ background: "rgba(46,155,78,0.07)", border: "1px solid rgba(46,155,78,0.2)", borderRadius: 16, padding: "18px 22px", marginBottom: 12, display: "flex", alignItems: "center", gap: 16 }}>
          {r.foodId?.image ? (
               <img src={r.foodId.image} alt="food" style={{ width: 44, height: 44, borderRadius: 10, objectFit: "cover" }} />
            ) : <span style={{ fontSize: 34, width: 44, textAlign: "center" }}>🍱</span>}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "white" }}>{r.foodId?.foodName}</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.55)" }}>From {r.foodId?.donor?.name} · {r.qty} {r.foodId?.unit}</div>
          </div>
          <Badge color="green">✅ Completed</Badge>
        </div>
      ))}
    </div>
  );
}

// ─── PAGE: NGO PROFILE ────────────────────────────────────────────────────────
function ProfilePage({ user, setUser }) {
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({ 
    name: user?.name || "NGO Name", 
    email: user?.email || "", 
    phone: user?.phone || "0771234567", 
    address: user?.organization || "42 Main Street, Colombo 7", 
    district: "Colombo" 
  });
  const [officeLoc, setOfficeLoc] = useState(user?.officeLocation || null);
  const [profileImage, setProfileImage] = useState(user?.profileImage || null);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef(null);

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

  const handleSave = async () => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("email", form.email);
      formData.append("phone", form.phone);
      if (officeLoc) {
        if (officeLoc.lat !== undefined) formData.append('officeLat', officeLoc.lat);
        if (officeLoc.lng !== undefined) formData.append('officeLng', officeLoc.lng);
        if (officeLoc.address) formData.append('officeAddress', officeLoc.address);
      }
      if (imageFile) formData.append("profileImage", imageFile);
      
      const { updateProfile } = await import("../api/auth");
      const res = await updateProfile(formData);
      
      localStorage.setItem("user", JSON.stringify(res.data));
      if (setUser) setUser(res.data);
      setProfileImage(res.data.profileImage);
      // update officeLoc from response if provided
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

  const handleUseCurrentLocation = async () => {
    if (!navigator.geolocation) return toast.error('Geolocation not supported');
    toast.loading('Getting current location...');
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
        const data = await res.json();
        const address = data?.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        setForm(f => ({ ...f, address }));
        setOfficeLoc({ lat, lng, address });
        toast.dismiss();
        toast.success('Location set');
      } catch {
        setOfficeLoc({ lat, lng, address: '' });
        toast.dismiss();
        toast.success('Location coordinates set');
      }
    }, () => {
      toast.dismiss();
      toast.error('Failed to get location');
    }, { enableHighAccuracy: true, timeout: 8000 });
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h2 style={{ color: "white", fontSize: 26, margin: 0 }}>🏢 NGO Profile</h2>
        {!edit && <Btn variant="secondary" size="sm" onClick={() => setEdit(true)}>Edit Profile</Btn>}
      </div>

      {saved && <div style={{ background: "rgba(46,155,78,0.15)", border: "1px solid rgba(46,155,78,0.3)", borderRadius: 12, padding: "12px 18px", marginBottom: 18, fontSize: 14, color: "#7ec8a0" }}>✅ Profile updated successfully!</div>}

      <div style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 18, padding: "28px 30px", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 28 }}>
          <div 
            onClick={() => edit && fileRef.current?.click()}
            style={{ 
              width: 72, height: 72, borderRadius: 20, 
              background: `linear-gradient(135deg, ${COLORS.mint}, ${COLORS.forest})`, 
              display: "flex", alignItems: "center", justifyContent: "center", 
              fontSize: 28, fontWeight: 800, color: "white",
              cursor: edit ? "pointer" : "default",
              overflow: "hidden", position: "relative"
            }}>
            {profileImage ? (
              <img src={profileImage} alt="profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              form.name.substring(0, 1).toUpperCase()
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
            <div style={{ fontSize: 22, fontWeight: 700, color: "white" }}>{form.name}</div>
          </div>
        </div>

        {edit ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Input label="Organization Name" value={form.name} onChange={set("name")} icon="🏢" />
            <Input label="Email" type="email" value={form.email} onChange={set("email")} icon="✉️" />
            <Input label="Phone" value={form.phone} onChange={set("phone")} icon="📱" />
            <Input label="District" value={form.district} onChange={set("district")} icon="🏘️" />
            <div style={{ gridColumn: "1/-1" }}>
              <Input label="Address" value={form.address} onChange={set("address")} icon="📍" />
              {edit && (
                <div style={{ marginTop: 8 }}>
                  <button onClick={handleUseCurrentLocation} type="button" style={{ background: "transparent", border: "none", color: COLORS.mint, fontWeight: 700, cursor: "pointer" }}>📍 Use My Current Location</button>
                </div>
              )}
            </div>
            <div style={{ gridColumn: "1/-1", display: "flex", gap: 12 }}>
              <Btn variant="secondary" onClick={() => { setEdit(false); setProfileImage(user?.profileImage || null); setImageFile(null); }} style={{ flex: 1 }} disabled={loading}>Cancel</Btn>
              <Btn style={{background: COLORS.mint, color: COLORS.forest, flex: 1}} onClick={handleSave} disabled={loading}>{loading ? "Saving..." : "Save Changes ✓"}</Btn>
            </div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {[["✉️ Email", form.email], ["📱 Phone", form.phone], ["📍 Address", form.address], ["🏘️ District", form.district]].map(([k, v]) => (
              <div key={k} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: "14px 16px" }}>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", marginBottom: 5 }}>{k}</div>
                <div style={{ fontSize: 14, color: "white" }}>{v}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── PAGE: NOTIFICATIONS ──────────────────────────────────────────────────────
function NotificationsPage({ notifications, setNotifications }) {
  return (
    <div>
      <h2 style={{ color: "white", fontSize: 26, margin: "0 0 4px" }}>🔔 Notifications</h2>
      <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, marginBottom: 20 }}>{notifications.filter(m => !m.read).length} unread notifications</p>
      
      {notifications.length === 0 ? <p style={{ color: "rgba(255,255,255,0.4)" }}>No notifications yet.</p> : null}
      
      {notifications.map(m => (
        <div key={m._id} onClick={() => setNotifications(notifications.map(x => x._id === m._id ? { ...x, read: true } : x))} style={{
          background: m.read ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.1)",
          border: `1px solid ${m.read ? "rgba(255,255,255,0.15)" : "rgba(126, 200, 160, 0.4)"}`,
          borderRadius: 12, padding: "14px 16px", marginBottom: 10,
          display: "flex", gap: 12, alignItems: "flex-start", cursor: "pointer",
        }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(126, 200, 160, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: COLORS.mint, fontSize: 16, flexShrink: 0 }}>🔔</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "white", fontWeight: 600, fontSize: 14 }}>Notification</span>
              <span style={{ color: "rgba(255,255,255,0.55)", fontSize: 11 }}>{new Date(m.createdAt).toLocaleDateString()}</span>
            </div>
            <div style={{ color: m.read ? "rgba(255,255,255,0.55)" : "white", fontSize: 13, marginTop: 3 }}>{m.message}</div>
          </div>
          {!m.read && <div style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS.mint, flexShrink: 0, marginTop: 6 }} />}
        </div>
      ))}
    </div>
  );
}

// ─── PAGE: FEEDBACKS ──────────────────────────────────────────────────────────
function FeedbacksPage({ completedRequests, onLoadFeedbacks, refreshTrigger }) {
  const [activeTab, setActiveTab] = useState("pending"); // pending or submitted
  const [feedbacks, setFeedbacks] = useState([]);
  const [receivedFeedbacks, setReceivedFeedbacks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadFeedbacks = async () => {
    setIsLoading(true);
    try {
      const response = await getMySubmittedFeedbacks();
      if (response.success) {
        setFeedbacks(response.data || []);
      }
      const responseRec = await getMyReceivedFeedbacks();
      if (responseRec.success) {
        setReceivedFeedbacks(responseRec.data || []);
      }
    } catch (error) {
      console.error("Error loading feedbacks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFeedbacks();
  }, [refreshTrigger]);

  const handleFeedbackSubmit = () => {
    loadFeedbacks();
    if (onLoadFeedbacks) onLoadFeedbacks();
  };

  // Get requests that are completed and don't have feedback yet
  const pendingFeedback = completedRequests.filter(r => !r.feedbackSubmitted);

  return (
    <div>
      <h2 style={{ color: "white", fontSize: 26, margin: "0 0 22px" }}>⭐ Feedback & Ratings</h2>

      {/* Stats Cards */}
      <div style={{ display: "flex", gap: 14, marginBottom: 28, flexWrap: "wrap" }}>
        <StatCard icon="📝" label="Pending Feedback" value={pendingFeedback.length} color={COLORS.amber} />
        <StatCard icon="✅" label="Submitted Feedbacks" value={feedbacks.length} color={COLORS.mint} />
        <StatCard icon="⭐" label="Received Feedbacks" value={receivedFeedbacks.length} color={COLORS.indigo || "#6366f1"} />
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {[["pending", "📝 Pending Feedback"], ["submitted", "✅ Submitted Feedbacks"], ["received", "⭐ Received Feedbacks"]].map(([val, label]) => (
          <button
            key={val}
            onClick={() => setActiveTab(val)}
            style={{
              padding: "10px 20px",
              borderRadius: 22,
              border: `1px solid ${activeTab === val ? "rgba(126, 200, 160, 0.5)" : "rgba(255,255,255,0.15)"}`,
              background: activeTab === val ? "rgba(126, 200, 160, 0.2)" : "rgba(255,255,255,0.05)",
              color: activeTab === val ? COLORS.mint : "rgba(255,255,255,0.6)",
              fontSize: 13,
              cursor: "pointer",
              fontWeight: activeTab === val ? 600 : 400,
              transition: "all 0.15s",
            }}
          >
            {label}
            {val === "pending" && pendingFeedback.length > 0 && (
              <span style={{ background: "rgba(255,255,255,0.15)", padding: "2px 8px", borderRadius: 10, marginLeft: 8, fontSize: 11 }}>
                {pendingFeedback.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Pending Feedback Tab */}
      {activeTab === "pending" && (
        <div>
          {pendingFeedback.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "rgba(255,255,255,0.4)" }}>
              <div style={{ fontSize: 52, marginBottom: 14 }}>✅</div>
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: "rgba(255,255,255,0.7)" }}>No pending feedback</div>
              <p style={{ margin: 0, fontSize: 14 }}>All donations have feedback! Great work 🎉</p>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 20 }}>
              {pendingFeedback.map((request) => (
                <div
                  key={request._id}
                  style={{
                    background: `linear-gradient(135deg, ${COLORS.amber}15, ${COLORS.orange}15)`,
                    border: `1px solid ${COLORS.amber}40`,
                    borderRadius: 18,
                    padding: 24,
                  }}
                >
                  {/* Donation Info */}
                  <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
                    {request.foodId?.image ? (
                      <img
                        src={request.foodId.image}
                        alt="food"
                        style={{ width: 56, height: 56, borderRadius: 14, objectFit: "cover" }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 56,
                          height: 56,
                          borderRadius: 14,
                          background: "rgba(255,255,255,0.08)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 28,
                        }}
                      >
                        🍱
                      </div>
                    )}
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: "white" }}>{request.foodId?.foodName}</div>
                      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.55)" }}>
                        From {request.foodId?.donor?.name} · {request.qty} {request.foodId?.unit}
                      </div>
                    </div>
                  </div>

                  {/* Feedback Form */}
                  <FeedbackForm
                    donorId={request.foodId?.donor?._id}
                    requestId={request._id}
                    donationId={request.foodId?._id}
                    donorName={request.foodId?.donor?.name}
                    onSubmitSuccess={handleFeedbackSubmit}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Submitted Feedback Tab */}
      {activeTab === "submitted" && (
        <div>
          {isLoading ? (
            <div style={{ textAlign: "center", padding: 40, color: "rgba(255,255,255,0.7)" }}>
              ⏳ Loading feedbacks...
            </div>
          ) : feedbacks.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "rgba(255,255,255,0.4)" }}>
              <div style={{ fontSize: 52, marginBottom: 14 }}>📝</div>
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: "rgba(255,255,255,0.7)" }}>No submitted feedbacks yet</div>
              <p style={{ margin: 0, fontSize: 14 }}>Submit feedback for completed donations above</p>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 16 }}>
              {feedbacks.map((feedback) => (
                <div key={feedback._id} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 14, padding: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: "white", marginBottom: 4 }}>👤 {feedback.donorId?.name || "Donor"}</div>
                      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)" }}>{new Date(feedback.createdAt).toLocaleDateString()}</div>
                    </div>
                    <RatingStars rating={feedback.rating} readOnly size={24} />
                  </div>
                  {feedback.comment && (
                    <p style={{ background: "rgba(0,0,0,0.2)", borderRadius: 10, padding: 12, color: "white", fontSize: 13, lineHeight: 1.6, margin: 0, marginTop: 12, borderLeft: `3px solid ${COLORS.amber}` }}>
                      "{feedback.comment}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Received Feedback Tab */}
      {activeTab === "received" && (
        <div>
          {isLoading ? (
            <div style={{ textAlign: "center", padding: 40, color: "rgba(255,255,255,0.7)" }}>
              ⏳ Loading feedbacks...
            </div>
          ) : receivedFeedbacks.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "rgba(255,255,255,0.4)" }}>
              <div style={{ fontSize: 52, marginBottom: 14 }}>⭐</div>
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: "rgba(255,255,255,0.7)" }}>No received feedbacks yet</div>
              <p style={{ margin: 0, fontSize: 14 }}>Keep doing great work to earn feedback</p>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 16 }}>
              {receivedFeedbacks.map((feedback) => (
                <div key={feedback._id} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 14, padding: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: "white", marginBottom: 4 }}>
                        {feedback.donorId?.name ? `👤 ${feedback.donorId.name}` : (feedback.ngoId?.name ? `🎯 ${feedback.ngoId.name}` : "User")}
                      </div>
                      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)" }}>{new Date(feedback.createdAt).toLocaleDateString()}</div>
                    </div>
                    <RatingStars rating={feedback.rating} readOnly size={24} />
                  </div>
                  {feedback.comment && (
                    <p style={{ background: "rgba(0,0,0,0.2)", borderRadius: 10, padding: 12, color: "white", fontSize: 13, lineHeight: 1.6, margin: 0, marginTop: 12, borderLeft: `3px solid ${COLORS.amber}` }}>
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

// ─── PAGE: FUND REQUESTS ───────────────────────────────────────────────────────
function FundRequestsPage({ fundRequests, fundDonations, reload, user }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ purpose: "", amountNeeded: "" });
  const [files, setFiles] = useState({});
  const [loading, setLoading] = useState(false);
  const [actionId, setActionId] = useState(null);
  const [chatDonationId, setChatDonationId] = useState(null);

  const pendingDonations = fundDonations.filter(d => d.paymentStatus === "pending");
  const receivedDonations = fundDonations.filter(d => d.paymentStatus === "success");

  const handleConfirmPending = async (donationId) => {
    setActionId(donationId);
    try {
      await confirmPendingDonation(donationId);
      toast.success("Donation confirmed! Amount added to fundraiser.");
      reload();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to confirm donation");
    } finally {
      setActionId(null);
    }
  };

  const handleCancelPending = async (donationId) => {
    if (!window.confirm("Cancel this pending donation?")) return;
    setActionId(donationId);
    try {
      await cancelPendingDonation(donationId);
      toast.success("Donation cancelled.");
      reload();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to cancel");
    } finally {
      setActionId(null);
    }
  };

  const handleFile = (e, key) => {
    setFiles({ ...files, [key]: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!files.needStatement || !files.registrationCertificate || !files.bankDetails) {
      return toast.error("Please upload all required documents");
    }
    setLoading(true);
    const fd = new FormData();
    fd.append("purpose", form.purpose);
    fd.append("amountNeeded", form.amountNeeded);
    Object.keys(files).forEach(k => {
      if (files[k]) fd.append(k, files[k]);
    });

    try {
      await createMoneyRequest(fd);
      toast.success("Fund Request submitted!");
      setShowForm(false);
      setForm({ purpose: "", amountNeeded: "" });
      setFiles({});
      reload();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Error submitting request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "grid", gap: 24, maxWidth: 980, margin: "0 auto" }}>
      <div style={{ textAlign: "center" }}>
        <h2 style={{ color: "white", fontSize: 30, margin: 0 }}>💸 Fund Requests</h2>
        <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 15, margin: "10px auto 0", maxWidth: 600 }}>
          Request funds with verified documents and keep your NGO operations transparent and easy to manage.
        </p>
        {!showForm && (
          <div style={{ marginTop: 20 }}>
            <Btn style={{ background: COLORS.mint, color: COLORS.forest, padding: "14px 26px", minWidth: 170, fontWeight: 700 }} onClick={() => setShowForm(true)}>+ New Request</Btn>
          </div>
        )}
      </div>

      {showForm && (
        <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 24, padding: "26px", marginBottom: 24, boxShadow: "0 20px 80px rgba(0,0,0,0.12)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <div>
              <h3 style={{ color: "white", margin: 0, fontSize: 22 }}>Create Fund Request</h3>
              <p style={{ color: "rgba(255,255,255,0.6)", margin: "8px 0 0", fontSize: 14 }}>
                Submit a request with clear purpose, amount needed, and supporting documents.
              </p>
            </div>
            <Btn variant="secondary" onClick={() => setShowForm(false)} type="button">Close</Btn>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "grid", gap: 20, marginTop: 24 }}>
            <Input label="Purpose *" value={form.purpose} onChange={e => setForm({ ...form, purpose: e.target.value })} placeholder="Why do you need funds?" required />
            <Input label="Amount Needed (LKR) *" type="number" value={form.amountNeeded} onChange={e => setForm({ ...form, amountNeeded: e.target.value })} placeholder="e.g. 50000" required />

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 18 }}>
              <div style={{ display: "grid", gap: 8 }}>
                <label style={{ color: "rgba(255,255,255,0.75)", fontSize: 13, fontWeight: 600 }}>Need Statement (PDF) *</label>
                <div style={{ background: "rgba(255,255,255,0.04)", border: "1px dashed rgba(255,255,255,0.18)", borderRadius: 16, padding: "16px 14px" }}>
                  <input type="file" accept=".pdf,image/*" onChange={e => handleFile(e, "needStatement")} required style={{ width: "100%", color: "white", background: "transparent", border: "none", outline: "none" }} />
                  {files.needStatement && <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, marginTop: 8 }}>{files.needStatement.name}</div>}
                </div>
              </div>

              <div style={{ display: "grid", gap: 8 }}>
                <label style={{ color: "rgba(255,255,255,0.75)", fontSize: 13, fontWeight: 600 }}>Registration Certificate *</label>
                <div style={{ background: "rgba(255,255,255,0.04)", border: "1px dashed rgba(255,255,255,0.18)", borderRadius: 16, padding: "16px 14px" }}>
                  <input type="file" accept=".pdf,image/*" onChange={e => handleFile(e, "registrationCertificate")} required style={{ width: "100%", color: "white", background: "transparent", border: "none", outline: "none" }} />
                  {files.registrationCertificate && <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, marginTop: 8 }}>{files.registrationCertificate.name}</div>}
                </div>
              </div>

              <div style={{ display: "grid", gap: 8 }}>
                <label style={{ color: "rgba(255,255,255,0.75)", fontSize: 13, fontWeight: 600 }}>Bank Details Proof *</label>
                <div style={{ background: "rgba(255,255,255,0.04)", border: "1px dashed rgba(255,255,255,0.18)", borderRadius: 16, padding: "16px 14px" }}>
                  <input type="file" accept=".pdf,image/*" onChange={e => handleFile(e, "bankDetails")} required style={{ width: "100%", color: "white", background: "transparent", border: "none", outline: "none" }} />
                  {files.bankDetails && <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, marginTop: 8 }}>{files.bankDetails.name}</div>}
                </div>
              </div>

              <div style={{ display: "grid", gap: 8 }}>
                <label style={{ color: "rgba(255,255,255,0.75)", fontSize: 13, fontWeight: 600 }}>Usage Report (Optional)</label>
                <div style={{ background: "rgba(255,255,255,0.04)", border: "1px dashed rgba(255,255,255,0.18)", borderRadius: 16, padding: "16px 14px" }}>
                  <input type="file" accept=".pdf,image/*" onChange={e => handleFile(e, "usageReport")} style={{ width: "100%", color: "white", background: "transparent", border: "none", outline: "none" }} />
                  {files.usageReport && <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, marginTop: 8 }}>{files.usageReport.name}</div>}
                </div>
              </div>

              <div style={{ display: "grid", gap: 8 }}>
                <label style={{ color: "rgba(255,255,255,0.75)", fontSize: 13, fontWeight: 600 }}>Cover Image (Optional)</label>
                <div style={{ background: "rgba(255,255,255,0.04)", border: "1px dashed rgba(255,255,255,0.18)", borderRadius: 16, padding: "16px 14px" }}>
                  <input type="file" accept="image/*" onChange={e => handleFile(e, "image")} style={{ width: "100%", color: "white", background: "transparent", border: "none", outline: "none" }} />
                  {files.image && <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, marginTop: 8 }}>{files.image.name}</div>}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, marginTop: 10, flexWrap: "wrap" }}>
              <Btn variant="secondary" onClick={() => setShowForm(false)} type="button">Cancel</Btn>
              <Btn style={{ background: COLORS.mint, color: COLORS.forest, minWidth: 180 }} type="submit" disabled={loading}>{loading ? "Submitting..." : "Submit Request"}</Btn>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: "grid", gap: 18 }}>
        <div>
          <h3 style={{ color: "white", fontSize: 20, marginBottom: 14 }}>My Requests</h3>
          {fundRequests.length === 0 ? (
            <div style={{ color: "rgba(255,255,255,0.6)", padding: "22px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 18 }}>
              No fund requests created yet.
            </div>
          ) : fundRequests.map(req => (
            <div key={req._id} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 18, padding: "20px", marginBottom: 14, boxShadow: "0 16px 50px rgba(0,0,0,0.08)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 14, flexWrap: "wrap", marginBottom: 10 }}>
                <strong style={{ color: "white", fontSize: 16, lineHeight: 1.4 }}>{req.purpose}</strong>
                <Badge color={req.status === "approved" ? "green" : req.status === "rejected" ? "red" : "amber"}>{req.status.toUpperCase()}</Badge>
              </div>
              <div style={{ fontSize: 14, color: "rgba(255,255,255,0.72)", marginBottom: 12 }}>
                Requested: LKR {req.amountNeeded.toLocaleString()} • Raised: LKR {req.amountRaised.toLocaleString()}
              </div>
              <div style={{ width: "100%", height: 8, background: "rgba(255,255,255,0.08)", borderRadius: 999, marginTop: 8, overflow: "hidden" }}>
                <div style={{ height: "100%", background: COLORS.mint, width: `${Math.min((req.amountRaised / req.amountNeeded) * 100, 100)}%`, transition: "width 0.4s ease" }}></div>
              </div>
            </div>
          ))}

        </div>

      </div>

      {pendingDonations.length > 0 && (
        <>
          <h3 style={{ color: "white", fontSize: 20, marginTop: 32, marginBottom: 14 }}>⏳ Pending Donations (Review & Confirm)</h3>
          {pendingDonations.map(don => (
            <div key={don._id} style={{ background: "rgba(237, 150, 71, 0.08)", border: "1px solid rgba(237, 150, 71, 0.28)", borderRadius: 18, padding: "18px 20px", marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
                <div>
                  <div style={{ color: "white", fontWeight: 600 }}>
                    {don.donorId?.name} — LKR {don.amount.toLocaleString()}
                    {don.isRecurring && <span style={{ marginLeft: 8, fontSize: 11, background: COLORS.amber, color: COLORS.forest, padding: "2px 8px", borderRadius: 999 }}>MONTHLY</span>}
                  </div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", marginTop: 4 }}>
                    {getMethodLabel(don)} • For: {don.moneyRequestId?.purpose}
                  </div>
                  {(don.donorNote || don.handoverNote) && (
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 8, fontStyle: "italic" }}>Note: "{don.donorNote || don.handoverNote}"</div>
                  )}
                  {don.receiptImage && (
                    <a href={don.receiptImage} target="_blank" rel="noreferrer" style={{ display: "inline-block", marginTop: 8, fontSize: 12, color: COLORS.mint }}>📎 View Receipt</a>
                  )}
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 6 }}>Submitted: {new Date(don.createdAt).toLocaleString()}</div>
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <Btn variant="secondary" size="sm" onClick={() => setChatDonationId(chatDonationId === don._id ? null : don._id)}>
                    💬 Chat
                  </Btn>
                  <Btn style={{ background: COLORS.mint, color: COLORS.forest, minWidth: 150 }} size="sm" disabled={actionId === don._id} onClick={() => handleConfirmPending(don._id)}>
                    {actionId === don._id ? "..." : "✅ Confirm Received"}
                  </Btn>
                  <Btn variant="secondary" size="sm" disabled={actionId === don._id} onClick={() => handleCancelPending(don._id)}>Cancel</Btn>
                </div>
              </div>
              {chatDonationId === don._id && (
                <div style={{ marginTop: 16 }}>
                  <ChatWidget
                    moneyRequestId={don.moneyRequestId?._id || don.moneyRequestId}
                    currentUserId={user?._id}
                    otherUserId={don.donorId?._id}
                    compact
                    title={`Chat with ${don.donorId?.name || "Donor"}`}
                  />
                </div>
              )}
            </div>
          ))}
        </>
      )}

      <h3 style={{ color: "white", fontSize: 20, marginTop: 32, marginBottom: 14 }}>Recent Donations Received</h3>
      {receivedDonations.length === 0 ? (
        <div style={{ color: "rgba(255,255,255,0.6)", padding: "22px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 18 }}>
          No donations received yet.
        </div>
      ) : receivedDonations.map(don => (
        <div key={don._id} style={{ background: "rgba(126, 200, 160, 0.08)", border: "1px solid rgba(126, 200, 160, 0.24)", borderRadius: 18, padding: "18px 20px", marginBottom: 14, boxShadow: "0 16px 50px rgba(0,0,0,0.08)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <div>
              <div style={{ color: "white", fontWeight: 600 }}>{don.donorId?.name} donated LKR {don.amount.toLocaleString()}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>For: {don.moneyRequestId?.purpose}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 4 }}>
                {getMethodLabel(don)}{don.isRecurring ? " • 🔁 Monthly" : ""}
                {don.confirmedAt ? ` • Confirmed ${new Date(don.confirmedAt).toLocaleDateString()}` : ""}
              </div>
            </div>
            {don.feedback && don.feedback.rating ? (
               <div style={{ textAlign: "right" }}>
                 <RatingStars rating={don.feedback.rating} readOnly size={16} />
                 {don.feedback.comment && <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 4, fontStyle: "italic" }}>"{don.feedback.comment}"</div>}
               </div>
            ) : <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>No feedback</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── MAIN NGO DASHBOARD ───────────────────────────────────────────────────────
export default function NGODashboard({ theme = "dark" }) {
  const navigate = useNavigate();
  const isLight = theme === "light";
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user") || "null"));
  const [page, setPage] = useState("dashboard");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  const [availableDonations, setAvailableDonations] = useState([]);
  const [requests, setRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [fundRequests, setFundRequests] = useState([]);
  const [fundDonations, setFundDonations] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [feedbackPromptRequest, setFeedbackPromptRequest] = useState(null);
  
  const [loading, setLoading] = useState(false);

  const onLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [donationsRes, requestsRes, notifRes, fundReqRes, fundDonRes, feedbacksRes] = await Promise.all([
        getDonations(), 
        getRequests(),
        getNotifications(),
        getMoneyRequests().catch(() => ({ data: [] })),
        getNgoMoneyDonations().catch(() => ({ data: [] })),
        getMySubmittedFeedbacks().catch(() => ({ data: [] }))
      ]);
      
      const requestsData = requestsRes.data || [];
      const requestedIds = requestsData.map(r => r.foodId?._id?.toString());
      const filteredDonations = (donationsRes.data || []).filter(d => !requestedIds.includes(d._id?.toString()));

      setAvailableDonations(filteredDonations);
      setRequests(requestsData);
      setNotifications(notifRes.data || []);
      setFundRequests(fundReqRes.data || []);
      setFundDonations(fundDonRes.data || []);
      setFeedbacks(feedbacksRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const verifyAndLoad = async () => {
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");
      if (!token || !userStr) {
        navigate("/login");
        return;
      }
      const user = JSON.parse(userStr);
      if (user.role !== "ngo") {
        navigate("/login");
        return;
      }

      // Verify token with server
      try {
        const authRes = await verifyAuth();
        const verifiedUser = authRes?.user || authRes?.data?.user || null;
        if (verifiedUser) {
          setUser(verifiedUser);
          localStorage.setItem("user", JSON.stringify(verifiedUser));
        }
        if (verifiedUser?.role !== "ngo") {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login");
          return;
        }
      } catch (err) {
        console.error("Auth verification failed:", err);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }

      loadData();
      let intervalId = setInterval(() => {
        getNotifications().then(res => setNotifications(res.data || [])).catch(()=>null);
      }, 10000);
      return () => clearInterval(intervalId);
    };

    verifyAndLoad();
  }, [navigate]);

  useEffect(() => {
    if (!user?._id) return;
    const socket = io(`http://${window.location.hostname}:5000`);
    socket.emit("join_user_room", user._id);
    
    socket.on("new_notification", (notif) => {
      setNotifications(prev => [notif, ...prev]);
      if (notif.type === "new_message") {
        toast(notif.message, { icon: "💬" });
      } else {
        toast(notif.message, { icon: "🔔" });
      }
      if (notif.type === "general" || notif.type === "new_donation" || notif.type === "status_change") {
        loadData();
      }
    });

    socket.on("admin_deleted_item", () => {
      setRefreshTrigger(prev => prev + 1);
      loadData();
    });
    
    return () => {
      socket.disconnect();
    };
  }, [user?._id]);

  const handleRequest = async (donation, qty, message) => {
    try {
      if (user?.role !== "ngo") {
        toast.error("Only NGO accounts can request food.");
        return;
      }
      await createRequest({ foodId: donation._id, qty, message });
      toast.success(`Request sent for "${donation.foodName}"!`);
      loadData();
      setPage("myRequests");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send request");
    }
  };

  const handlePickup = async (request) => {
    try {
      await updateRequest(request._id, { status: "completed" });
      toast.success("Pickup confirmed! Thank you 🙏");
      loadData();
      setFeedbackPromptRequest(request); // Prompt for feedback immediately
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to confirm pickup");
    }
  };
  

  const unreadNotifs = notifications.filter(n => !n.read).length;
  const pendingRequests = requests.filter(r => r.status === "pending").length;
  const completedRequests = requests.filter(r => r.status === "completed");

  const pages = {
    dashboard: <DashboardPage availableDonations={availableDonations} requests={requests} onNav={setPage} user={user} fundDonations={fundDonations} feedbacks={feedbacks} />,
    browse: <BrowsePage donations={availableDonations} requests={requests} onRequest={handleRequest} user={user} />,
    myRequests: <MyRequestsPage requests={requests} onPickup={handlePickup} user={user} />,
    pickups: <PickupsPage requests={requests} />,
    fundRequests: <FundRequestsPage fundRequests={fundRequests} fundDonations={fundDonations} reload={loadData} user={user} />,
    feedbacks: <FeedbacksPage completedRequests={completedRequests} onLoadFeedbacks={loadData} refreshTrigger={refreshTrigger} />,
    notifications: <NotificationsPage notifications={notifications} setNotifications={setNotifications} />,
    profile: <ProfilePage user={user} setUser={setUser} />,
  };

  return (
    <DashboardLayout 
      role="ngo" 
      activePage={page} 
      onNav={setPage} 
      onLogout={onLogout} 
      user={user} 
      notifCount={unreadNotifs} 
      requestCount={pendingRequests}
      theme={theme}
    >
      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulseDot { 0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(126, 200, 160, 0.7); } 70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(126, 200, 160, 0); } 100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(126, 200, 160, 0); } }
        * { box-sizing: border-box; }
        input::placeholder, textarea::placeholder { color: ${isLight ? 'rgba(15,23,42,0.45)' : 'rgba(255,255,255,0.4)'} !important; }
        select option { background: ${isLight ? '#ffffff' : '#1a3a2a'} !important; color: ${isLight ? '#0f172a' : '#ffffff'} !important; }
      `}</style>
      
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
          zIndex: 100
        }}
      >
        🔔
        {unreadNotifs > 0 && (
          <div style={{
            position: "absolute",
            top: 10,
            right: 12,
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: COLORS.mint,
            animation: "pulseDot 2s infinite"
          }} />
        )}
      </div>

      {loading && <div style={{color: "rgba(255,255,255,0.7)", marginBottom: "10px"}}>Loading...</div>}
      <div
        style={{
          animation: "slideUp 0.3s ease forwards",
          maxHeight: "calc(100vh - 120px)",
          overflowY: "auto",
          overflowX: "hidden",
          paddingRight: 12,
          paddingBottom: 20,
        }}
        key={page}
      >
        {pages[page]}
      </div>

      <Modal open={!!feedbackPromptRequest} onClose={() => setFeedbackPromptRequest(null)} title="Leave Feedback">
        {feedbackPromptRequest && (
          <div style={{ padding: "10px 0" }}>
            <p style={{ color: "rgba(255,255,255,0.7)", marginBottom: 20, fontSize: 14 }}>
              How was your experience receiving <strong>{feedbackPromptRequest.foodId?.foodName}</strong> from <strong>{feedbackPromptRequest.foodId?.donor?.name}</strong>?
            </p>
            <FeedbackForm 
              donorId={feedbackPromptRequest.foodId?.donor?._id}
              requestId={feedbackPromptRequest._id}
              donationId={feedbackPromptRequest.foodId?._id}
              donorName={feedbackPromptRequest.foodId?.donor?.name}
              onSubmitSuccess={() => {
                setFeedbackPromptRequest(null);
                loadData();
              }}
            />
            <div style={{ textAlign: "center", marginTop: 16 }}>
              <button 
                onClick={() => setFeedbackPromptRequest(null)}
                style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.5)", fontSize: 13, cursor: "pointer", textDecoration: "underline" }}
              >
                Skip for now
              </button>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}

