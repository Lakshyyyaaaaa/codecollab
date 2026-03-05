import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import toast from "react-hot-toast";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/auth/register", formData);
      login(res.data.user, res.data.accessToken);
      toast.success("Account created!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logo}>⚡ CodeCollab</div>
        <h2 style={styles.title}>Create account</h2>
        <p style={styles.subtitle}>Start coding together today</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="coolcoder123"
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              style={styles.input}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={loading ? { ...styles.button, opacity: 0.7 } : styles.button}
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p style={styles.footer}>
          Already have an account?{" "}
          <Link to="/login" style={styles.link}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #1e1e2e 0%, #181825 100%)",
    padding: "20px",
  },
  card: {
    background: "#313244",
    borderRadius: "16px",
    padding: "40px",
    width: "100%",
    maxWidth: "420px",
    boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
  },
  logo: {
    fontSize: "1.8rem",
    fontWeight: "800",
    color: "#cba6f7",
    marginBottom: "24px",
    textAlign: "center",
  },
  title: {
    fontSize: "1.5rem",
    fontWeight: "700",
    color: "#cdd6f4",
    marginBottom: "8px",
    textAlign: "center",
  },
  subtitle: {
    color: "#6c7086",
    textAlign: "center",
    marginBottom: "32px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    color: "#cdd6f4",
    fontSize: "0.9rem",
    fontWeight: "500",
  },
  input: {
    padding: "12px 16px",
    borderRadius: "8px",
    border: "1px solid #45475a",
    background: "#1e1e2e",
    color: "#cdd6f4",
    fontSize: "1rem",
    outline: "none",
  },
  button: {
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    background: "linear-gradient(135deg, #cba6f7, #89b4fa)",
    color: "#1e1e2e",
    fontSize: "1rem",
    fontWeight: "700",
    cursor: "pointer",
    marginTop: "8px",
  },
  footer: {
    textAlign: "center",
    marginTop: "24px",
    color: "#6c7086",
  },
  link: {
    color: "#cba6f7",
    textDecoration: "none",
    fontWeight: "600",
  },
};

export default Register;
