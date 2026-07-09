import { useState, useEffect } from "react";
import axios from "axios";
import { COLORS } from "../theme";

const ToggleSwitch = ({ checked, onChange, label }) => (
  <label style={{ 
    display: "flex", alignItems: "center", justifyContent: "space-between", 
    cursor: "pointer", padding: "14px 18px", 
    background: "rgba(0,0,0,0.15)", borderRadius: "12px", 
    border: "1px solid rgba(255,255,255,0.05)",
    transition: "background 0.2s"
  }}>
    <span style={{ fontSize: "15px", color: "rgba(255,255,255,0.9)", fontWeight: "500" }}>{label}</span>
    <div style={{ 
      position: "relative", width: "46px", height: "26px", 
      background: checked ? COLORS.amber : "rgba(255,255,255,0.2)", 
      borderRadius: "24px", transition: "background 0.3s" 
    }}>
      <div style={{ 
        position: "absolute", top: "2px", left: checked ? "22px" : "2px", 
        width: "22px", height: "22px", background: "white", 
        borderRadius: "50%", transition: "all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)", 
        boxShadow: "0 2px 4px rgba(0,0,0,0.2)" 
      }} />
    </div>
    <input type="checkbox" checked={checked} onChange={onChange} style={{ display: "none" }} />
  </label>
);

const InputField = ({ label, type = "text", value, onChange, required = false }) => (
  <label style={{ display: "block" }}>
    <div style={{ marginBottom: "8px", color: "rgba(255,255,255,0.8)", fontSize: "14px", fontWeight: "500" }}>{label}</div>
    <input 
      type={type} 
      value={value} 
      onChange={onChange} 
      required={required} 
      style={{ 
        width: "100%", padding: "12px 16px", borderRadius: "12px", 
        border: "1px solid rgba(255,255,255,0.1)", 
        background: "rgba(0,0,0,0.2)", color: "white",
        fontSize: "15px", outline: "none", transition: "border 0.2s, background 0.2s"
      }} 
      onFocus={e => {
        e.target.style.border = `1px solid ${COLORS.amber}`;
        e.target.style.background = "rgba(0,0,0,0.3)";
      }}
      onBlur={e => {
        e.target.style.border = "1px solid rgba(255,255,255,0.1)";
        e.target.style.background = "rgba(0,0,0,0.2)";
      }}
    />
  </label>
);

const SaveButton = ({ text = "Save Changes", loading }) => (
  <button type="submit" disabled={loading} style={{ 
    padding: "14px 24px", background: COLORS.amber, color: "#000", 
    fontWeight: "600", fontSize: "15px", border: "none", borderRadius: "10px", 
    cursor: "pointer", marginTop: "20px", width: "100%",
    boxShadow: `0 4px 14px ${COLORS.amber}40`, transition: "transform 0.2s, box-shadow 0.2s"
  }}
  onMouseEnter={e => { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = `0 6px 20px ${COLORS.amber}60`; }}
  onMouseLeave={e => { e.target.style.transform = "translateY(0)"; e.target.style.boxShadow = `0 4px 14px ${COLORS.amber}40`; }}
  >
    {loading ? "Saving..." : text}
  </button>
);

