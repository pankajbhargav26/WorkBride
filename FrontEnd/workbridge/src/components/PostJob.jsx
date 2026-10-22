import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { createJob } from "../api/jobs.js";
import "./PostJob.css";

const SERVICES = [
  { value: "Electrical", icon: "⚡", label: "Electrical" },
  { value: "Plumbing", icon: "🔧", label: "Plumbing" },
  { value: "AC Repair", icon: "❄️", label: "AC Repair" },
  { value: "Cleaning", icon: "🧹", label: "Cleaning" },
  { value: "Painting", icon: "🎨", label: "Painting" },
  { value: "Carpentry", icon: "🔨", label: "Carpentry" },
  { value: "Handyman", icon: "🛠️", label: "Handyman" },
];

const URGENCY = [
  { value: "Urgent", icon: "⚡", hint: "Within 24 hours" },
  { value: "Within a week", icon: "📅", hint: "In the next few days" },
  { value: "Flexible", icon: "🕊️", hint: "No rush" },
];

const STEPS = [
  ["Post your job", "Tell us what service you need."],
  ["Get responses", "Local professionals can respond."],
  ["Choose a professional", "Compare profiles, ratings and prices."],
  ["Get the job done", "Hire the professional that's right for you."],
];

const INITIAL = {
  service: "",
  title: "",
  description: "",
  location: "",
  date: "",
  time: "",
  urgency: "Flexible",
  budget: "",
  name: "",
  phone: "",
};

const MAX_DESC = 500;

const CONFETTI = Array.from({ length: 28 }, (_, i) => ({
  left: `${(i * 37) % 100}%`,
  delay: `${(i % 7) * 0.09}s`,
  color: ["#1769ff", "#6d35e8", "#ffb020", "#22c55e", "#ff5c8a"][i % 5],
  rot: `${(i * 53) % 360}deg`,
}));

function SectionHeading({ num, title, text }) {
  return (
    <div className="form-section-heading">
      <span className="form-number">{num}</span>
      <div>
        <h2>{title}</h2>
        <p>{text}</p>
      </div>
    </div>
  );
}

