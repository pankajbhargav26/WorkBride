import { useEffect, useState } from "react";
import { getAllJobs } from "../api/jobs.js";
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

function AdminJobs() {
  const [page, setPage] = useState(1);
  const [result, setResult] = useState(null);

  useEffect(() => {
    let active = true;

    getAllJobs(page)
      .then((data) => {
        if (active) setResult({ page, data, error: "" });
      })
      .catch((error) => {
        if (active) setResult({ page, data: null, error: error.message });
      });

    return () => {
      active = false;
    };
  }, [page]);

  const loading = !result || result.page !== page;
  const error = loading ? "" : result.error;
  const data = !loading && !error ? result.data : null;

  return (
    <main className="my-jobs-page">
      <header className="my-jobs-header">
        <span className="my-jobs-eyebrow">WORKBRIDGE ADMIN</span>
        <h1>All Posted Jobs</h1>
        <p>Customer job submissions and contact details. Admin access only.</p>
      </header>

      {loading && <p className="my-jobs-message" role="status">Loading submitted jobs...</p>}

      {!loading && error && (
        <section className="my-jobs-message my-jobs-error" role="alert">
          <h2>Admin access required</h2>
          <p>{error}</p>
          <p>Sign in with an account whose database role is <code>admin</code>. The login must save its JWT in localStorage as <code>token</code> or <code>accessToken</code>.</p>
        </section>
      )}

      {!loading && !error && data.total === 0 && (
        <section className="my-jobs-message my-jobs-empty">
          <h2>No jobs have been posted</h2>
          <p>Customer job submissions will appear here after they are successfully saved.</p>
        </section>
      )}

      {!loading && !error && data.total > 0 && (
        <>
          <p className="admin-jobs-total">Total submissions: <strong>{data.total}</strong></p>
          <section className="my-jobs-list" aria-label="All customer job submissions">
            {data.jobs.map((job) => (
              <article className="my-job-card" key={job._id}>
                <div className="my-job-card-top">
                  <span className="my-job-category">{job.serviceCategory}</span>
                  <span className="my-job-status">{job.status}</span>
                </div>
                <h2>{job.title || job.serviceCategory}</h2>
                <p className="my-job-card-description">{job.problemDescription}</p>
                <dl className="admin-job-facts">
                  <div><dt>Customer</dt><dd>{job.customerName || "Name not provided"}</dd></div>
                  <div><dt>Phone</dt><dd>{job.phone ? `+91 ${job.phone}` : "Phone not provided"}</dd></div>
                  <div><dt>Address</dt><dd>{job.address}</dd></div>
                  <div><dt>Preferred date</dt><dd>{formatDate(job.preferredDate)}</dd></div>
                  <div><dt>Preferred time</dt><dd>{job.preferredTime}</dd></div>
                  <div><dt>Urgency</dt><dd>{job.urgency || "Flexible"}</dd></div>
                  {job.budget !== undefined && <div><dt>Customer budget</dt><dd>₹{job.budget}</dd></div>}
                  <div><dt>Service charge</dt><dd>₹{job.charges}</dd></div>
                  <div><dt>Job ID</dt><dd>{job._id}</dd></div>
                  <div><dt>Customer account ID</dt><dd>{job.customerId}</dd></div>
                  <div><dt>Posted</dt><dd>{formatDate(job.createdAt)}</dd></div>
                </dl>
              </article>
            ))}
          </section>

          <nav className="admin-jobs-pagination" aria-label="Job pages">
            <button type="button" onClick={() => setPage((current) => current - 1)} disabled={page <= 1}>
              ← Previous
            </button>
            <span>Page {data.page} of {Math.max(data.totalPages, 1)}</span>
            <button
              type="button"
              onClick={() => setPage((current) => current + 1)}
              disabled={page >= data.totalPages}
            >
              Next →
            </button>
          </nav>
        </>
      )}
    </main>
  );
}

export default AdminJobs;
