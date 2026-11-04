import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../config/api.js";
import "./MyJobs.css";

function MyJobs() {
  const [retryCount, setRetryCount] = useState(0);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(
    () => Boolean(localStorage.getItem("workbridgeToken"))
  );
  const [loginRequired, setLoginRequired] = useState(
    () => !localStorage.getItem("workbridgeToken")
  );
  const [error, setError] = useState(() =>
    localStorage.getItem("workbridgeToken")
      ? ""
      : "Sign in to see the jobs you have posted."
  );

  useEffect(() => {
    const token = localStorage.getItem("workbridgeToken");
    if (!token) return undefined;

    let active = true;

    axios
      .get(`${API_BASE_URL}/jobs/my`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        if (!active) return;
        setJobs(response.data.jobs);
        setLoginRequired(false);
      })
      .catch((requestError) => {
        if (!active) return;
        if (requestError.response?.status === 401) {
          localStorage.removeItem("workbridgeToken");
          localStorage.removeItem("workbridgeUser");
          setLoginRequired(true);
        }
        setError(
          requestError.response?.data?.message ||
            "Unable to load your jobs. Please try again."
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [retryCount]);

  const handleRetry = () => {
    setError("");
    setLoading(true);
    setRetryCount((count) => count + 1);
  };

  return (
    <main className="my-jobs-page">
      <header className="my-jobs-header">
        <div>
          <p className="my-jobs-eyebrow">CUSTOMER DASHBOARD</p>
          <h1>My Jobs</h1>
          <p>Track your requests and see when a technician accepts one.</p>
        </div>
        <Link className="my-jobs-post-link" to="/post-job">
          Post a job
        </Link>
      </header>

      {loading && <p className="my-jobs-message">Loading your jobs...</p>}

      {!loading && error && (
        <section className="my-jobs-message my-jobs-error" role="alert">
          <p>{error}</p>
          {loginRequired ? (
            <Link to="/login">Sign in</Link>
          ) : (
            <button type="button" onClick={handleRetry}>
              Try again
            </button>
          )}
        </section>
      )}

      {!loading && !error && jobs.length === 0 && (
        <section className="my-jobs-empty">
          <h2>No jobs posted yet</h2>
          <p>Your posted jobs and their status will appear here.</p>
          <Link to="/post-job">Post your first job</Link>
        </section>
      )}

      {!loading && !error && jobs.length > 0 && (
        <section className="my-jobs-list" aria-label="Your posted jobs">
          {jobs.map((job) => (
            <article className="my-job-card" key={job._id}>
              <div className="my-job-heading">
                <div>
                  <p className="my-job-service">{job.service}</p>
                  <h2>{job.title}</h2>
                </div>
                <span
                  className={`my-job-status ${job.status.toLowerCase()}`}
                  aria-label={`Job status: ${job.status}`}
                >
                  {job.status}
                </span>
              </div>

              <p className="my-job-description">{job.description}</p>

              <dl className="my-job-details">
                <div>
                  <dt>Location</dt>
                  <dd>{job.location}</dd>
                </div>
                <div>
                  <dt>Preferred date</dt>
                  <dd>{job.date || "Flexible"}</dd>
                </div>
                <div>
                  <dt>Urgency</dt>
                  <dd>{job.urgency}</dd>
                </div>
                <div>
                  <dt>Budget</dt>
                  <dd>
                    {job.budget == null
                      ? "Not specified"
                      : `₹${Number(job.budget).toLocaleString("en-IN")}`}
                  </dd>
                </div>
                <div>
                  <dt>Technician</dt>
                  <dd>{job.technician?.name || "Not assigned yet"}</dd>
                </div>
              </dl>

              {Array.isArray(job.photos) && job.photos.length > 0 && (
                <div className="my-job-photos" aria-label="Job photos">
                  {job.photos.map((photo) => (
                    <a href={photo} key={photo} target="_blank" rel="noreferrer">
                      <img src={photo} alt={`Photo for ${job.title}`} loading="lazy" />
                    </a>
                  ))}
                </div>
              )}
            </article>
          ))}
        </section>
      )}
    </main>
  );
}

export default MyJobs;
