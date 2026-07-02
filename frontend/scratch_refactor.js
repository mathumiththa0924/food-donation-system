const fs = require('fs');
const path = require('path');

const filepath = path.join(__dirname, 'src', 'App.jsx');
const content = fs.readFileSync(filepath, 'utf8');

const startMarker = "// ─── DONOR DASHBOARD ──────────────────────────────────────────────────────────";
const endMarker = "// ─── ADMIN DASHBOARD ──────────────────────────────────────────────────────────";

const startIdx = content.indexOf(startMarker);
const endIdx = content.indexOf(endMarker);

if (startIdx === -1 || endIdx === -1) {
    console.error("Markers not found!");
    process.exit(1);
}

const preContent = content.substring(0, startIdx);
const postContent = content.substring(endIdx);

const refactored = `// ─── SHARED DASHBOARD CONSTANTS ───────────────────────────────────────────────
const statusColors = { available: "#4CAF50", donated: COLORS.sage, claimed: COLORS.amber };
const statusBg = { available: "rgba(76,175,80,0.15)", donated: "rgba(74,140,106,0.15)", claimed: "rgba(232,146,58,0.15)" };

// ─── DONOR DASHBOARD COMPONENTS ──────────────────────────────────────────────

function DonateForm({ setDonations, setPage }) {
  const [form, setForm] = useState({ food: "", category: "", qty: "", unit: "portions", pickupDate: "", pickupTime: "", notes: "", expiryDate: "", expiryTime: "" });
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const [submitted, setSubmitted] = useState(false);
  const [district, setDistrict] = useState(() => {
    try {
      const saved = localStorage.getItem("lastLocation");
      return saved ? JSON.parse(saved).district : "";
    } catch { return ""; }
  });
  const [place, setPlace] = useState(() => {
    try {
      const saved = localStorage.getItem("lastLocation");
      return saved ? JSON.parse(saved).place : "";
    } catch { return ""; }
  });
  const [formErrors, setFormErrors] = useState({ district: "", place: "" });

  const handleSubmit = async () => {
    if (!form.food || !form.qty || !district || !place) {
      setFormErrors({
        district: !district ? "Select District" : "",
        place: !place ? "Select Area" : ""
      });
      return toast.error("Please fill required fields!");
    }
    const token = localStorage.getItem("token");
    try {
      const locationStr = \`\${place}, \${district}\`;
      const res = await axios.post("http://localhost:5000/api/donations", {
        foodName: form.food,
        category: form.category,
        quantity: Number(form.qty),
        location: locationStr,
        pickupTime: \`\${form.pickupDate} \${form.pickupTime}\`.trim(),
        expiryTime: \`\${form.expiryDate} \${form.expiryTime}\`.trim(),
        notes: form.notes ? \`\${form.notes} (Unit: \${form.unit})\` : \`Unit: \${form.unit}\`
      }, {
        headers: { Authorization: \`Bearer \${token}\` }
      });
      setDonations(d => [res.data.data, ...d]);
      setSubmitted(true);
      localStorage.setItem("lastLocation", JSON.stringify({ district, place }));
      setTimeout(() => { setSubmitted(false); setPage("myDonations"); }, 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to post donation");
    }
  };

  if (submitted) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 400 }}>
      <div style={{ fontSize: 60, marginBottom: 16, animation: "bounceIn 0.5s ease" }}>🎉</div>
      <h2 style={{ color: "white", fontFamily: "'Georgia', serif", margin: "0 0 8px" }}>Donation Posted!</h2>
      <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 15 }}>Thank you for sharing. Redirecting...</p>
    </div>
  );

  return (
    <div>
      <h2 style={{ color: "white", fontFamily: "'Georgia', serif", fontSize: 26, margin: "0 0 24px" }}>📦 Post a Donation</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div style={{ gridColumn: "1/-1" }}>
          <Input label="Food Name *" placeholder="e.g. Rice & Curry, Bread, Vegetables" value={form.food} onChange={set("food")} icon="🍽️" />
        </div>
        <Select label="Category" value={form.category} onChange={set("category")} options={[
          { value: "", label: "Select category..." },
          { value: "cooked", label: "🍱 Cooked Food" },
          { value: "raw", label: "🥦 Raw Vegetables/Fruits" },
          { value: "packaged", label: "📦 Packaged Food" },
          { value: "dairy", label: "🥛 Dairy Products" },
          { value: "bakery", label: "🍞 Bakery Items" },
        ]} />
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ flex: 1 }}>
            <Input label="Quantity *" placeholder="e.g. 20" value={form.qty} onChange={set("qty")} />
          </div>
          <div style={{ width: 120 }}>
            <Select label="Unit" value={form.unit} onChange={set("unit")} options={[
              { value: "portions", label: "Portions" },
              { value: "kg", label: "kg" },
              { value: "items", label: "Items" },
              { value: "liters", label: "Liters" },
            ]} />
          </div>
        </div>
        <LocationSelector 
          label="Pickup Location *"
          district={district} 
          setDistrict={(val) => { setDistrict(val); setFormErrors(prev => ({ ...prev, district: "" })); }} 
          place={place} 
          setPlace={(val) => { setPlace(val); setFormErrors(prev => ({ ...prev, place: "" })); }} 
          districtError={formErrors.district}
          placeError={formErrors.place}
        />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <Input label="Pickup Date" type="date" value={form.pickupDate} onChange={set("pickupDate")} icon="📅" />
          <Input label="Pickup Time" type="time" value={form.pickupTime} onChange={set("pickupTime")} icon="⏰" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <Input label="Expiry Date" type="date" value={form.expiryDate} onChange={set("expiryDate")} icon="⏳" />
          <Input label="Expiry Time" type="time" value={form.expiryTime} onChange={set("expiryTime")} icon="⏰" />
        </div>
        <div style={{ gridColumn: "1/-1" }}>
          <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.55)", letterSpacing: "1.2px", textTransform: "uppercase", marginBottom: 8 }}>
            ADDITIONAL NOTES
          </label>
          <textarea
            placeholder="Any special instructions, dietary info, allergens..."
            value={form.notes}
            onChange={set("notes")}
            style={{ width: "100%", padding: "14px 16px", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 12, color: "white", fontSize: 15, outline: "none", resize: "vertical", minHeight: 80, fontFamily: "inherit", boxSizing: "border-box" }}
          />
        </div>
        <div style={{ gridColumn: "1/-1" }}>
          <Btn onClick={handleSubmit}>Post Donation 🚀</Btn>
        </div>
      </div>
    </div>
  );
}

function MyDonations({ donations }) {
  return (
    <div>
      <h2 style={{ color: "white", fontFamily: "'Georgia', serif", fontSize: 26, margin: "0 0 20px" }}>📋 My Donations</h2>
      {donations.map(d => (
        <div key={d._id} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: "18px 20px", marginBottom: 12, display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ fontSize: 36, width: 52, textAlign: "center" }}>🍱</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "white", marginBottom: 4 }}>{d.foodName}</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>📍 {d.location} · {d.quantity} portions</div>
          </div>
          <div style={{ background: statusBg[d.status], color: statusColors[d.status], fontSize: 12, fontWeight: 600, padding: "6px 14px", borderRadius: 20, textTransform: "capitalize" }}>
            {d.status}
          </div>
        </div>
      ))}
    </div>
  );
}

function ImpactPage({ stats }) {
  const metrics = [
    { label: "Total Meals Donated", value: stats?.totalDonated || 0, icon: "🍽️" },
    { label: "People Fed", value: stats?.peopleHelped || 0, icon: "👥" },
    { label: "Food Waste Prevented", value: \`\${(stats?.totalDonated || 0) * 2} kg\`, icon: "♻️" },
    { label: "Donation Streak", value: "Active", icon: "🔥" },
  ];
  return (
    <div>
      <h2 style={{ color: "white", fontFamily: "'Georgia', serif", fontSize: 26, margin: "0 0 24px" }}>📊 My Impact</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 28 }}>
        {metrics.map(m => (
          <div key={m.label} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 18, padding: "22px", textAlign: "center" }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>{m.icon}</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: COLORS.amberLight, marginBottom: 6 }}>{m.value}</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.55)" }}>{m.label}</div>
          </div>
        ))}
      </div>
      <div style={{ background: "rgba(232,146,58,0.1)", border: "1px solid rgba(232,146,58,0.25)", borderRadius: 18, padding: "22px" }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: "white", marginBottom: 8 }}>🌟 Donor Badge – Getting Started</div>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", margin: 0 }}>
          "Your impact journey starts here 🚀 Donate your first meal and become a Community Hero!"
        </p>
      </div>
    </div>
  );
}

function DonorHome({ user, stats, donations, setPage }) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ color: "white", fontFamily: "'Georgia', serif", fontSize: 28, margin: "0 0 6px" }}>{greeting}, {user?.name || "John"}! 👋</h2>
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 15, margin: 0 }}>Ready to make a difference today?</p>
      </div>
      <div style={{ display: "flex", gap: 16, marginBottom: 28 }}>
        <StatCard icon="🍱" label="Total Donated" value={stats?.totalDonated || 0} sub="Meals shared" />
        <StatCard icon="👥" label="People Helped" value={stats?.peopleHelped || 0} color={COLORS.mint} sub="This month" />
        <StatCard icon="✅" label="Completed" value={stats?.completed || 0} color="#7ec8a0" sub="Donations" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 28 }}>
        <div onClick={() => setPage("donate")} style={{ background: \`linear-gradient(135deg, rgba(232,146,58,0.3), rgba(232,146,58,0.1))\`, border: "1px solid rgba(232,146,58,0.4)", borderRadius: 18, padding: "24px", cursor: "pointer", transition: "transform 0.2s" }}
          onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
          onMouseLeave={e => e.currentTarget.style.transform = "none"}
        >
          <div style={{ fontSize: 32, marginBottom: 10 }}>➕</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "white" }}>Post New Donation</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>Share surplus food now</div>
        </div>
        <div onClick={() => setPage("myDonations")} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 18, padding: "24px", cursor: "pointer" }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
          onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
        >
          <div style={{ fontSize: 32, marginBottom: 10 }}>📦</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "white" }}>View My Donations</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>Track your contributions</div>
        </div>
      </div>
      <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 18, padding: "20px" }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "white", marginBottom: 14 }}>Recent Activity</div>
        {donations.slice(0, 2).map(d => (
          <div key={d._id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <span style={{ fontSize: 24 }}>🍱</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "white" }}>{d.foodName}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{d.quantity} portions</div>
            </div>
            <span style={{ fontSize: 12, color: statusColors[d.status], fontWeight: 600 }}>● {d.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── DONOR DASHBOARD ──────────────────────────────────────────────────────────

function DonorDashboard({ onLogout }) {
  const [page, setPage] = useState("donorHome");
  const [user, setUser] = useState(null);

  const [donations, setDonations] = useState([]);
  const [stats, setStats] = useState({ totalDonated: 0, peopleHelped: 0, completed: 0 });
  const [notifications, setNotifications] = useState([]);
  const requestsRef = useRef([]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markNotificationsRead = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      await axios.put("http://localhost:5000/api/notifications/read", {}, { headers: { Authorization: \`Bearer \${token}\` } });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.log("Error marking notifications as read", err);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios.get("http://localhost:5000/api/auth/me", {
        headers: { Authorization: \`Bearer \${token}\` }
      })
      .then(res => setUser(res.data.user))
      .catch(err => console.log(err));

      axios.get("http://localhost:5000/api/donations/my", {
        headers: { Authorization: \`Bearer \${token}\` }
      })
      .then(res => setDonations(res.data.data))
      .catch(err => console.log(err));

      axios.get("http://localhost:5000/api/donations/my/stats", {
        headers: { Authorization: \`Bearer \${token}\` }
      })
      .then(res => setStats(res.data.stats))
      .catch(err => console.log(err));

      axios.get("http://localhost:5000/api/notifications", {
        headers: { Authorization: \`Bearer \${token}\` }
      })
      .then(res => setNotifications(res.data.data))
      .catch(err => console.log(err));

      const isInitialLoad = { current: true };
      
      const fetchRequests = () => {
        axios.get("http://localhost:5000/api/requests", {
          headers: { Authorization: \`Bearer \${token}\` }
        })
        .then(res => {
          const newRequests = res.data.data || [];
          const oldRequests = requestsRef.current;
          
          if (!isInitialLoad.current) {
            const newReqs = newRequests.filter(nr => !oldRequests.find(or => or._id === nr._id));
            if (newReqs.length > 0) {
              toast.success("New food request received!", { icon: "🔔" });
            }
            newRequests.forEach(nr => {
              const oldReq = oldRequests.find(or => or._id === nr._id);
              if (oldReq && oldReq.status !== nr.status) {
                toast.success(\`Request status updated to \${nr.status}\`, { icon: "✅" });
              }
            });
          }
          
          isInitialLoad.current = false;
          requestsRef.current = newRequests;
        })
        .catch(err => console.log(err));
        
        // Also update notifications for the bell icon
        axios.get("http://localhost:5000/api/notifications", {
          headers: { Authorization: \`Bearer \${token}\` }
        })
        .then(res => setNotifications(res.data.data || []))
        .catch(err => console.log(err));
      };

      fetchRequests();
      const interval = setInterval(fetchRequests, 5000);
      return () => clearInterval(interval);
    }
  }, []);

  const pages = {
    donorHome: <DonorHome user={user} stats={stats} donations={donations} setPage={setPage} />,
    donate: <DonateForm setDonations={setDonations} setPage={setPage} />,
    myDonations: <MyDonations donations={donations} />,
    impact: <ImpactPage stats={stats} />,
    notifications: <NotificationsPage notifications={notifications} onMarkRead={markNotificationsRead} />,
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar role="donor" activePage={page} onNav={setPage} onLogout={onLogout} user={user} unreadCount={unreadCount} />
      <div style={{ flex: 1, padding: "36px 40px", overflowY: "auto" }}>
        {pages[page] || <DonorHome user={user} stats={stats} donations={donations} setPage={setPage} />}
      </div>
    </div>
  );
}

// ─── FEEDBACK MODAL ──────────────────────────────────────────────────────────

function FeedbackModal({ isOpen, onClose, onSubmit, requestId }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (rating === 0) return toast.error("Please select a rating!");
    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:5000/api/feedbacks", {
        rating,
        comment,
        requestId
      }, {
        headers: { Authorization: \`Bearer \${token}\` }
      });
      toast.success("Feedback submitted! Thank you.", { icon: "🔔" });
      onSubmit();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit feedback");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
      <div style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 24, backdropFilter: "blur(20px)", width: "90%", maxWidth: 400, padding: 24 }}>
        <h3 style={{ color: "white", margin: "0 0 16px", fontSize: 20, textAlign: "center", fontFamily: "'Georgia', serif" }}>Leave Feedback</h3>
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, textAlign: "center", marginBottom: 20 }}>How was your food delivery experience?</p>
        
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 24 }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              style={{
                fontSize: 36,
                cursor: "pointer",
                color: star <= (hover || rating) ? "#FFD700" : "rgba(255,255,255,0.2)",
                transition: "color 0.2s"
              }}
            >
              ★
            </span>
          ))}
        </div>

        <textarea
          placeholder="Add a comment (optional)..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          style={{
            width: "100%", padding: "14px 16px", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 12, color: "white", fontSize: 15, outline: "none", resize: "none", height: 100, marginBottom: 20, boxSizing: "border-box", fontFamily: "inherit"
          }}
        />

        <div style={{ display: "flex", gap: 12 }}>
          <Btn variant="secondary" onClick={onClose} style={{ flex: 1 }}>Cancel</Btn>
          <Btn onClick={handleSubmit} disabled={submitting} style={{ flex: 1 }}>{submitting ? "Submitting..." : "Submit"}</Btn>
        </div>
      </div>
    </div>
  );
}

// ─── NGO DASHBOARD COMPONENTS ────────────────────────────────────────────────

function BrowsePage({ available, setPage, handleRequest }) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [filterDistrict, setFilterDistrict] = useState("");
  const [filterPlace, setFilterPlace] = useState("");

  const filtered = available.filter(a => {
    const matchesSearch = a.foodName.toLowerCase().includes(search.toLowerCase()) || search === "";
    const matchesDistrict = filterDistrict ? a.location?.includes(filterDistrict) : true;
    const matchesPlace = filterPlace ? a.location?.includes(filterPlace) : true;
    return matchesSearch && matchesDistrict && matchesPlace;
  });

  return (
    <div>
      <h2 style={{ color: "white", fontFamily: "'Georgia', serif", fontSize: 26, margin: "0 0 20px" }}>🔍 Browse Available Food</h2>
      <div style={{ display: "flex", gap: "20px", flexDirection: "column", marginBottom: "20px" }}>
        <Input label="" placeholder="Search food items..." value={search} onChange={e => setSearch(e.target.value)} icon="🔍" />
        <LocationSelector 
          label="Filter by Location (Optional)"
          district={filterDistrict} 
          setDistrict={setFilterDistrict} 
          place={filterPlace} 
          setPlace={setFilterPlace} 
        />
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {["all", "cooked", "raw", "bakery"].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: "8px 18px", borderRadius: 20, border: "1px solid rgba(255,255,255,0.2)", background: filter === f ? COLORS.amber : "rgba(255,255,255,0.06)", color: "white", fontSize: 13, cursor: "pointer", fontFamily: "inherit", textTransform: "capitalize" }}>
            {f === "all" ? "All Items" : f}
          </button>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {filtered.length === 0 ? (
          <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "40px", color: "rgba(255,255,255,0.5)" }}>No food available near you</div>
        ) : filtered.map(item => (
          <div key={item._id} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 18, padding: "20px", display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 40 }}>🍱</span>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "white" }}>{item.foodName}</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>by {item.donor?.name || 'Donor'}</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <span style={{ fontSize: 12, background: "rgba(74,140,106,0.15)", color: COLORS.mint, padding: "4px 10px", borderRadius: 12 }}>📦 {item.quantity}</span>
              <span style={{ fontSize: 12, background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)", padding: "4px 10px", borderRadius: 12 }}>📍 {item.location}</span>
              <span style={{ fontSize: 12, background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)", padding: "4px 10px", borderRadius: 12 }}>⏰ {new Date(item.createdAt).toLocaleDateString()}</span>
            </div>
            <Btn
              onClick={() => handleRequest(item._id)}
              variant="primary"
              style={{ padding: "10px" }}
            >
              Request This Food
            </Btn>
          </div>
        ))}
      </div>
    </div>
  );
}

function NgoHome({ user, available, claimed, setPage }) {
  const activeRequests = claimed.filter(r => r.status !== 'Delivered');
  const receivedDonations = claimed.filter(r => r.status === 'Delivered');
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ color: "white", fontFamily: "'Georgia', serif", fontSize: 28, margin: "0 0 6px" }}>{greeting}, {user?.name || "NGO"}! 🌿</h2>
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 15, margin: 0 }}>Here's what's available near you.</p>
      </div>
      <div style={{ display: "flex", gap: 16, marginBottom: 28 }}>
        <StatCard icon="🍱" label="Available Now" value={available.length} color={COLORS.mint} sub="Near you" />
        <StatCard icon="📋" label="My Requests" value={activeRequests.length} sub="Active" />
        <StatCard icon="✅" label="Received" value={receivedDonations.length} color="#7ec8a0" sub="Total meals" />
      </div>
      <div style={{ background: "rgba(74,140,106,0.1)", border: "1px solid rgba(74,140,106,0.25)", borderRadius: 18, padding: "20px 22px", marginBottom: 24 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "white", marginBottom: 14 }}>🗺️ Available Food Near You</div>
        {available.length === 0 ? (
          <div style={{ padding: "20px", textAlign: "center", color: "rgba(255,255,255,0.5)" }}>No food available near you</div>
        ) : available.slice(0, 3).map(item => (
          <div key={item._id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <span style={{ fontSize: 24 }}>🍱</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "white" }}>{item.foodName}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{item.donor?.name || 'Donor'} · {item.location}</div>
            </div>
            <span onClick={() => setPage("browse")} style={{ fontSize: 12, color: COLORS.amberLight, cursor: "pointer", fontWeight: 600 }}>View →</span>
          </div>
        ))}
        {available.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <Btn onClick={() => setPage("browse")} variant="secondary" style={{ padding: "11px" }}>Browse All Available Food →</Btn>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── NGO DASHBOARD ──────────────────────────────────────────────────────

function NgoDashboard({ onLogout }) {
  const [page, setPage] = useState("ngoHome");
  const [user, setUser] = useState(null);
  const [feedbackReqId, setFeedbackReqId] = useState(null);

  const [available, setAvailable] = useState([]);
  const [claimed, setClaimed] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markNotificationsRead = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      await axios.put("http://localhost:5000/api/notifications/read", {}, { headers: { Authorization: \`Bearer \${token}\` } });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.log("Error marking notifications as read", err);
    }
  };

  const fetchData = async (token) => {
    try {
      const availRes = await axios.get("http://localhost:5000/api/donations", {
        headers: { Authorization: \`Bearer \${token}\` }
      });
      setAvailable(availRes.data.data || []);

      const reqRes = await axios.get("http://localhost:5000/api/requests", {
        headers: { Authorization: \`Bearer \${token}\` }
      });
      setClaimed(reqRes.data.data || []);

      const notifRes = await axios.get("http://localhost:5000/api/notifications", {
        headers: { Authorization: \`Bearer \${token}\` }
      });
      setNotifications(notifRes.data.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios.get("http://localhost:5000/api/auth/me", {
        headers: { Authorization: \`Bearer \${token}\` }
      })
      .then(res => setUser(res.data.user))
      .catch(err => console.log(err));

      fetchData(token);
      const interval = setInterval(() => fetchData(token), 5000);
      return () => clearInterval(interval);
    }
  }, []);

  const handleRequest = async (foodId) => {
    const token = localStorage.getItem("token");
    try {
      await axios.post("http://localhost:5000/api/requests", { foodId }, {
        headers: { Authorization: \`Bearer \${token}\` }
      });
      fetchData(token);
      toast.success("Request sent successfully!", { icon: "✅" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to request food");
    }
  };

  const pages = {
    ngoHome: <NgoHome user={user} available={available} claimed={claimed} setPage={setPage} />,
    browse: <BrowsePage available={available} setPage={setPage} handleRequest={handleRequest} />,
    myRequests: (
      <div>
        <h2 style={{ color: "white", fontFamily: "'Georgia', serif", fontSize: 26, margin: "0 0 20px" }}>📋 My Requests</h2>
        {claimed.filter(r => r.status !== 'Delivered').length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "rgba(255,255,255,0.4)" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🫙</div>
            <p>No requests yet.</p>
            <Btn onClick={() => setPage("browse")} style={{ maxWidth: 200, margin: "0 auto" }}>Browse Food</Btn>
          </div>
        ) : claimed.filter(r => r.status !== 'Delivered').map(item => (
          <div key={item._id} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: "18px 20px", marginBottom: 12, display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ fontSize: 36 }}>🍱</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: "white" }}>{item.foodId?.foodName || "Food Item"}</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>Requested on {new Date(item.createdAt).toLocaleDateString()}</div>
            </div>
            <div style={{ background: "rgba(232,146,58,0.15)", color: COLORS.amberLight, fontSize: 12, fontWeight: 600, padding: "6px 14px", borderRadius: 20 }}>{item.status}</div>
          </div>
        ))}
      </div>
    ),
    history: (
      <div>
        <h2 style={{ color: "white", fontFamily: "'Georgia', serif", fontSize: 26, margin: "0 0 20px" }}>📜 Donation History</h2>
        {claimed.filter(r => r.status === 'Delivered').length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "rgba(255,255,255,0.4)" }}>
            <p>No donations received yet.</p>
          </div>
        ) : claimed.filter(r => r.status === 'Delivered').map((h) => (
          <div key={h._id} style={{ background: "rgba(74,140,106,0.08)", border: "1px solid rgba(74,140,106,0.2)", borderRadius: 16, padding: "16px 20px", marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontWeight: 700, color: "white" }}>{h.foodId?.foodName || "Food Item"}</span>
              <span style={{ fontSize: 12, background: "rgba(126,200,160,0.2)", color: COLORS.mint, padding: "4px 12px", borderRadius: 12 }}>✅ Received</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>Received on {new Date(h.updatedAt).toLocaleDateString()}</div>
              <Btn onClick={() => setFeedbackReqId(h._id)} variant="secondary" style={{ padding: "6px 12px", fontSize: 12, width: "auto" }}>⭐ Leave Feedback</Btn>
            </div>
          </div>
        ))}
      </div>
    ),
    notifications: <NotificationsPage notifications={notifications} onMarkRead={markNotificationsRead} />,
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar role="ngo" activePage={page} onNav={setPage} onLogout={onLogout} user={user} unreadCount={unreadCount} />
      <div style={{ flex: 1, padding: "36px 40px", overflowY: "auto" }}>{pages[page]}</div>
      <FeedbackModal 
        isOpen={!!feedbackReqId} 
        onClose={() => setFeedbackReqId(null)} 
        requestId={feedbackReqId}
        onSubmit={() => setFeedbackReqId(null)}
      />
    </div>
  );
}
\n`;

const newContent = preContent + refactored + postContent;
fs.writeFileSync(filepath, newContent, 'utf8');
console.log("Dashboards successfully extracted and refactored.");
