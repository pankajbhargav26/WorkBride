import React from "react";
import { Link, useParams } from "react-router-dom";

import Header from "./header";
import Footer from "./footer";
import servicesData from "../data/serviceData";

import "./ServiceDetails.css";

const PROFESSIONALS = [
  {
    initials: "RK",
    name: "Rajesh Kumar",
    rating: 4.8,
    reviews: 124,
    experience: "5 Years Experience",
    distance: "2.5 km",
    price: 299,
    top: true,
  },
  {
    initials: "AS",
    name: "Amit Sharma",
    rating: 4.7,
    reviews: 98,
    experience: "7 Years Experience",
    distance: "3.2 km",
    price: 349,
  },
];

const TRUST = [
  { icon: "✓", title: "Verified Professionals", text: "Background checked and verified workers." },
  { icon: "★", title: "Quality Service", text: "Highly rated professionals you can trust." },
  { icon: "₹", title: "Transparent Pricing", text: "No hidden charges or unexpected costs." },
];

function ServiceDetails() {
  const { serviceName } = useParams();

  const service = servicesData[serviceName];

  // Agar service nahi mili
  if (!service) {
    return (
      <>
        <Header />

        <div className="service-not-found">
          <div className="not-found-card">
            <div className="not-found-icon">🔍</div>
            <h2>Service Not Found</h2>
            <p>Sorry, the service you are looking for does not exist.</p>

            <Link to="/" className="book-button">
              ← Back to Home
            </Link>
          </div>
        </div>

        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />

      <div className="service-page">
        {/* ================= HERO ================= */}

        <section className="service-hero">
          <div className="service-hero-inner">
            <nav className="breadcrumb">
              <Link to="/">Home</Link>
              <span>/</span>
              <span>Services</span>
              <span>/</span>
              <b>{service.name}</b>
            </nav>

            <div className="service-hero-content">
              <div className="service-big-icon">{service.icon}</div>

              <div className="service-hero-text">
                <span className="service-badge">
                  {service.subServices.length} SERVICES AVAILABLE
                </span>

                <h1>{service.name}</h1>

                <p>{service.description}</p>

                <div className="service-perks">
                  <span>✓ Verified pros</span>
                  <span>⚡ Quick response</span>
                  <span>₹ Transparent pricing</span>
                </div>

                <div className="service-hero-actions">
                  <Link to="/post-job" className="book-button">
                    Post a Job →
                  </Link>

                  <a href="#professionals" className="ghost-button">
                    Browse professionals
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= MAIN CONTENT ================= */}

        <main className="service-main">
          {/* ================= SUB SERVICES ================= */}

          <section className="sub-services">
            <div className="section-heading">
              <div>
                <h2>What do you need help with?</h2>

                <p>Select a service and find the right professional for the job.</p>
              </div>
            </div>

            <div className="sub-service-grid">
              {service.subServices.map((item, index) => (
                <Link
                  key={index}
                  to={`/services/${serviceName}/${item.toLowerCase().replaceAll(" ", "-")}`}
                  className="sub-service-card"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <span className="sub-service-icon">{service.icon}</span>

                  <div className="sub-service-card-content">
                    <h3>{item}</h3>

                    <p>Professional {item.toLowerCase()} service</p>
                  </div>

                  <span className="sub-service-arrow">→</span>
                </Link>
              ))}
            </div>
          </section>

          {/* ================= PROFESSIONALS ================= */}

          <section className="professionals" id="professionals">
            <div className="professionals-header">
              <div>
                <h2>Top Professionals Near You</h2>

                <p>Trusted and verified professionals ready to help.</p>
              </div>

              <Link to="/workers" className="view-all">
                View All →
              </Link>
            </div>

            <div className="professionals-grid">
              {PROFESSIONALS.map((p) => (
                <div className={`professional-card ${p.top ? "top" : ""}`} key={p.name}>
                  {p.top && <span className="top-ribbon">★ TOP RATED</span>}

                  <div className="worker-avatar">{p.initials}</div>

                  <div className="worker-info">
                    <h3>
                      {p.name}
                      <span className="verified-pill">✓ Verified</span>
                    </h3>

                    <div className="worker-rating">
                      <span>★</span>
                      <strong>{p.rating}</strong>
                      <span>({p.reviews} reviews)</span>
                    </div>

                    <div className="worker-meta">
                      <span>🛠 {p.experience}</span>
                      <span>📍 {p.distance}</span>
                    </div>
                  </div>

                  <div className="worker-action">
                    <div className="worker-price">
                      <small>Starting from</small>
                      <strong>₹{p.price}</strong>
                    </div>

                    <button className="book-button">Book Now</button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ================= TRUST SECTION ================= */}

          <section className="service-trust">
            {TRUST.map((t) => (
              <div className="trust-card" key={t.title}>
                <div className="trust-icon">{t.icon}</div>

                <div>
                  <h4>{t.title}</h4>
                  <p>{t.text}</p>
                </div>
              </div>
            ))}
          </section>

          {/* ================= CTA BANNER ================= */}

          <section className="sd-cta">
            <div>
              <h2>Can't find what you're looking for?</h2>

              <p>
                Post your job and let verified {service.name.toLowerCase()} professionals come
                to you.
              </p>
            </div>

            <Link to="/post-job" className="book-button light">
              Post a Job →
            </Link>
          </section>
        </main>
      </div>

      <Footer />
    </>
  );
}

export default ServiceDetails;