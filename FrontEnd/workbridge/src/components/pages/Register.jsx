
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../../config/api.js";
import "./Register.css";

const SERVICES = [
  "Electrical",
  "Plumbing",
  "AC Repair",
  "Cleaning",
  "Painting",
  "Carpentry",
  "Handyman",
  "Shifting",
];

function Register() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "customer",
    serviceCategories: [],
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleServiceChange = (e) => {
    const { value, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      serviceCategories: checked
        ? [...prev.serviceCategories, value]
        : prev.serviceCategories.filter((service) => service !== value),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (
      formData.role === "technician" &&
      formData.serviceCategories.length === 0
    ) {
      setMessage("Please select at least one service category.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ...formData,
        serviceCategories:
          formData.role === "technician"
            ? formData.serviceCategories
            : [],
      };

      const response = await axios.post(
        `${API_BASE_URL}/auth/register`,
        payload
      );

      if (response.data.token) {
        localStorage.setItem("workBridgeToken", response.data.token);
      }

      if (response.data.user) {
        localStorage.setItem(
          "workBridgeUser",
          JSON.stringify(response.data.user)
        );
      }

      setMessage("Registration successful!");

      const userRole = response.data.user?.role || formData.role;

      if (userRole === "technician") {
        navigate("/worker-dashboard");
      } else {
        navigate(state?.from === "/post-job" ? "/post-job" : "/");
      }
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">
        <Link to="/" className="register-brand">
          WorkBridge
        </Link>

        <h1>Create Account</h1>

        <p className="register-subtitle">
          Join WorkBridge and get started today.
        </p>

        {message && <p className="register-message">{message}</p>}

        <form onSubmit={handleSubmit}>
          <label htmlFor="register-name">Full Name</label>
          <input
            id="register-name"
            type="text"
            name="name"
            placeholder="Enter your full name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <label htmlFor="register-email">Email Address</label>
          <input
            id="register-email"
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <label htmlFor="register-password">Password</label>
          <input
            id="register-password"
            type="password"
            name="password"
            placeholder="Create a password"
            value={formData.password}
            onChange={handleChange}
            minLength={8}
            required
          />

          <label htmlFor="register-role">Register As</label>
          <select
            id="register-role"
            name="role"
            value={formData.role}
            onChange={handleChange}
          >
            <option value="customer">Customer</option>
            <option value="technician">Technician</option>
          </select>

          {formData.role === "technician" && (
            <div className="service-selection">
              <label>Select Your Services</label>

              {SERVICES.map((service) => (
                <label key={service} className="service-option">
                  <input
                    type="checkbox"
                    value={service}
                    checked={formData.serviceCategories.includes(service)}
                    onChange={handleServiceChange}
                  />
                  {service}
                </label>
              ))}
            </div>
          )}

          <button type="submit" disabled={loading}>
            {loading ? "Creating Account..." : "Register"}
          </button>
        </form>

        <p className="register-login-link">
          Already have an account? <Link to="/login">Sign In</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
