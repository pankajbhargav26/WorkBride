import React from "react";
import { Link } from "react-router-dom";
import "./header.css";

const services = [
  { icon: "🔧", name: "Plumbing", slug: "plumbing" },
  { icon: "⚡", name: "Electrical", slug: "electrical" },
  { icon: "🧹", name: "Cleaning", slug: "cleaning" },
  { icon: "🎨", name: "Painting", slug: "painting" },
  { icon: "❄️", name: "AC Repair", slug: "ac-repair" },
  { icon: "🪚", name: "Carpentry", slug: "carpentry" },
  { icon: "🔨", name: "Handyman", slug: "handyman" },
  { icon: "🚚", name: "Moving", slug: "moving" },
];

function Home() {
  return (
    <section className="hero">
      <div className="hero-overlay"></div>

      <div className="hero-content">
        <div className="hero-badge">✦ VERIFIED LOCAL PROFESSIONALS</div>

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

        <div className="hero-buttons">
          <Link to="/post-job" className="primary-btn">
            Post Your Job <span>→</span>
          </Link>
          <Link to="/workers" className="secondary-btn">
            Find a Worker <span>→</span>
          </Link>
        </div>
      </div>

      <div className="popular-services">
        <div className="popular-title">POPULAR SERVICES</div>

        <div className="services-list">
          {services.map((service) => (
            <Link
              to={`/services/${service.slug}`}
              className="service-item"
              key={service.slug}
            >
              <div className="service-icon">{service.icon}</div>
              <span>{service.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Home;