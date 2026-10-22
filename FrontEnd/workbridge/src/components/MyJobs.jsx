import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getMyJob, getMyJobs } from "../api/jobs.js";
import "./MyJobs.css";

function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Date unavailable"
    : date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric"
      });
}

function JobDetails({ job }) {
  return (
    <article className="my-job-detail">
      <div className="my-job-detail-heading">
        <div>
          <span className="my-job-category">{job.serviceCategory}</span>
          <h2>{job.title || job.serviceCategory}</h2>
        </div>
        <span className="my-job-status">{job.status}</span>
      </div>

      <p className="my-job-description">{job.problemDescription}</p>

      <dl className="my-job-facts">
        <div><dt>Address</dt><dd>{job.address}</dd></div>
        <div><dt>Preferred date</dt><dd>{formatDate(job.preferredDate)}</dd></div>
        <div><dt>Preferred time</dt><dd>{job.preferredTime}</dd></div>
        <div><dt>Urgency</dt><dd>{job.urgency || "Flexible"}</dd></div>
        {job.budget !== undefined && <div><dt>Your budget</dt><dd>₹{job.budget}</dd></div>}
        <div><dt>Service charge</dt><dd>₹{job.charges}</dd></div>
        {job.customerName && <div><dt>Contact name</dt><dd>{job.customerName}</dd></div>}
        {job.phone && <div><dt>Contact phone</dt><dd>+91 {job.phone}</dd></div>}
        <div><dt>Posted</dt><dd>{formatDate(job.createdAt)}</dd></div>
      </dl>

      <Link className="my-jobs-back-link" to="/my-jobs">← Back to My Jobs</Link>
    </article>
  );
}

function MyJobs() {
  const { id } = useParams();
  const [result, setResult] = useState(null);

  useEffect(() => {
    let active = true;

    const request = id ? getMyJob(id) : getMyJobs();
    request
      .then((data) => {
        if (!active) return;
        setResult({ key: id || "list", data, error: "" });
      })
      .catch((requestError) => {
        if (active) setResult({ key: id || "list", data: null, error: requestError.message });
      })

    return () => {
      active = false;
    };
  }, [id]);

  const resultKey = id || "list";
  const loading = !result || result.key !== resultKey;
  const error = loading ? "" : result.error;
  const job = !loading && id && !error ? result.data.job : null;
  const jobs = !loading && !id && !error ? result.data.jobs : [];

  return (
    <main className="my-jobs-page">
      <header className="my-jobs-header">
        <span className="my-jobs-eyebrow">YOUR WORKBRIDGE ACCOUNT</span>
        <h1>{id ? "Job details" : "My Jobs"}</h1>
        <p>Jobs you post are saved to your account and only visible to you here.</p>
      </header>

      {loading && <p className="my-jobs-message" role="status">Loading your jobs...</p>}

      {!loading && error && (
        <section className="my-jobs-message my-jobs-error" role="alert">
          <h2>We couldn't load your jobs</h2>
          <p>{error}</p>
          {(error.includes("log in") || error.includes("token")) && (
            <p>Your login page must save the customer JWT in localStorage as <code>token</code> or <code>accessToken</code>.</p>
          )}
          <Link to="/post-job">Back to Post a Job</Link>
        </section>
      )}

      {!loading && !error && id && job && <JobDetails job={job} />}

      {!loading && !error && !id && jobs.length === 0 && (
        <section className="my-jobs-message my-jobs-empty">
          <h2>No jobs posted yet</h2>
          <p>When you submit a job request, it will appear here.</p>
          <Link to="/post-job">Post your first job</Link>
        </section>
      )}

      {!loading && !error && !id && jobs.length > 0 && (
        <section className="my-jobs-list" aria-label="Your posted jobs">
          {jobs.map((item) => (
            <article className="my-job-card" key={item._id}>
              <div className="my-job-card-top">
                <span className="my-job-category">{item.serviceCategory}</span>
                <span className="my-job-status">{item.status}</span>
              </div>
              <h2>{item.title || item.serviceCategory}</h2>
              <p className="my-job-card-description">{item.problemDescription}</p>
              <div className="my-job-card-meta">
                <span>📍 {item.address}</span>
                <span>📅 {formatDate(item.preferredDate)} · {item.preferredTime}</span>
              </div>
              <Link className="my-job-view-link" to={`/my-jobs/${item._id}`}>
                View full details <span aria-hidden="true">→</span>
              </Link>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}

export default MyJobs;
