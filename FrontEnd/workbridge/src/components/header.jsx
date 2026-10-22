import { Link, NavLink } from "react-router-dom";
import "./header.css";

function Header() {
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
        <NavLink to="/my-jobs">My Jobs</NavLink>
        <NavLink to="/help">Help</NavLink>
      </nav>

      <Link to="/for-pros" className="worker-btn">
        Become a Worker
      </Link>
    </header>
  );
}

export default Header;