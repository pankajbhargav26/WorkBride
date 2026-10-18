import React from "react";
import { Link, useParams } from "react-router-dom";

import Header from "./header";
import Footer from "./footer";
import servicesData from "../data/serviceData";

import "./ServiceDetails.css";

function ServiceDetails() {
  const { serviceName } = useParams();

  const service = servicesData[serviceName];

  // Agar service nahi mili
  if (!service) {
    return (
      <>
        <Header />

        <div className="service-not-found">
          <div>
            <h2>Service Not Found</h2>
            <p>
              Sorry, the service you are looking for does not exist.
            </p>

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

          <div className="service-main">

            <Link to="/" className="back-button">
              ← Back to Home
            </Link>

            <div className="service-hero-content">

              <div className="service-big-icon">
                {service.icon}
              </div>

              <div>
                <h1>{service.name}</h1>

                <p>
                  {service.description}
                </p>
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

                <p>
                  Select a service and find the right professional for the job.
                </p>
              </div>
            </div>


            <div className="sub-service-grid">

              {service.subServices.map((item, index) => (

                <Link
                  key={index}
                  to={`/services/${serviceName}/${item
                    .toLowerCase()
                    .replaceAll(" ", "-")}`}
                  className="sub-service-card"
                >

                  <div className="sub-service-card-content">

                    <h3>{item}</h3>

                    <p>
                      Professional {item.toLowerCase()} service
                    </p>

                  </div>

                  <span className="sub-service-arrow">
                    →
                  </span>

                </Link>

              ))}

            </div>

          </section>


          {/* ================= PROFESSIONALS ================= */}

          <section className="professionals">

            <div className="professionals-header">

              <div>
                <h2>Top Professionals Near You</h2>

                <p>
                  Trusted and verified professionals ready to help.
                </p>
              </div>

              <Link to="/workers" className="view-all">
                View All →
              </Link>

            </div>


            <div className="professionals-grid">

              {/* Professional 1 */}

              <div className="professional-card">

                <div className="worker-avatar">
                  RK
                </div>

                <div className="worker-info">

                  <h3>Rajesh Kumar</h3>

                  <div className="worker-rating">
                    <span>★</span>
                    <strong>4.8</strong>
                    <span>(124 reviews)</span>
                  </div>

                  <div className="worker-meta">
                    <span>✓ Verified</span>
                    <span>5 Years Experience</span>
                    <span>2.5 km</span>
                  </div>

                </div>


                <div className="worker-action">

                  <div className="worker-price">

                    <small>Starting from</small>

                    <strong>
                      ₹299
                    </strong>

                  </div>

                  <button className="book-button">
                    Book Now
                  </button>

                </div>

              </div>


              {/* Professional 2 */}

              <div className="professional-card">

                <div className="worker-avatar">
                  AS
                </div>

                <div className="worker-info">

                  <h3>Amit Sharma</h3>

                  <div className="worker-rating">
                    <span>★</span>
                    <strong>4.7</strong>
                    <span>(98 reviews)</span>
                  </div>

                  <div className="worker-meta">
                    <span>✓ Verified</span>
                    <span>7 Years Experience</span>
                    <span>3.2 km</span>
                  </div>

                </div>


                <div className="worker-action">

                  <div className="worker-price">

                    <small>Starting from</small>

                    <strong>
                      ₹349
                    </strong>

                  </div>

                  <button className="book-button">
                    Book Now
                  </button>

                </div>

              </div>

            </div>

          </section>


          {/* ================= TRUST SECTION ================= */}

          <section className="service-trust">

            <div className="trust-card">

              <div className="trust-icon">
                ✓
              </div>

              <div>
                <h4>Verified Professionals</h4>

                <p>
                  Background checked and verified workers.
                </p>
              </div>

            </div>


            <div className="trust-card">

              <div className="trust-icon">
                ★
              </div>

              <div>
                <h4>Quality Service</h4>

                <p>
                  Highly rated professionals you can trust.
                </p>
              </div>

            </div>


            <div className="trust-card">

              <div className="trust-icon">
                ₹
              </div>

              <div>
                <h4>Transparent Pricing</h4>

                <p>
                  No hidden charges or unexpected costs.
                </p>
              </div>

            </div>

          </section>

        </main>

      </div>

      <Footer />
    </>
  );
}

export default ServiceDetails;