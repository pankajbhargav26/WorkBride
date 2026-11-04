
import React from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import "./JobDetails.css";

// Temporary sample data
// Later we will replace this with MongoDB API data.

const jobs = [
  {
    id: 1,
    service: "Plumbing",
    icon: "🔧",
    title: "Fix leaking bathroom tap",
    description:
      "Bathroom tap is leaking continuously. Water is coming out even after closing the tap. Need a professional to repair it as soon as possible.",
    customer: "Rahul Sharma",
    phone: "9876543210",
    location: "Kalyanpur, Kanpur, Uttar Pradesh",
    date: "10 November 2026",
    urgency: "Urgent",
    budget: "₹500",
    photos: [],
    status: "Available",
  },
  {
    id: 2,
    service: "Electrical",
    icon: "⚡",
    title: "Fan not working properly",
    description:
      "Ceiling fan is making noise and not working at full speed. Please check the motor and wiring.",
    customer: "Amit Kumar",
    phone: "9876543211",
    location: "Swaroop Nagar, Kanpur",
    date: "12 November 2026",
    urgency: "Within a week",
    budget: "₹300",
    photos: [],
    status: "Available",
  },
  {
    id: 3,
    service: "AC & Appliances",
    icon: "❄️",
    title: "AC is not cooling",
    description:
      "AC is running but not providing proper cooling. Need inspection and repair.",
    customer: "Priya Singh",
    phone: "9876543212",
    location: "Kakadeo, Kanpur",
    date: "14 November 2026",
    urgency: "Flexible",
    budget: "Not specified",
    photos: [],
    status: "Available",
  },
];

function JobDetails() {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const job = jobs.find((item) => item.id === Number(jobId));

  const handleAcceptJob = () => {
    alert("Job accepted successfully! Backend connection will be added later.");
    navigate("/worker-dashboard");
  };

  if (!job) {
    return (
      <div className="job-not-found">
        <h2>Job Not Found</h2>
        <Link to="/worker-dashboard">Back to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="job-details-page">

      <Link to="/worker-dashboard" className="back-dashboard">
        ← Back to Dashboard
      </Link>

      <div className="job-details-header">
        <div>
          <span className="details-service">
            {job.icon} {job.service}
          </span>

          <h1>{job.title}</h1>

          <p>Review all job information before accepting.</p>
        </div>

        <span className="details-status">{job.status}</span>
      </div>

      <div className="job-details-layout">

        {/* LEFT SIDE */}

        <div className="job-details-main">

          <section className="details-box">
            <h2>Problem Description</h2>
            <p>{job.description}</p>
          </section>

          <section className="details-box">
            <h2>Job Information</h2>

            <div className="details-info-grid">

              <div>
                <small>Service Category</small>
                <strong>{job.service}</strong>
              </div>

              <div>
                <small>Preferred Date</small>
                <strong>{job.date || "Not specified"}</strong>
              </div>

              <div>
                <small>Urgency</small>
                <strong>{job.urgency}</strong>
              </div>

              <div>
                <small>Customer Budget</small>
                <strong>{job.budget}</strong>
              </div>

            </div>
          </section>

          <section className="details-box">
            <h2>Job Photos</h2>

            {job.photos.length > 0 ? (
              <div className="job-photos">
                {job.photos.map((photo, index) => (
                  <img
                    src={photo}
                    alt={`Job ${index + 1}`}
                    key={index}
                  />
                ))}
              </div>
            ) : (
              <p className="no-photos">No photos uploaded by customer.</p>
            )}
          </section>

        </div>

        {/* RIGHT SIDE */}

        <aside className="job-customer-sidebar">

          <section className="details-box customer-box">
            <h2>Customer Details</h2>

            <div className="customer-avatar">
              {job.customer.charAt(0)}
            </div>

            <h3>{job.customer}</h3>

            <div className="customer-detail-item">
              <span>📞</span>
              <div>
                <small>Phone Number</small>
                <strong>{job.phone}</strong>
              </div>
            </div>

            <div className="customer-detail-item">
              <span>📍</span>
              <div>
                <small>Work Location</small>
                <strong>{job.location}</strong>
              </div>
            </div>

            <div className="customer-detail-item">
              <span>📅</span>
              <div>
                <small>Preferred Date</small>
                <strong>{job.date || "Not specified"}</strong>
              </div>
            </div>
          </section>

          <section className="details-box accept-box">
            <small>Customer Budget</small>
            <h2>{job.budget}</h2>

            <p>
              Final charges can be discussed with the customer
              according to the actual work.
            </p>

            <button
              className="accept-job-button"
              onClick={handleAcceptJob}
              disabled={job.status !== "Available"}
            >
              Accept This Job
            </button>
          </section>

        </aside>

      </div>
    </div>
  );
}

export default JobDetails;
