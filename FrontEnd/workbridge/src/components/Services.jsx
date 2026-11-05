
import { Link } from "react-router-dom";
import servicesData from "../data/serviceData";
import "./Pages.css";

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

        <Link className="wb-btn wb-btn-primary" to="/help">
          Describe your problem ↗
        </Link>
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
          {Object.entries(servicesData).map(([slug, service]) => (
            <article className="wb-service-card" key={slug}>
              <div className="wb-service-top">
                <div className="wb-service-icon">{service.icon}</div>
                <span className="wb-tag">Service</span>
              </div>

              <h3>{service.name}</h3>
              <p>{service.description}</p>

              <Link to={`/services/${slug}`}>
                Find help <span>↗</span>
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="wb-cta-band">
        <div>
          <span className="wb-kicker">NEED SOMETHING DIFFERENT?</span>
          <h2>Explain the problem in your own words.</h2>
        </div>
        <Link className="wb-btn wb-btn-light" to="/help">
          Get guidance ↗
        </Link>
      </section>
    </main>
  );
}
