
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./login.css";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        formData
      );

      if (response.data.token) {
        localStorage.setItem("workbridgeToken", response.data.token);
      }

      if (response.data.user) {
        localStorage.setItem(
          "workbridgeUser",
          JSON.stringify(response.data.user)
        );
      }

      navigate("/");
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Login failed. Check your email and password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <Link to="/" className="login-brand">
          WorkBridge
        </Link>

        <h1>Welcome Back!</h1>
        <p className="login-subtitle">
          Sign in to continue to your account.
        </p>

        {message && <p className="login-message">{message}</p>}

        <form onSubmit={handleSubmit}>
          <label htmlFor="login-email">Email Address</label>
          <input
            id="login-email"
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            type="password"
            name="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <p className="login-register-link">
          Don't have an account? <Link to="/register">Register</Link>
        </p>

        <Link to="/" className="login-home-link">
          Back to Home
        </Link>
      </div>
    </div>
  );
}

export default Login;
