
import React from "react";
import "./Pages.css";

export default function ForPros() {
  return (
    <main className="wb-page wb-inner-page">
      <section className="wb-pro-hero">
        <div className="wb-pro-copy">
          <span className="wb-eyebrow">
            <span className="wb-live-dot"></span>
            FOR SKILLED PROFESSIONALS
          </span>

          <h1>
            Your skills deserve
            <br />
            <span>more opportunities.</span>
          </h1>

          <p>
            Bring your expertise to WorkBridge. Help customers
            solve real problems, build trust and grow your
            professional presence.
          </p>

          <a className="wb-btn wb-btn-primary" href="/help">
            Join WorkBridge ↗
          </a>
        </div>

        <div className="wb-pro-panel">
          <div className="wb-pro-panel-top">
            <span>YOUR WORK, YOUR GROWTH</span>
            <span className="wb-pro-symbol">✦</span>
          </div>

          <div className="wb-pro-stat">
            <strong>01</strong>
            <div>
              <b>Show your expertise</b>
              <small>Make your services easier to understand.</small>
            </div>
          </div>

          <div className="wb-pro-stat">
            <strong>02</strong>
            <div>
              <b>Understand the job</b>
              <small>Clear details help set expectations.</small>
            </div>
          </div>

          <div className="wb-pro-stat">
            <strong>03</strong>
            <div>
              <b>Build customer trust</b>
              <small>Professional communication matters.</small>
            </div>
          </div>
        </div>
      </section>

      <section className="wb-section">
        <div className="wb-section-heading">
          <div>
            <span className="wb-kicker">WHY WORKBRIDGE?</span>
            <h2>
              Good work should <span>get noticed.</span>
            </h2>
          </div>
        </div>

        <div className="wb-card-grid">
          <article className="wb-service-card">
            <div className="wb-service-icon">◎</div>
            <h3>Clear job details</h3>
            <p>Understand the customer’s problem before planning the work.</p>
          </article>

          <article className="wb-service-card">
            <div className="wb-service-icon">↗</div>
            <h3>Professional presence</h3>
            <p>Show the skills and services you can confidently provide.</p>
          </article>

          <article className="wb-service-card">
            <div className="wb-service-icon">♡</div>
            <h3>Customer trust</h3>
            <p>Build better experiences through communication and feedback.</p>
          </article>
        </div>
      </section>
    </main>
  );
}