// eslint-disable-next-line no-unused-vars
export default function AdminSettings({ user, token, setUser }) {
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const api = axios.create({
    baseURL: `http://${window.location.hostname}:5000/api`,
    headers: { Authorization: `Bearer ${token}` }
  });

  // Profile State
  const [profile, setProfile] = useState({ name: "", email: "", phone: "", profileImage: "" });
  const [profilePreview, setProfilePreview] = useState("");
  
  // Platform Information State
  const [settings, setSettings] = useState({
    websiteName: "", contactEmail: "", contactPhone: "", address: "",
    socialFacebook: "", socialTwitter: "", socialInstagram: "",
    emailNotifications: true, adminAlerts: true
  });

  const fetchProfile = async () => {
    try {
      const res = await api.get("/auth/me");
      if (res.data.success) {
        setProfile({
          name: res.data.user.name || "",
          email: res.data.user.email || "",
          phone: res.data.user.phone || "",
          profileImage: null
        });
        if (res.data.user.profileImage) {
           setProfilePreview(res.data.user.profileImage);
        }
      }
    } catch (err) {
      console.error("Error fetching profile", err);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await api.get("/admin/settings");
      if (res.data.success) {
        setSettings(prev => ({ ...prev, ...res.data.data }));
      }
    } catch (err) {
      console.error("Error fetching settings", err);
    }
  };

  useEffect(() => {
    fetchSettings();
     
    fetchProfile();
  }, []);

  const showMessage = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 3000);
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfile({ ...profile, profileImage: file });
      setProfilePreview(URL.createObjectURL(file));
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", profile.name);
      formData.append("email", profile.email);
      formData.append("phone", profile.phone);
      if (profile.profileImage) {
        formData.append("profileImage", profile.profileImage);
      }

      const res = await api.put("/auth/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      showMessage("Profile updated successfully");
      const savedUser = JSON.parse(localStorage.getItem("user"));
      
      const newUserData = { 
        ...savedUser, 
        name: profile.name, 
        email: profile.email,
        profileImage: res.data.data.profileImage || savedUser.profileImage
      };
      localStorage.setItem("user", JSON.stringify(newUserData));
      if (setUser) setUser(newUserData);
      if (newUserData.profileImage) {
         setProfilePreview(newUserData.profileImage);
      }
    } catch (err) {
      showMessage(err.response?.data?.message || "Error updating profile", "error");
    }
    setLoading(false);
  };

  const handleSettingsSave = async (e) => {
    if(e) e.preventDefault();
    setLoading(true);
    try {
      await api.put("/admin/settings", settings);
      showMessage("Platform settings updated successfully");
    } catch (err) {
      showMessage(err.response?.data?.message || "Error updating settings", "error");
    }
    setLoading(false);
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: "👤" },
    { id: "system", label: "System Info", icon: "🌐" }
  ];

  return (
    <div style={{ display: "flex", gap: "30px", minHeight: "700px", color: "white", fontFamily: "'Inter', sans-serif" }}>
      {/* Sidebar */}
      <div style={{ 
        width: "260px", background: COLORS.glassBg, borderRadius: "20px", 
        padding: "24px", border: `1px solid ${COLORS.glassBorder}`, 
        backdropFilter: "blur(12px)", display: "flex", flexDirection: "column", gap: "8px"
      }}>
        <h2 style={{ fontSize: "18px", margin: "0 0 20px 10px", fontWeight: "600", letterSpacing: "0.5px" }}>Settings</h2>
        {tabs.map(tab => (
          <div
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "14px 18px",
              cursor: "pointer",
              borderRadius: "12px",
              background: activeTab === tab.id ? "rgba(255,255,255,0.1)" : "transparent",
              color: activeTab === tab.id ? COLORS.amberLight : "rgba(255,255,255,0.6)",
              fontWeight: activeTab === tab.id ? "600" : "500",
              transition: "all 0.2s ease-in-out",
              display: "flex", alignItems: "center", gap: "12px",
              borderLeft: activeTab === tab.id ? `4px solid ${COLORS.amber}` : "4px solid transparent"
            }}
            onMouseEnter={e => { if (activeTab !== tab.id) e.currentTarget.style.background = "rgba(255,255,255,0.05)" }}
            onMouseLeave={e => { if (activeTab !== tab.id) e.currentTarget.style.background = "transparent" }}
          >
            <span style={{ fontSize: "18px" }}>{tab.icon}</span> 
            {tab.label}
          </div>
        ))}
      </div>

      {/* Content Area */}
      <div style={{ 
        flex: 1, background: COLORS.glassBg, borderRadius: "20px", 
        padding: "40px", border: `1px solid ${COLORS.glassBorder}`, 
        backdropFilter: "blur(12px)", position: "relative", overflow: "hidden"
      }}>
        {/* Subtle decorative glow */}
        <div style={{ position: "absolute", top: "-100px", right: "-100px", width: "300px", height: "300px", background: `${COLORS.amber}20`, filter: "blur(100px)", borderRadius: "50%", zIndex: 0, pointerEvents: "none" }}></div>

        <div style={{ position: "relative", zIndex: 1, maxWidth: "600px" }}>
          {message.text && (
            <div style={{ 
              padding: "14px 20px", borderRadius: "12px", marginBottom: "24px", 
              background: message.type === "error" ? "rgba(231, 76, 60, 0.15)" : "rgba(46, 204, 113, 0.15)", 
              color: message.type === "error" ? "#ff7675" : "#55efc4", 
              border: `1px solid ${message.type === "error" ? "rgba(231,76,60,0.3)" : "rgba(46,204,113,0.3)"}`,
              display: "flex", alignItems: "center", gap: "10px", fontWeight: "500"
            }}>
              <span>{message.type === "error" ? "⚠️" : "✅"}</span> {message.text}
            </div>
          )}

          {/* Profile Settings */}
          {activeTab === "profile" && (
            <form onSubmit={handleProfileSave} style={{ animation: "fadeIn 0.3s ease-in-out" }}>
              <h3 style={{ margin: "0 0 30px", fontSize: "24px", fontWeight: "600" }}>👤 Admin Profile Settings</h3>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "24px", marginBottom: "10px", padding: "20px", background: "rgba(0,0,0,0.15)", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ width: "90px", height: "90px", borderRadius: "50%", background: "rgba(255,255,255,0.05)", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", border: `2px solid ${COLORS.amberLight}` }}>
                    {profilePreview ? (
                      <img src={profilePreview} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <span style={{ fontSize: "36px" }}>👤</span>
                    )}
                  </div>
                  <div>
                    <h4 style={{ margin: "0 0 8px", fontSize: "16px" }}>Profile Picture</h4>
                    <label style={{ 
                      display: "inline-block", padding: "10px 16px", 
                      background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", 
                      borderRadius: "8px", cursor: "pointer", fontSize: "14px", 
                      color: "white", transition: "background 0.2s"
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}
                    onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
                    >
                      Upload New Image
                      <input type="file" accept="image/*" onChange={handleProfileImageChange} style={{ display: "none" }} />
                    </label>
                  </div>
                </div>

                <InputField label="Full Name" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} required />
                <InputField label="Email Address" type="email" value={profile.email} onChange={e => setProfile({...profile, email: e.target.value})} required />
                <InputField label="Phone Number" value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} />
                
                <SaveButton text="Save Profile" loading={loading} />
              </div>
            </form>
          )}

          {/* System Settings */}
          {activeTab === "system" && (
            <form onSubmit={handleSettingsSave} style={{ animation: "fadeIn 0.3s ease-in-out" }}>
              <h3 style={{ margin: "0 0 30px", fontSize: "24px", fontWeight: "600" }}>🌐 System Settings</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div style={{ padding: "20px", background: "rgba(0,0,0,0.15)", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.05)", display: "flex", flexDirection: "column", gap: "16px" }}>
                  <h4 style={{ margin: "0", fontSize: "16px", color: COLORS.amberLight }}>Basic Information</h4>
                  <InputField label="Website Name" value={settings.websiteName} onChange={e => setSettings({...settings, websiteName: e.target.value})} />
                  <InputField label="Contact Email" type="email" value={settings.contactEmail} onChange={e => setSettings({...settings, contactEmail: e.target.value})} />
                  <InputField label="Support Phone Number" value={settings.contactPhone} onChange={e => setSettings({...settings, contactPhone: e.target.value})} />
                  <InputField label="Address" value={settings.address} onChange={e => setSettings({...settings, address: e.target.value})} />
                </div>

                <div style={{ padding: "20px", background: "rgba(0,0,0,0.15)", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.05)", display: "flex", flexDirection: "column", gap: "16px" }}>
                  <h4 style={{ margin: "0", fontSize: "16px", color: COLORS.amberLight }}>Social Media Links</h4>
                  <InputField label="Facebook URL" value={settings.socialFacebook || ""} onChange={e => setSettings({...settings, socialFacebook: e.target.value})} />
                  <InputField label="Twitter URL" value={settings.socialTwitter || ""} onChange={e => setSettings({...settings, socialTwitter: e.target.value})} />
                  <InputField label="Instagram URL" value={settings.socialInstagram || ""} onChange={e => setSettings({...settings, socialInstagram: e.target.value})} />
                </div>

                <div style={{ padding: "20px", background: "rgba(0,0,0,0.15)", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.05)", display: "flex", flexDirection: "column", gap: "16px" }}>
                  <h4 style={{ margin: "0", fontSize: "16px", color: COLORS.amberLight }}>Notification Preferences</h4>
                  <ToggleSwitch label="Enable email notifications" checked={settings.emailNotifications} onChange={e => setSettings({...settings, emailNotifications: e.target.checked})} />
                  <ToggleSwitch label="Enable admin alerts" checked={settings.adminAlerts} onChange={e => setSettings({...settings, adminAlerts: e.target.checked})} />
                </div>

                <SaveButton text="Save System Settings" loading={loading} />
              </div>
            </form>
          )}


        </div>
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
