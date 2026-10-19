
import React from "react";
import "./Pages.css";

const cities = [
  ["01", "Delhi NCR", "Home services for everyday needs."],
  ["02", "Lucknow", "Local help for repairs and maintenance."],
  ["03", "Kanpur", "Support for repairs and installations."],
  ["04", "Ghaziabad", "Find the right category for your home."],
  ["05", "Noida", "A simpler way to explore local services."],
  ["06", "Jhansi", "Describe your needs and explore services."],
];

export default function Cities() {
  return (
    <main className="wb-page wb-inner-page">
      <section className="wb-page-hero">
        <span className="wb-eyebrow">
          <span className="wb-live-dot"></span>
          LOCAL HELP, MADE CLEAR
        </span>

        <h1>
          Good help starts
          <br />
          <span>closer to home.</span>
        </h1>

        <p>
          Explore locations designed for the WorkBridge
          experience. Live city availability can be connected later.
        </p>
      </section>

      <section className="wb-section">
        <div className="wb-section-heading">
          <div>
            <span className="wb-kicker">EXPLORE LOCATIONS</span>
            <h2>
              Designed for <span>local communities.</span>
            </h2>
          </div>
          <span className="wb-tag">Demo locations</span>
        </div>

        <div className="wb-city-grid">
          {cities.map(([number, name, description]) => (
            <article className="wb-city-card" key={name}>
              <div className="wb-city-number">{number}</div>

              <div>
                <h3>{name}</h3>
                <p>{description}</p>
              </div>

              <a href="/services" aria-label={`Explore services in ${name}`}>
                ↗
              </a>
            </article>
          ))}
        </div>

        <p className="wb-footnote">
          These are sample locations. Actual professional availability
          will depend on your backend and database.
        </p>
      </section>

      <section className="wb-cta-band">
        <div>
          <span className="wb-kicker">NEED HELP IN YOUR AREA?</span>
          <h2>Tell us where you need help.</h2>
        </div>

        <a className="wb-btn wb-btn-light" href="/help">
          Contact us ↗
        </a>
      </section>
    </main>
  );
}
