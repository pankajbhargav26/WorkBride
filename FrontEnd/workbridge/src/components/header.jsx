import React from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { clearAuth, getToken } from "../utils/jobWorkflow";
import "./header.css";

function getRole() {
  if (!getToken()) return null;

  try {
    const user = JSON.parse(
      localStorage.getItem("workBridgeUser") ||
        localStorage.getItem("workbridgeUser") ||
        "null"
    );
    return user?.role || null;
  } catch {
    return null;
  }
}

function Header() {
  const navigate = useNavigate();
  useLocation(); // re-render on every page change so links update after login/logout

  const role = getRole();

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  return (
    <header className="navbar">
      <Link to="/" className="logo">
        <span className="logo-icon">W</span>
        <span>WorkBridge</span>
      </Link>

      <nav className="nav-links">
        <NavLink to="/" end>Home</NavLink>
        <NavLink to="/services">Services</NavLink>
        <NavLink to="/how-it-works">How It Works</NavLink>
        <NavLink to="/for-pros">For Pros</NavLink>
        <NavLink to="/cities">Cities</NavLink>
        <NavLink to="/help">Help</NavLink>
        {role === "customer" && <NavLink to="/post-job">Post a Job</NavLink>}
        {role === "customer" && <NavLink to="/my-jobs">My Jobs</NavLink>}
        {role === "technician" && (
          <NavLink to="/worker-dashboard">Dashboard</NavLink>
        )}
      </nav>

      {role ? (
        <button type="button" className="worker-btn" onClick={handleLogout}>
          Logout
        </button>
      ) : (
        <Link to="/login" className="worker-btn">
          Login / Sign Up
        </Link>
      )}
    </header>
  );
}

export default Header;