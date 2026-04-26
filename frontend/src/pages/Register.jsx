import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Input from "../components/Input";
import { registerUser } from "../api/auth";

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("donor");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !role) {
      setError("Please fill all required fields.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");
      await registerUser({ name, email, password, role });
      setSuccess("Registration successful. Redirecting to login...");
      setTimeout(() => navigate("/login"), 900);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 20 }}>
      <form onSubmit={handleSubmit} style={{ width: "100%", maxWidth: 420 }}>
        <h2 style={{ color: "white" }}>Register</h2>
        {error ? <p style={{ color: "#ffb3b3" }}>{error}</p> : null}
        {success ? <p style={{ color: "#b8f2b8" }}>{success}</p> : null}
        <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <div style={{ marginBottom: 12 }}>
          <label style={{ color: "white" }}>Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value)} style={{ width: "100%", padding: 10 }}>
            <option value="donor">Donor</option>
            <option value="ngo">NGO</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <button type="submit" disabled={loading} style={{ width: "100%", padding: 12 }}>
          {loading ? "Creating..." : "Create Account"}
        </button>
        <p style={{ color: "white" }}>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
}
