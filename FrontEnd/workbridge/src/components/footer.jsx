import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

/* ---------- Link data (edit routes here) ---------- */

const quickLinks = [
  { label: "Home", to: "/" },
  { label: "About Us", to: "/about" },
  { label: "Services", to: "/services" },
  { label: "Find Workers", to: "/workers" },
  { label: "Post a Job", to: "/post-job" },
  { label: "My Jobs", to: "/my-jobs" },
];

const customerLinks = [
  { label: "Register", to: "/register" },
  { label: "Login", to: "/login" },
  { label: "Post a Job", to: "/post-job" },
  { label: "My Jobs", to: "/my-jobs" },
  { label: "Customer Profile", to: "/customer/profile" },
  { label: "Help & Support", to: "/help" },
];

const workerLinks = [
  { label: "Worker Register", to: "/worker/register" },
  { label: "Worker Login", to: "/worker/login" },
  { label: "Available Jobs", to: "/worker/available-jobs" },
  { label: "Accepted Jobs", to: "/worker/accepted-jobs" },
  { label: "Earnings", to: "/worker/earnings" },
  { label: "Worker Profile", to: "/worker/profile" },
];

const supportLinks = [
  { label: "Contact Us", to: "/contact" },
  { label: "Help Center", to: "/help" },
  { label: "FAQ", to: "/faq" },
  { label: "Privacy Policy", to: "/privacy-policy" },
  { label: "Terms & Conditions", to: "/terms" },
];

/* ---------- Social icons (inline SVG, no icon library needed) ---------- */

const socialLinks = [
  {
    label: "Instagram",
    href: "https://instagram.com",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect x="2" y="9" width="4" height="12" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    ),
  },
  {
    label: "GitHub",
    href: "https://github.com",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65S8.93 17.38 9 18v4" />
        <path d="M9 18c-4.51 2-5-2-7-2" />
      </svg>
    ),
  },
  {
    label: "Facebook",
    href: "https://facebook.com",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
];

/* ---------- Reusable link column ----------
   `delay` only staggers the fade-in a little (in milliseconds). */

function FooterColumn({ title, links, delay }) {
  return (
    <nav
      className="footer-col reveal"
      style={{ "--d": `${delay}ms` }}
      aria-label={title}
    >
      <h3 className="footer-heading">{title}</h3>
      <ul className="footer-list">
        {links.map((item) => (
          <li key={item.label}>
            <Link to={item.to} className="footer-link">
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/* Simple email check: something@something.xx */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/* ---------- Main component ---------- */

function Footer() {
  const footerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({ type: "", text: "" }); // type: "error" | "success"

  /* Fade-in when the footer scrolls into view */
  useEffect(() => {
    const node = footerRef.current;
    if (!node) return;

    // Very old browsers: just show everything
    if (!("IntersectionObserver" in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // animate only once
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  /* Newsletter submit with basic validation */
  const handleSubscribe = (e) => {
    e.preventDefault(); // stop page reload
    const value = email.trim();

    if (!value) {
      setStatus({ type: "error", text: "Please enter your email." });
      return;
    }
    if (!EMAIL_PATTERN.test(value)) {
      setStatus({ type: "error", text: "Please enter a valid email." });
      return;
    }

    // Frontend only for now. Later you can POST `value` to your Express API.
    setStatus({ type: "success", text: "Thanks! You're subscribed to WorkBridge." });
    setEmail("");
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (status.text) setStatus({ type: "", text: "" }); // clear old message while typing
  };

  return (
    <footer
      ref={footerRef}
      className={`footer ${isVisible ? "is-visible" : ""}`}
    >
      <div className="footer-container">
        <div className="footer-grid">
          {/* 1. Brand section */}
          <div className="footer-brand reveal" style={{ "--d": "0ms" }}>
            <Link to="/" className="footer-logo" aria-label="WorkBridge home">
              <span className="footer-logo-mark" aria-hidden="true">W</span>
              <span className="footer-logo-text">WorkBridge</span>
            </Link>

            <p className="footer-tagline">
              Connecting Customers with Trusted Service Professionals.
            </p>
            <p className="footer-desc">
              Find reliable workers, post jobs, manage services, and get your
              work done with ease.
            </p>

            <ul className="footer-social" aria-label="Social media">
              {socialLinks.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    className="footer-social-link"
                    aria-label={s.label}
                    data-tooltip={s.label}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {s.icon}
                  </a>
                </li>
              ))}
            </ul>

            {/* Newsletter */}
            <form
              className="footer-newsletter reveal"
              style={{ "--d": "300ms" }}
              onSubmit={handleSubscribe}
              noValidate
            >
              <label htmlFor="footer-email" className="footer-newsletter-title">
                Stay updated with WorkBridge
              </label>
              <div className="footer-newsletter-row">
                <input
                  id="footer-email"
                  type="email"
                  placeholder="Enter your email"
                  autoComplete="email"
                  value={email}
                  onChange={handleEmailChange}
                  aria-invalid={status.type === "error"}
                  aria-describedby="footer-newsletter-msg"
                />
                <button type="submit">Subscribe</button>
              </div>
              <p
                id="footer-newsletter-msg"
                className={`footer-newsletter-msg ${status.type}`}
                role="status"
                aria-live="polite"
              >
                {status.text}
              </p>
            </form>
          </div>

          {/* 2-5. Link columns */}
          <FooterColumn title="Quick Links" links={quickLinks} delay={100} />
          <FooterColumn title="For Customers" links={customerLinks} delay={160} />
          <FooterColumn title="For Workers" links={workerLinks} delay={220} />
          <FooterColumn title="Support" links={supportLinks} delay={280} />
        </div>

        {/* Bottom bar */}
        <div className="footer-bottom">
          <p>© 2026 WorkBridge. All Rights Reserved.</p>
          <p>Built with ❤️ by the WorkBridge Team</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;