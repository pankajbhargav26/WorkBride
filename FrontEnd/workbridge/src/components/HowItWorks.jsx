
import React from "react";
import "./Pages.css";

const steps = [
  {
    number: "01",
    icon: "🔍",
    title: "Describe Your Problem",
    description:
      "Tell us what you need help with. Explain the issue in your own words so you can find the right service.",
  },
  {
    number: "02",
    icon: "🛠️",
    title: "Choose a Service",
    description:
      "Explore available service categories and select the one that best matches your requirements.",
  },
  {
    number: "03",
    icon: "🤝",
    title: "Connect with a Professional",
    description:
      "Share your job details and connect with a suitable professional to discuss the work.",
  },
  {
    number: "04",
    icon: "⭐",
    title: "Get the Job Done",
    description:
      "Coordinate the work, review the experience and share feedback to help improve WorkBridge.",
  },
];

export default function HowItWorks() {
  return (
    <main className="wb-page wb-inner-page">
      <section className="wb-page-hero">
        <span className="wb-eyebrow">
          <span className="wb-live-dot"></span>
          HOW WORKBRIDGE WORKS
        </span>

        <h1>
          Home services made
          <br />
          <span>simple and stress-free.</span>
        </h1>

        <p>
          From explaining your problem to connecting with the
          right professional, WorkBridge makes the process easier
          to understand.
        </p>

        <a className="wb-btn wb-btn-primary" href="/services">
          Explore Services <span>↗</span>
        </a>
      </section>

      <section className="wb-section">
        <div className="wb-section-heading">
          <div>
            <span className="wb-kicker">FOUR SIMPLE STEPS</span>
            <h2>
              How it <span>works.</span>
            </h2>
          </div>

          <p>Simple process. Clear communication.</p>
        </div>

        <div className="wb-how-grid">
          {steps.map((step) => (
            <article className="wb-how-card" key={step.number}>
              <div className="wb-how-card-top">
                <span className="wb-how-number">
                  {step.number}
                </span>

                <span className="wb-how-icon">
                  {step.icon}
                </span>
              </div>

              <h3>{step.title}</h3>

              <p>{step.description}</p>

              <div className="wb-how-bottom">
                <span>STEP {step.number}</span>
                <span className="wb-how-arrow">↗</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="wb-how-highlight">
        <div className="wb-highlight-icon">✦</div>

        <div>
          <span className="wb-kicker">THE WORKBRIDGE DIFFERENCE</span>
          <h2>
            Your problem deserves
            <br />
            <span>the right attention.</span>
          </h2>
          <p>
            Describe the issue clearly, explore suitable services
            and make more informed decisions about your home.
          </p>
        </div>

        <a className="wb-btn wb-btn-primary" href="/help">
          Get Started ↗
        </a>
      </section>
    </main>
  );
}