function PostJob() {
  const [formData, setFormData] = useState(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const today = new Date().toISOString().split("T")[0];

  const progress = useMemo(() => {
    const required = ["service", "title", "description", "location", "date", "time", "name", "phone"];
    const done = required.filter((k) => String(formData[k]).trim() !== "").length;
    return Math.round((done / required.length) * 100);
  }, [formData]);

  const selected = SERVICES.find((s) => s.value === formData.service);

  const handleChange = (e) => {
    let { name, value } = e.target;
    if (name === "phone") value = value.replace(/\D/g, "").slice(0, 10);
    if (name === "description") value = value.slice(0, MAX_DESC);
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    setSubmitting(true);

    try {
      await createJob({
        serviceCategory: formData.service,
        title: formData.title.trim(),
        problemDescription: formData.description.trim(),
        address: formData.location.trim(),
        preferredDate: formData.date,
        preferredTime: formData.time,
        urgency: formData.urgency,
        ...(formData.budget ? { budget: Number(formData.budget) } : {}),
        customerName: formData.name.trim(),
        phone: formData.phone
      });
      setFormData(INITIAL);
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      setSubmitError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <main className="post-job-page">
        {/* ================= HERO ================= */}
        <section className="post-job-hero">
          <div className="post-job-hero-content">
            <span className="post-job-badge">🔨 NEED A PROFESSIONAL?</span>

            <h1>
              Post Your <em>Job</em>
            </h1>

            <p>
              Tell us what you need and connect with trusted professionals near you.
              It takes less than two minutes.
            </p>

            <div className="post-job-perks">
              <span>✓ Free to post</span>
              <span>⚡ Quick responses</span>
              <span>🔒 Private &amp; secure</span>
            </div>
          </div>

          <div className="hero-float" aria-hidden="true">
            <div className="float-icon f1">🔧</div>
            <div className="float-icon f2">⚡</div>
            <div className="float-icon f3">🧹</div>
            <div className="float-icon f4">🎨</div>

            <div className="hero-glass">
              <div className="hg-row">
                <span className="hg-dot" />
                <b>Job posted</b>
                <em>just now</em>
              </div>
              <strong>Fix leaking bathroom tap</strong>
              <p>📍 Your city · ₹500</p>
              <div className="hg-pros">
                <i>👷</i>
                <i>👩‍🔧</i>
                <i>🧑‍🔧</i>
                <span>Pros nearby are viewing</span>
              </div>
            </div>
          </div>
        </section>

        {/* ================= MAIN ================= */}
        <section className="post-job-section">
          <div className="post-job-container">
            {/* ================= FORM ================= */}
            <div className="post-job-form-wrapper">
              <form className="post-job-form" onSubmit={handleSubmit}>
                {/* 01 SERVICE */}
                <div className="form-section">
                  <SectionHeading
                    num="01"
                    title="What service do you need?"
                    text="Choose the type of professional you are looking for."
                  />

                  <div className="service-grid">
                    {SERVICES.map((s) => (
                      <label
                        key={s.value}
                        className={`service-card ${formData.service === s.value ? "selected" : ""}`}
                      >
                        <input
                          type="radio"
                          name="service"
                          value={s.value}
                          checked={formData.service === s.value}
                          onChange={handleChange}
                          required
                        />
                        <span className="post-job-service-icon">{s.icon}</span>
                        <span className="service-label">{s.label}</span>
                        <span className="service-check">✓</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* 02 DETAILS */}
                <div className="form-section">
                  <SectionHeading
                    num="02"
                    title="Tell us about the job"
                    text="Give professionals enough information to understand your requirement."
                  />

                  <div className="form-group">
                    <label>
                      Job Title <span>*</span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="Example: Fix leaking bathroom tap"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      Description <span>*</span>
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Describe what needs to be done..."
                      rows="5"
                      required
                    />
                    <div className="field-foot">
                      <small>Include the problem, size, quantity or special requirements.</small>
                      <small className={formData.description.length > MAX_DESC - 40 ? "count warn" : "count"}>
                        {formData.description.length}/{MAX_DESC}
                      </small>
                    </div>
                  </div>
                </div>

                {/* 03 LOCATION */}
                <div className="form-section">
                  <SectionHeading
                    num="03"
                    title="Where is the work needed?"
                    text="Professionals near this location can respond to your job."
                  />

                  <div className="form-group">
                    <label>
                      Location <span>*</span>
                    </label>
                    <div className="input-with-icon">
                      <span>📍</span>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="Enter your city or locality"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* 04 WHEN + BUDGET */}
                <div className="form-section">
                  <SectionHeading
                    num="04"
                    title="When & budget"
                    text="Tell professionals when you need the work done and what you expect to spend."
                  />

                  <div className="form-row">
                    <div className="form-group">
                      <label>
                        Preferred Date <span>*</span>
                      </label>
                      <input
                        type="date"
                        name="date"
                        min={today}
                        value={formData.date}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>
                        Preferred Time <span>*</span>
                      </label>
                      <input
                        type="time"
                        name="time"
                        value={formData.time}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Budget (optional)</label>
                      <div className="input-with-icon">
                        <span className="rupee">₹</span>
                        <input
                          type="number"
                          name="budget"
                          min="0"
                          value={formData.budget}
                          onChange={handleChange}
                          placeholder="e.g. 500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>How urgent is this?</label>
                    <div className="urgency-options">
                      {URGENCY.map((u) => (
                        <label
                          key={u.value}
                          className={`urgency-option ${formData.urgency === u.value ? "selected" : ""}`}
                        >
                          <input
                            type="radio"
                            name="urgency"
                            value={u.value}
                            checked={formData.urgency === u.value}
                            onChange={handleChange}
                          />
                          <span>
                            <b>{u.icon}</b>
                            <strong>{u.value}</strong>
                            <em>{u.hint}</em>
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 05 CONTACT */}
                <div className="form-section">
                  <SectionHeading
                    num="05"
                    title="Your contact details"
                    text="Professionals can contact you about your job."
                  />

                  <div className="form-row">
                    <div className="form-group">
                      <label>
                        Your Name <span>*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter your name"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>
                        Phone Number <span>*</span>
                      </label>
                      <div className="input-with-icon">
                        <span className="prefix">+91</span>
                        <input
                          type="tel"
                          name="phone"
                          inputMode="numeric"
                          pattern="[0-9]{10}"
                          title="Enter a 10-digit phone number"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="10-digit number"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* SUBMIT */}
                <div className="post-job-submit">
                  <div>
                    <strong>Ready to find a professional?</strong>
                    <p>Your job will be visible to relevant professionals near you.</p>
                  </div>

                  <button type="submit" className="post-job-button" disabled={submitting}>
                    {submitting ? (
                      <>
                        <i className="btn-spinner" /> Posting...
                      </>
                    ) : (
                      <>
                        Post My Job <span>→</span>
                      </>
                    )}
                  </button>
                </div>
                {submitError && (
                  <div className="post-job-error" role="alert">
                    {submitError}
                  </div>
                )}
              </form>
            </div>

            {/* ================= SIDEBAR ================= */}
            <aside className="post-job-sidebar">
              {/* PROGRESS */}
              <div className="progress-card">
                <div className="progress-top">
                  <strong>Your progress</strong>
                  <span>{progress}%</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${progress}%` }} />
                </div>
                <p>
                  {progress === 100
                    ? "All set — you're ready to post!"
                    : "Fill in the required fields to post your job."}
                </p>
              </div>

              {/* LIVE PREVIEW */}
              <div className="preview-card">
                <div className="preview-tag">
                  <i /> LIVE PREVIEW
                </div>

                <div className="preview-head">
                  <span className="preview-icon">{selected ? selected.icon : "🛠️"}</span>
                  <div>
                    <strong>{formData.title || "Your job title"}</strong>
                    <small>{selected ? selected.label : "Select a service"}</small>
                  </div>
                </div>

                <p className="preview-desc">
                  {formData.description || "Your description will appear here as you type..."}
                </p>

                <div className="preview-meta">
                  <span>📍 {formData.location || "Location"}</span>
                  {formData.budget && <span>₹ {formData.budget}</span>}
                  <span className={`pill ${formData.urgency === "Urgent" ? "hot" : ""}`}>
                    {formData.urgency}
                  </span>
                </div>
              </div>

              {/* HOW IT WORKS */}
              <div className="help-card">
                <div className="help-icon">💡</div>
                <h3>How it works</h3>

                {STEPS.map(([title, text], i) => (
                  <div className="help-step" key={title}>
                    <span>{i + 1}</span>
                    <div>
                      <strong>{title}</strong>
                      <p>{text}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* TRUST */}
              <div className="trust-box">
                <div>✓</div>
                <section>
                  <strong>Verified Professionals</strong>
                  <p>Connect with trusted local workers.</p>
                </section>
              </div>

              <div className="trust-box">
                <div>🔒</div>
                <section>
                  <strong>Your Privacy Matters</strong>
                  <p>Your information is kept secure.</p>
                </section>
              </div>
            </aside>
          </div>
        </section>
      </main>
      {/* ================= SUCCESS MODAL ================= */}
      {submitted && (
        <div className="success-overlay" onClick={() => setSubmitted(false)}>
          {CONFETTI.map((c, i) => (
            <span
              key={i}
              className="confetti"
              style={{ left: c.left, animationDelay: c.delay, background: c.color, "--rot": c.rot }}
            />
          ))}
          <div className="success-card" onClick={(e) => e.stopPropagation()}>
            <div className="success-check">✓</div>
            <h3>Job posted successfully!</h3>
            <p>
              Your job has been saved. You can see its details any time in My Jobs.
            </p>
            <div className="success-actions">
              <Link className="post-job-button" to="/my-jobs" onClick={() => setSubmitted(false)}>
                See My Jobs <span>→</span>
              </Link>
              <button className="success-secondary-button" onClick={() => setSubmitted(false)}>
                Post another job
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  );
}

export default PostJob;