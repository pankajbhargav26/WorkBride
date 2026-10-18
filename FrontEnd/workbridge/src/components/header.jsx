import React from "react";
import "./Header.css";

const services = [
  { icon: "🔧", name: "Plumbing" },
  { icon: "⚡", name: "Electrical" },
  { icon: "🧹", name: "Cleaning" },
  { icon: "🎨", name: "Painting" },
  { icon: "❄️", name: "AC Repair" },
  { icon: "🪚", name: "Carpentry" },
  { icon: "🔨", name: "Handyman" },
  { icon: "🚚", name: "Moving" },
];

function Header() {
  return (
    <section className="hero">

      {/* Background */}
      <div className="hero-overlay"></div>

      {/* Navigation */}
      <header className="navbar">

        {/* Logo */}
        <a href="/" className="logo">
          <span className="logo-icon">W</span>
          <span>WorkBridge</span>
        </a>

        {/* Center Navigation */}
        <nav className="nav-links">
          <a href="/" className="active">Home</a>
          <a href="#services">Services</a>
          <a href="#how-it-works">How It Works</a>
          <a href="#workers">For Pros</a>
          <a href="#cities">Cities</a>
          <a href="#help">Help</a>
        </nav>

        {/* Right Button */}
        <a href="/register-worker" className="worker-btn">
          Become a Worker
        </a>

      </header>

      {/* Hero Content */}
      <div className="hero-content">

        <div className="hero-badge">
          ✦ VERIFIED LOCAL PROFESSIONALS
        </div>

        <h1>
          Trusted Home Services
          <br />
          <span>Near You</span>
        </h1>

        <p>
          Find trusted local professionals for your home.
          <br />
          Book reliable workers and get the job done.
        </p>

        {/* Search */}
        <div className="search-box">

          <div className="search-service">
            <span>⌕</span>
            <input
              type="text"
              placeholder="What service do you need?"
            />
          </div>

          <div className="search-location">
            <span>📍</span>
            <input
              type="text"
              placeholder="Your location"
            />
          </div>

          <button className="search-btn">
            Search
          </button>

        </div>

        {/* CTA Buttons */}
        <div className="hero-buttons">
          <a href="/post-job" className="primary-btn">
            Post Your Job <span>→</span>
          </a>

          <a href="/workers" className="secondary-btn">
            Find a Worker <span>→</span>
          </a>
        </div>

      </div>

      {/* Popular Services */}
      <div className="popular-services">

        <div className="popular-title">
          POPULAR SERVICES
        </div>

        <div className="services-list">

          {services.map((service, index) => (
            <a
              href={`/services/${service.name.toLowerCase()}`}
              className="service-item"
              key={index}
            >
              <div className="service-icon">
                {service.icon}
              </div>

              <span>{service.name}</span>
            </a>
          ))}

        </div>

      </div>

    </section>
  );
}

export default Header;