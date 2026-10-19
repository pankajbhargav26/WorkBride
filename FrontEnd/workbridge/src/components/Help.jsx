
import React, { useState } from "react";
import "./Pages.css";

export default function Help() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    topic: "Finding a service",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);

  function handleChange(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
    setSubmitted(false);
  }

  function handleSubmit(event) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <main className="wb-page wb-inner-page">
      <section className="wb-page-hero">
        <span className="wb-eyebrow">
          <span className="wb-live-dot"></span>
          WE ARE HERE TO HELP
        </span>

        <h1>
          Let’s figure it
          <br />
          <span>out together.</span>
        </h1>

        <p>
          Tell us what you need help with. Choose a topic
          and share a few details.
        </p>
      </section>

      <section className="wb-help-layout">
        <aside className="wb-help-aside">
          <span className="wb-kicker">HOW CAN WE HELP?</span>

          <h2>One clear message can be a good start.</h2>

          <p>
            Whether you are exploring services, joining as a
            professional or reporting an issue, we want to help
            make the next step clearer.
          </p>

          <div className="wb-help-info">
            <span>✉</span>
            <div>
              <strong>General questions</strong>
              <small>Tell us about your question using the form.</small>
            </div>
          </div>

          <div className="wb-help-info">
            <span>◷</span>
            <div>
              <strong>Report an issue</strong>
              <small>
                Explain the problem without sharing passwords
                or sensitive information.
              </small>
            </div>
          </div>
        </aside>

        <form className="wb-contact-form" onSubmit={handleSubmit}>
          <div className="wb-form-heading">
            <span className="wb-kicker">CONTACT FORM</span>
            <h2>Send us a message</h2>
          </div>

          {submitted && (
            <div className="wb-success" role="status">
              Thank you, {form.name}! Your form was submitted
              in this demo. Backend connection is still required
              to send your message to a server.
            </div>
          )}

          <label>
            Your name
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter your name"
              required
            />
          </label>

          <label>
            Email address
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
            />
          </label>

          <label>
            What do you need help with?
            <select
              name="topic"
              value={form.topic}
              onChange={handleChange}
            >
              <option>Finding a service</option>
              <option>Joining as a professional</option>
              <option>Reporting an issue</option>
              <option>General question</option>
            </select>
          </label>

          <label>
            Your message
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              placeholder="Tell us what you need..."
              rows="4"
              required
            />
          </label>

          <button className="wb-btn wb-btn-primary wb-submit" type="submit">
            Submit message ↗
          </button>

          <small className="wb-note">
            Frontend demo only. Messages are not sent to a server.
          </small>
        </form>
      </section>
    </main>
  );
}
