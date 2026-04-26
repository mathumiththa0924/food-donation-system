import { useState, useEffect, useRef } from "react";

const COLORS = {
  forest: "#1a3a2a",
  forestMid: "#234d38",
  forestLight: "#2d6347",
  sage: "#4a8c6a",
  mint: "#7ec8a0",
  cream: "#fdf6ec",
  warmWhite: "#fffaf4",
  amber: "#e8923a",
  amberLight: "#f4b96e",
  gold: "#d4a017",
  charcoal: "#1c2b22",
  textMuted: "#5a7a65",
  cardBg: "rgba(253,246,236,0.08)",
  glassBg: "rgba(255,255,255,0.07)",
  glassBorder: "rgba(255,255,255,0.15)",
};

const foodItems = ["🍱","🥘","🍲","🥗","🍞","🥦","🍅","🥕","🍎","🥚","🧆","🫕"];

function FloatingFood({ count = 12 }) {
  const items = useRef(
    Array.from({ length: count }, (_, i) => ({
      emoji: foodItems[i % foodItems.length],
      x: Math.random() * 90 + 5,
      y: Math.random() * 90 + 5,
      size: Math.random() * 18 + 14,
      dur: Math.random() * 8 + 10,
      delay: Math.random() * 6,
      drift: Math.random() * 40 - 20,
    }))
  ).current;

  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
      {items.map((item, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${item.x}%`,
            top: `${item.y}%`,
            fontSize: item.size,
            opacity: 0.12,
            animation: `floatFood${i % 3} ${item.dur}s ${item.delay}s infinite ease-in-out`,
            filter: "saturate(0.4)",
          }}
        >
          {item.emoji}
        </div>
      ))}
      <style>{`
        @keyframes floatFood0 { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-20px) rotate(8deg)} }
        @keyframes floatFood1 { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-28px) rotate(-6deg)} }
        @keyframes floatFood2 { 0%,100%{transform:translateY(0) rotate(0deg)} 33%{transform:translateY(-15px) rotate(10deg)} 66%{transform:translateY(-25px) rotate(-4deg)} }
      `}</style>
    </div>
  );
}

function GlassCard({ children, style = {}, animate = false }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.06)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      border: "1px solid rgba(255,255,255,0.13)",
      borderRadius: 24,
      padding: "36px 40px",
      boxShadow: "0 8px 40px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.1)",
      animation: animate ? "slideUp 0.5s ease forwards" : "none",
      ...style,
    }}>
      {children}
    </div>
  );
}

function Input({ label, type = "text", placeholder, value, onChange, icon }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.55)", letterSpacing: "1.2px", textTransform: "uppercase", marginBottom: 8 }}>
        {label}
      </label>
      <div style={{ position: "relative" }}>
        {icon && (
          <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", fontSize: 16, opacity: 0.6 }}>
            {icon}
          </span>
        )}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: "100%",
            padding: icon ? "14px 16px 14px 44px" : "14px 16px",
            background: focused ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.07)",
            border: `1px solid ${focused ? "rgba(232,146,58,0.7)" : "rgba(255,255,255,0.15)"}`,
            borderRadius: 12,
            color: "white",
            fontSize: 15,
            outline: "none",
            transition: "all 0.2s",
            boxSizing: "border-box",
            fontFamily: "inherit",
          }}
        />
      </div>
    </div>
  );
}

function Select({ label, options, value, onChange }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.55)", letterSpacing: "1.2px", textTransform: "uppercase", marginBottom: 8 }}>
        {label}
      </label>
      <select
        value={value}
        onChange={onChange}
        style={{
          width: "100%",
          padding: "14px 16px",
          background: "rgba(255,255,255,0.07)",
          border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: 12,
          color: value ? "white" : "rgba(255,255,255,0.45)",
          fontSize: 15,
          outline: "none",
          cursor: "pointer",
          fontFamily: "inherit",
          appearance: "none",
          WebkitAppearance: "none",
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='rgba(255,255,255,0.5)' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 16px center",
        }}
      >
        {options.map(o => (
          <option key={o.value} value={o.value} style={{ background: COLORS.forest, color: "white" }}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function Btn({ children, onClick, variant = "primary", disabled = false, style = {} }) {
  const [hov, setHov] = useState(false);
  const base = {
    width: "100%",
    padding: "15px",
    borderRadius: 14,
    fontSize: 16,
    fontWeight: 700,
    cursor: disabled ? "not-allowed" : "pointer",
    border: "none",
    transition: "all 0.25s",
    fontFamily: "inherit",
    letterSpacing: "0.3px",
    opacity: disabled ? 0.5 : 1,
  };
  const variants = {
    primary: {
      background: hov ? "#f0a050" : COLORS.amber,
      color: "white",
      boxShadow: hov ? "0 8px 30px rgba(232,146,58,0.5)" : "0 4px 16px rgba(232,146,58,0.3)",
      transform: hov ? "translateY(-1px)" : "none",
    },
    secondary: {
      background: hov ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.07)",
      color: "white",
      border: "1px solid rgba(255,255,255,0.2)",
    },
    danger: {
      background: hov ? "#c0392b" : "#e74c3c",
      color: "white",
      boxShadow: hov ? "0 4px 20px rgba(231,76,60,0.4)" : "none",
    },
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ ...base, ...variants[variant], ...style }}
    >
      {children}
    </button>
  );
}

// ─── PAGES ────────────────────────────────────────────────────────────────────

function LoginPage({ onNavigate }) {
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    if (!role || !email || !pass) return alert("Please fill all fields!");
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onNavigate(role === "admin" ? "adminDash" : role === "donor" ? "donorDash" : "ngoDash");
    }, 1200);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ width: "100%", maxWidth: 440 }}>
        <GlassCard animate>
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 12, color: COLORS.amberLight, letterSpacing: "2px", textTransform: "uppercase", fontWeight: 600, marginBottom: 6 }}>
              WELCOME BACK
            </div>
            <h1 style={{ fontSize: 32, fontWeight: 800, color: "white", margin: 0, fontFamily: "'Georgia', serif" }}>
              Sign in to continue
            </h1>
          </div>
          <Select
            label="Select Your Role"
            value={role}
            onChange={e => setRole(e.target.value)}
            options={[
              { value: "", label: "Choose a role..." },
              { value: "donor", label: "🤝 Food Donor" },
              { value: "ngo", label: "🙏 NGO" },
              { value: "admin", label: "⚙️ Administrator" },
            ]}
          />
          <Input label="Email Address" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} icon="✉️" />
          <Input label="Password" type="password" placeholder="Enter your password" value={pass} onChange={e => setPass(e.target.value)} icon="🔒" />
          <div style={{ textAlign: "right", marginTop: -12, marginBottom: 24 }}>
            <span style={{ fontSize: 13, color: COLORS.amberLight, cursor: "pointer" }}>Forgot password?</span>
          </div>
          <Btn onClick={handleLogin} disabled={loading}>
            {loading ? "Signing in..." : "Login →"}
          </Btn>
          <p style={{ textAlign: "center", marginTop: 20, fontSize: 14, color: "rgba(255,255,255,0.5)" }}>
            New to Meal Bridge?{" "}
            <span style={{ color: COLORS.amberLight, cursor: "pointer", fontWeight: 600 }} onClick={() => onNavigate("register")}>
              Create an account
            </span>
          </p>
        </GlassCard>
      </div>
    </div>
  );
}

function RegisterPage({ onNavigate }) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({ role: "", name: "", email: "", phone: "", pass: "", org: "" });
  const [loading, setLoading] = useState(false);

  const set = k => e => setData(d => ({ ...d, [k]: e.target.value }));

  const handleRegister = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); onNavigate("login"); }, 1500);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ width: "100%", maxWidth: 480 }}>
        <GlassCard animate>
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
              {[1, 2].map(i => (
                <div key={i} style={{
                  flex: 1, height: 4, borderRadius: 2,
                  background: i <= step ? COLORS.amber : "rgba(255,255,255,0.15)",
                  transition: "background 0.3s",
                }} />
              ))}
            </div>
            <div style={{ fontSize: 12, color: COLORS.amberLight, letterSpacing: "2px", textTransform: "uppercase", fontWeight: 600, marginBottom: 6 }}>
              JOIN THE COMMUNITY · Step {step} of 2
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: "white", margin: 0, fontFamily: "'Georgia', serif" }}>
              {step === 1 ? "Create your account" : "Tell us more"}
            </h1>
          </div>

          {step === 1 && <>
            <Select label="I want to join as" value={data.role} onChange={set("role")} options={[
              { value: "", label: "Choose your role..." },
              { value: "donor", label: "🤝 Food Donor — I have food to share" },
              { value: "ngo", label: "🙏 NGO — We distribute food to those in need" },
            ]} />
            <Input label="Full Name" placeholder="Your full name" value={data.name} onChange={set("name")} icon="👤" />
            <Input label="Email" type="email" placeholder="your@email.com" value={data.email} onChange={set("email")} icon="✉️" />
            <Input label="Password" type="password" placeholder="Create a strong password" value={data.pass} onChange={set("pass")} icon="🔒" />
            <Btn onClick={() => setStep(2)}>Continue →</Btn>
          </>}

          {step === 2 && <>
            <Input label="Phone Number" placeholder="+94 7X XXX XXXX" value={data.phone} onChange={set("phone")} icon="📱" />
            <Input label={data.role === "donor" ? "Organization / Restaurant Name" : "NGO Name / Area"} placeholder={data.role === "donor" ? "e.g. Green Leaf Restaurant" : "e.g. Helping Hands Puttalam"} value={data.org} onChange={set("org")} icon={data.role === "donor" ? "🏢" : "📍"} />
            <div style={{ background: "rgba(232,146,58,0.1)", border: "1px solid rgba(232,146,58,0.25)", borderRadius: 12, padding: "14px 16px", marginBottom: 20 }}>
              <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.65)", lineHeight: 1.6 }}>
                ✅ By registering, you agree to our Terms of Service and Community Guidelines. All donations are subject to food safety verification.
              </p>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <Btn variant="secondary" onClick={() => setStep(1)} style={{ width: "auto", padding: "15px 24px", flex: "0 0 auto" }}>← Back</Btn>
              <Btn onClick={handleRegister} disabled={loading} style={{ flex: 1 }}>
                {loading ? "Creating account..." : "Create Account 🎉"}
              </Btn>
            </div>
          </>}

          <p style={{ textAlign: "center", marginTop: 20, fontSize: 14, color: "rgba(255,255,255,0.5)" }}>
            Already have an account?{" "}
            <span style={{ color: COLORS.amberLight, cursor: "pointer", fontWeight: 600 }} onClick={() => onNavigate("login")}>Sign in</span>
          </p>
        </GlassCard>
      </div>
    </div>
  );
}

// ─── DASHBOARD SHELL ──────────────────────────────────────────────────────────

function Sidebar({ role, activePage, onNav, onLogout }) {
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
      { id: "history", icon: "📜", label: "History" },
      { id: "messages", icon: "💬", label: "Messages" },
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
  const roleColors = { donor: "#e8923a", ngo: "#4a8c6a", admin: "#7b68ee" };

  return (
    <div style={{
      width: 240,
      minHeight: "100vh",
      background: "rgba(0,0,0,0.3)",
      borderRight: "1px solid rgba(255,255,255,0.08)",
      display: "flex",
      flexDirection: "column",
      padding: "24px 0",
      flexShrink: 0,
    }}>
      <div style={{ padding: "0 14px", flex: 1, marginTop: "24px" }}>
        {items.map(item => {
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
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            background: roleColors[role],
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, fontWeight: 700, color: "white",
          }}>
            {role === "admin" ? "A" : role === "donor" ? "D" : "N"}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "white" }}>
              {role === "admin" ? "Admin User" : role === "donor" ? "John Donor" : "Mary NGO"}
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{roleLabels[role]}</div>
          </div>
        </div>
        <div
          onClick={onLogout}
          style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 10, cursor: "pointer", color: "rgba(255,100,100,0.7)" }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,100,100,0.08)"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        >
          <span style={{ fontSize: 16 }}>🚪</span>
          <span style={{ fontSize: 14 }}>Logout</span>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color = COLORS.amber, sub }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.06)",
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: 18,
      padding: "20px 22px",
      flex: 1,
    }}>
      <div style={{ fontSize: 28, marginBottom: 10 }}>{icon}</div>
      <div style={{ fontSize: 28, fontWeight: 800, color, marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 13, fontWeight: 600, color: "white" }}>{label}</div>
      {sub && <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

// ─── DONOR DASHBOARD ──────────────────────────────────────────────────────────

function DonorDashboard({ onLogout }) {
  const [page, setPage] = useState("donorHome");
  const [donations, setDonations] = useState([
    { id: 1, food: "Rice & Curry", qty: "20 portions", status: "available", location: "Puttalam Town", time: "2h ago", emoji: "🍱" },
    { id: 2, food: "Bread Loaves", qty: "15 items", status: "claimed", location: "Kalpitiya", time: "1d ago", emoji: "🍞" },
    { id: 3, food: "Mixed Vegetables", qty: "10 kg", status: "completed", location: "Puttalam", time: "3d ago", emoji: "🥦" },
  ]);

  const statusColors = { available: "#4CAF50", claimed: COLORS.amber, completed: COLORS.sage };
  const statusBg = { available: "rgba(76,175,80,0.15)", claimed: "rgba(232,146,58,0.15)", completed: "rgba(74,140,106,0.15)" };

  function DonateForm() {
    const [form, setForm] = useState({ food: "", category: "", qty: "", unit: "portions", location: "", pickup: "", notes: "", expiry: "" });
    const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = () => {
      if (!form.food || !form.qty || !form.location) return alert("Please fill required fields!");
      setDonations(d => [{ id: Date.now(), food: form.food, qty: `${form.qty} ${form.unit}`, status: "available", location: form.location, time: "Just now", emoji: "🍱" }, ...d]);
      setSubmitted(true);
      setTimeout(() => { setSubmitted(false); setPage("myDonations"); }, 2000);
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
          <Input label="Pickup Location *" placeholder="Address or area" value={form.location} onChange={set("location")} icon="📍" />
          <Input label="Pickup Time" placeholder="e.g. Today 5pm - 8pm" value={form.pickup} onChange={set("pickup")} icon="⏰" />
          <Input label="Expiry / Best Before" placeholder="e.g. Tonight, Tomorrow morning" value={form.expiry} onChange={set("expiry")} icon="📅" />
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

  function MyDonations() {
    return (
      <div>
        <h2 style={{ color: "white", fontFamily: "'Georgia', serif", fontSize: 26, margin: "0 0 20px" }}>📋 My Donations</h2>
        {donations.map(d => (
          <div key={d.id} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: "18px 20px", marginBottom: 12, display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ fontSize: 36, width: 52, textAlign: "center" }}>{d.emoji}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: "white", marginBottom: 4 }}>{d.food}</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>📍 {d.location} · {d.qty} · {d.time}</div>
            </div>
            <div style={{ background: statusBg[d.status], color: statusColors[d.status], fontSize: 12, fontWeight: 600, padding: "6px 14px", borderRadius: 20, textTransform: "capitalize" }}>
              {d.status}
            </div>
          </div>
        ))}
      </div>
    );
  }

  function ImpactPage() {
    const metrics = [
      { label: "Total Meals Donated", value: 142, icon: "🍽️" },
      { label: "People Fed", value: 380, icon: "👥" },
      { label: "Food Waste Prevented", value: "28 kg", icon: "♻️" },
      { label: "Donation Streak", value: "14 days", icon: "🔥" },
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
          <div style={{ fontSize: 18, fontWeight: 700, color: "white", marginBottom: 8 }}>🌟 Donor Badge: Community Hero</div>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", margin: 0 }}>
            You've made an incredible impact! Keep donating to unlock the "Regional Champion" badge at 200 meals donated.
          </p>
        </div>
      </div>
    );
  }

  function MessagesPage() {
    const msgs = [
      { from: "Mary N.", text: "Thank you so much for the rice! Our community was really grateful 🙏", time: "1h ago", read: false },
      { from: "MealBridge Team", text: "Your donation has been successfully claimed by a verified NGO.", time: "3h ago", read: true },
      { from: "Ahmed K.", text: "The vegetables were very fresh. God bless you!", time: "2d ago", read: true },
    ];
    return (
      <div>
        <h2 style={{ color: "white", fontFamily: "'Georgia', serif", fontSize: 26, margin: "0 0 20px" }}>💬 Messages</h2>
        {msgs.map((m, i) => (
          <div key={i} style={{ background: m.read ? "rgba(255,255,255,0.04)" : "rgba(232,146,58,0.08)", border: `1px solid ${m.read ? "rgba(255,255,255,0.08)" : "rgba(232,146,58,0.2)"}`, borderRadius: 16, padding: "16px 20px", marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontWeight: 700, color: "white", fontSize: 14 }}>{m.from}</span>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{m.time}</span>
            </div>
            <p style={{ margin: 0, fontSize: 14, color: "rgba(255,255,255,0.65)", lineHeight: 1.5 }}>{m.text}</p>
          </div>
        ))}
      </div>
    );
  }

  function DonorHome() {
    return (
      <div>
        <div style={{ marginBottom: 28 }}>
          <h2 style={{ color: "white", fontFamily: "'Georgia', serif", fontSize: 28, margin: "0 0 6px" }}>Good morning, John! 👋</h2>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 15, margin: 0 }}>Ready to make a difference today?</p>
        </div>
        <div style={{ display: "flex", gap: 16, marginBottom: 28 }}>
          <StatCard icon="🍱" label="Total Donated" value="142" sub="Meals shared" />
          <StatCard icon="👥" label="People Helped" value="380" color={COLORS.mint} sub="This month" />
          <StatCard icon="✅" label="Completed" value="28" color="#7ec8a0" sub="Donations" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 28 }}>
          <div onClick={() => setPage("donate")} style={{ background: `linear-gradient(135deg, rgba(232,146,58,0.3), rgba(232,146,58,0.1))`, border: "1px solid rgba(232,146,58,0.4)", borderRadius: 18, padding: "24px", cursor: "pointer", transition: "transform 0.2s" }}
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
            <div key={d.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <span style={{ fontSize: 24 }}>{d.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "white" }}>{d.food}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{d.qty} · {d.time}</div>
              </div>
              <span style={{ fontSize: 12, color: statusColors[d.status], fontWeight: 600 }}>● {d.status}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const pages = {
    donorHome: <DonorHome />,
    donate: <DonateForm />,
    myDonations: <MyDonations />,
    impact: <ImpactPage />,
    messages: <MessagesPage />,
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar role="donor" activePage={page} onNav={setPage} onLogout={onLogout} />
      <div style={{ flex: 1, padding: "36px 40px", overflowY: "auto" }}>
        {pages[page] || <DonorHome />}
      </div>
    </div>
  );
}

// ─── NGO DASHBOARD ──────────────────────────────────────────────────────

function NgoDashboard({ onLogout }) {
  const [page, setPage] = useState("ngoHome");
  const [claimed, setClaimed] = useState([]);
  const available = [
    { id: 1, food: "Rice & Curry", donor: "Green Leaf Restaurant", qty: "20 portions", location: "Puttalam Town", time: "2h ago", emoji: "🍱", distance: "1.2 km" },
    { id: 2, food: "Fresh Vegetables", donor: "City Market", qty: "15 kg", location: "Main Market", time: "4h ago", emoji: "🥦", distance: "2.5 km" },
    { id: 3, food: "Bread & Bakery", donor: "Golden Bakery", qty: "30 items", location: "West Street", time: "1h ago", emoji: "🍞", distance: "0.8 km" },
    { id: 4, food: "Cooked Dal", donor: "Community Kitchen", qty: "50 portions", location: "Town Hall Area", time: "30m ago", emoji: "🫕", distance: "3.1 km" },
  ];

  function BrowsePage() {
    const [filter, setFilter] = useState("all");
    const [search, setSearch] = useState("");
    const filtered = available.filter(a => filter === "all" || true).filter(a => a.food.toLowerCase().includes(search.toLowerCase()) || search === "");

    return (
      <div>
        <h2 style={{ color: "white", fontFamily: "'Georgia', serif", fontSize: 26, margin: "0 0 20px" }}>🔍 Browse Available Food</h2>
        <Input label="" placeholder="Search food items..." value={search} onChange={e => setSearch(e.target.value)} icon="🔍" />
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {["all", "cooked", "raw", "bakery"].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: "8px 18px", borderRadius: 20, border: "1px solid rgba(255,255,255,0.2)", background: filter === f ? COLORS.amber : "rgba(255,255,255,0.06)", color: "white", fontSize: 13, cursor: "pointer", fontFamily: "inherit", textTransform: "capitalize" }}>
              {f === "all" ? "All Items" : f}
            </button>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {filtered.map(item => (
            <div key={item.id} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 18, padding: "20px", display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 40 }}>{item.emoji}</span>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "white" }}>{item.food}</div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>by {item.donor}</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <span style={{ fontSize: 12, background: "rgba(74,140,106,0.15)", color: COLORS.mint, padding: "4px 10px", borderRadius: 12 }}>📦 {item.qty}</span>
                <span style={{ fontSize: 12, background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)", padding: "4px 10px", borderRadius: 12 }}>📍 {item.distance}</span>
                <span style={{ fontSize: 12, background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)", padding: "4px 10px", borderRadius: 12 }}>⏰ {item.time}</span>
              </div>
              <Btn
                onClick={() => { setClaimed(c => [...c, item]); alert(`✅ Request sent for "${item.food}"!`); }}
                variant={claimed.find(c => c.id === item.id) ? "secondary" : "primary"}
                style={{ padding: "10px" }}
              >
                {claimed.find(c => c.id === item.id) ? "✅ Requested" : "Request This Food"}
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
        <div style={{ marginBottom: 28 }}>
          <h2 style={{ color: "white", fontFamily: "'Georgia', serif", fontSize: 28, margin: "0 0 6px" }}>Welcome, Mary NGO! 🌿</h2>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 15, margin: 0 }}>Here's what's available near you.</p>
        </div>
        <div style={{ display: "flex", gap: 16, marginBottom: 28 }}>
          <StatCard icon="🍱" label="Available Now" value={available.length} color={COLORS.mint} sub="Near you" />
          <StatCard icon="📋" label="My Requests" value={claimed.length} sub="Active" />
          <StatCard icon="✅" label="Received" value="8" color="#7ec8a0" sub="Total meals" />
        </div>
        <div style={{ background: "rgba(74,140,106,0.1)", border: "1px solid rgba(74,140,106,0.25)", borderRadius: 18, padding: "20px 22px", marginBottom: 24 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "white", marginBottom: 14 }}>🗺️ Available Food Near You</div>
          {available.slice(0, 3).map(item => (
            <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <span style={{ fontSize: 24 }}>{item.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "white" }}>{item.food}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{item.donor} · {item.distance}</div>
              </div>
              <span onClick={() => setPage("browse")} style={{ fontSize: 12, color: COLORS.amberLight, cursor: "pointer", fontWeight: 600 }}>View →</span>
            </div>
          ))}
          <div style={{ marginTop: 16 }}>
            <Btn onClick={() => setPage("browse")} variant="secondary" style={{ padding: "11px" }}>Browse All Available Food →</Btn>
          </div>
        </div>
      </div>
    );
  }

  const pages = {
    ngoHome: <NgoHome />,
    browse: <BrowsePage />,
    myRequests: (
      <div>
        <h2 style={{ color: "white", fontFamily: "'Georgia', serif", fontSize: 26, margin: "0 0 20px" }}>📋 My Requests</h2>
        {claimed.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "rgba(255,255,255,0.4)" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🫙</div>
            <p>No requests yet. Browse available food to get started.</p>
            <Btn onClick={() => setPage("browse")} style={{ maxWidth: 200, margin: "0 auto" }}>Browse Food</Btn>
          </div>
        ) : claimed.map(item => (
          <div key={item.id} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: "18px 20px", marginBottom: 12, display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ fontSize: 36 }}>{item.emoji}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: "white" }}>{item.food}</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>{item.donor} · {item.location}</div>
            </div>
            <div style={{ background: "rgba(232,146,58,0.15)", color: COLORS.amberLight, fontSize: 12, fontWeight: 600, padding: "6px 14px", borderRadius: 20 }}>Pending</div>
          </div>
        ))}
      </div>
    ),
    history: (
      <div>
        <h2 style={{ color: "white", fontFamily: "'Georgia', serif", fontSize: 26, margin: "0 0 20px" }}>📜 Donation History</h2>
        {[{ food: "Rice & Curry", from: "Spice Garden", date: "15 Apr 2026", qty: "5 portions" }, { food: "Mixed Veg", from: "Farm Fresh", date: "10 Apr 2026", qty: "3 kg" }].map((h, i) => (
          <div key={i} style={{ background: "rgba(74,140,106,0.08)", border: "1px solid rgba(74,140,106,0.2)", borderRadius: 16, padding: "16px 20px", marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontWeight: 700, color: "white" }}>{h.food}</span>
              <span style={{ fontSize: 12, background: "rgba(126,200,160,0.2)", color: COLORS.mint, padding: "4px 12px", borderRadius: 12 }}>✅ Received</span>
            </div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>From {h.from} · {h.qty} · {h.date}</div>
          </div>
        ))}
      </div>
    ),
    messages: (
      <div>
        <h2 style={{ color: "white", fontFamily: "'Georgia', serif", fontSize: 26, margin: "0 0 20px" }}>💬 Messages</h2>
        <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: "20px" }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "white", marginBottom: 8 }}>MealBridge Support</div>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.6, margin: 0 }}>Your food request for "Rice & Curry" has been approved. Please collect by 8 PM at Puttalam Town center. 🍱</p>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginTop: 8 }}>Today, 3:45 PM</div>
        </div>
      </div>
    ),
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar role="ngo" activePage={page} onNav={setPage} onLogout={onLogout} />
      <div style={{ flex: 1, padding: "36px 40px", overflowY: "auto" }}>{pages[page]}</div>
    </div>
  );
}

// ─── ADMIN DASHBOARD ──────────────────────────────────────────────────────────

function AdminDashboard({ onLogout }) {
  const [page, setPage] = useState("adminHome");
  const users = [
    { name: "Green Leaf Restaurant", role: "Donor", donations: 42, status: "Active", joined: "Jan 2026" },
    { name: "Mary Fernando", role: "NGO", donations: 0, requests: 8, status: "Active", joined: "Feb 2026" },
    { name: "City Market Puttalam", role: "Donor", donations: 28, status: "Active", joined: "Mar 2026" },
    { name: "Ahmed Rasheed", role: "NGO", requests: 12, status: "Pending", joined: "Apr 2026" },
  ];

  const roleColors = { Donor: COLORS.amber, NGO: COLORS.mint, Admin: "#7b68ee" };
  const statusColors = { Active: "#4CAF50", Pending: COLORS.amber, Suspended: "#e74c3c" };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar role="admin" activePage={page} onNav={setPage} onLogout={onLogout} />
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
                {[{ food: "Rice & Curry", donor: "Green Leaf", qty: "20p", time: "2h ago" }, { food: "Bread", donor: "Golden Bakery", qty: "30 items", time: "4h ago" }, { food: "Vegetables", donor: "City Market", qty: "15kg", time: "6h ago" }].map((d, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", fontSize: 13 }}>
                    <span style={{ color: "white" }}>{d.food}</span>
                    <span style={{ color: "rgba(255,255,255,0.4)" }}>{d.donor} · {d.time}</span>
                  </div>
                ))}
              </div>
              <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 18, padding: "20px" }}>
                <div style={{ fontWeight: 700, color: "white", marginBottom: 16 }}>Platform Health</div>
                {[{ label: "Active Donors", val: 240, max: 400 }, { label: "Active NGOs", val: 180, max: 300 }, { label: "Successful Matches", val: 89, max: 100, pct: true }].map(m => (
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
              {[{ label: "This Week", val: "324 meals", icon: "📅" }, { label: "This Month", val: "1,240 meals", icon: "🗓️" }, { label: "Growth Rate", val: "+18%", icon: "📈" }].map(s => (
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
        {(page === "donations" || page === "settings") && (
          <div>
            <h2 style={{ color: "white", fontFamily: "'Georgia', serif", fontSize: 26, margin: "0 0 20px" }}>
              {page === "donations" ? "📦 All Donations" : "⚙️ Settings"}
            </h2>
            <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 18, padding: "24px", textAlign: "center", color: "rgba(255,255,255,0.4)" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🚧</div>
              <p>This section is under development.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────

export default function App() {
  const [page, setPage] = useState("login");

  const bgStyle = {
    minHeight: "100vh",
    background: "#1a3a2a",
    color: "white",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    position: "relative",
    overflow: "hidden",
  };

  const nav = (p) => setPage(p);

  return (
    <div style={bgStyle}>
      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes bounceIn { 0% { transform: scale(0); } 60% { transform: scale(1.2); } 100% { transform: scale(1); } }
        * { box-sizing: border-box; }
        input::placeholder, textarea::placeholder { color: rgba(255,255,255,0.35) !important; }
        select option { background: #1a3a2a !important; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 3px; }
      `}</style>

      <FloatingFood count={16} />

      <div style={{ position: "relative", zIndex: 1 }}>
        {page === "login" && <LoginPage onNavigate={nav} />}
        {page === "register" && <RegisterPage onNavigate={nav} />}
        {page === "donorDash" && <DonorDashboard onLogout={() => nav("login")} />}
        {page === "ngoDash" && <NgoDashboard onLogout={() => nav("login")} />}
        {page === "adminDash" && <AdminDashboard onLogout={() => nav("login")} />}
      </div>
    </div>
  );
}
