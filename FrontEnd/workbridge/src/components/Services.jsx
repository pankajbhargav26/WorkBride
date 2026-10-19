
import React from "react";
import "./Pages.css";

const services = [
  ["🔧", "Home Repairs", "Doors, shelves, fixtures and everyday repairs."],
  ["⚡", "Electrical", "Switches, fans, lights and electrical troubleshooting."],
  ["🚿", "Plumbing", "Leaking taps, clogged drains and bathroom fittings."],
  ["🧹", "Cleaning", "Routine cleaning and deep-cleaning services."],
  ["🎨", "Painting", "Refresh your walls and give your home a new look."],
  ["🪛", "Installation", "Furniture assembly, shelves and fixture installation."],
];

export default function Services() {
  return (
    <main className="wb-page wb-inner-page">
      <section className="wb-page-hero">
        <span className="wb-eyebrow">
          <span className="wb-live-dot"></span>
          WORKBRIDGE SERVICES
        </span>

        <h1>
          What can we help
          <br />
          <span>you fix today?</span>
        </h1>

        <p>
          Choose a service or describe your exact problem.
          We will help you figure out the next step.
        </p>

        <a className="wb-btn wb-btn-primary" href="/help">
          Describe your problem ↗
        </a>
      </section>

      <section className="wb-section">
        <div className="wb-section-heading">
          <div>
            <span className="wb-kicker">EXPLORE CATEGORIES</span>
            <h2>
              Help for your <span>everyday needs.</span>
            </h2>
          </div>
        </div>

        <div className="wb-card-grid">
          {services.map(([icon, title, description]) => (
            <article className="wb-service-card" key={title}>
              <div className="wb-service-top">
                <div className="wb-service-icon">{icon}</div>
                <span className="wb-tag">Service</span>
              </div>

              <h3>{title}</h3>
              <p>{description}</p>

              <a href="/help">
                Find help <span>↗</span>
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className="wb-cta-band">
        <div>
          <span className="wb-kicker">NEED SOMETHING DIFFERENT?</span>
          <h2>Explain the problem in your own words.</h2>
        </div>
        <a className="wb-btn wb-btn-light" href="/help">
          Get guidance ↗
        </a>
      </section>
    </main>
  );
}
