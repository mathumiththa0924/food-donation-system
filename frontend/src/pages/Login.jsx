import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Input from "../components/Input";
import { loginUser } from "../api/auth";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const roles = [
    { id: "donor", label: "Donor" },
    { id: "ngo", label: "NGO" },
    { id: "admin", label: "Admin" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || !role) {
      setError("Please fill all fields and select role.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const response = await loginUser({ email, password });
      const token = response.token;
      const user = response?.data?.user;

      if (!token || !user) {
        setError("Invalid login response from server.");
        return;
      }
      if (user.role !== role) {
        setError("Selected role does not match your account role.");
        return;
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      if (user.role === "donor") navigate("/donor");
      else if (user.role === "ngo") navigate("/ngo");
      else navigate("/admin");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 20 }}>
      <form onSubmit={handleSubmit} style={{ width: "100%", maxWidth: 420 }}>
        <h2 style={{ color: "white" }}>Login</h2>
        {error ? <p style={{ color: "#ffb3b3" }}>{error}</p> : null}
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          {roles.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setRole(r.id)}
              style={{
                flex: 1,
                padding: "10px",
                borderRadius: 8,
                border: "1px solid #ffffff33",
                background: role === r.id ? "#e8923a" : "#ffffff1a",
                color: "white",
                cursor: "pointer",
              }}
            >
              {r.label}
            </button>
          ))}
        </div>
        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="submit" disabled={loading} style={{ width: "100%", padding: 12 }}>
          {loading ? "Signing in..." : "Sign In"}
        </button>
        <p style={{ color: "white" }}>
          No account? <Link to="/register">Register</Link>
        </p>
      </form>
    </div>
  );
}
