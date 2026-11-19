import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../config/api.js";
import {
  clearAuth,
  formatRupees,
  getProgress,
  getToken,
  getTotalPayable,
  isFinished,
  isNotProceeded,
  statusClass,
  statusLabel,
} from "../utils/jobWorkflow.js";
import "./MyJobs.css";

function StarPicker({ value, onChange, disabled }) {
  return (
    <div className="star-picker" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          type="button"
          key={star}
          className={star <= value ? "star on" : "star"}
          onClick={() => onChange(star)}
          disabled={disabled}
          role="radio"
          aria-checked={star === value}
          aria-label={`${star} star${star > 1 ? "s" : ""}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

function MyJobs() {
  const [retryCount, setRetryCount] = useState(0);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(() => Boolean(getToken()));
  const [loginRequired, setLoginRequired] = useState(() => !getToken());
  const [error, setError] = useState(() =>
    getToken() ? "" : "Sign in to see the jobs you have posted."
  );

  // Per-job UI state
  const [busyId, setBusyId] = useState(null);
  const [actionError, setActionError] = useState({});
  const [ratings, setRatings] = useState({});
  const [feedbacks, setFeedbacks] = useState({});

  useEffect(() => {
    const token = getToken();
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
          clearAuth();
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

  // PATCH /jobs/:id/<action> and replace that job in the list.
  // The API returns the job without populated names, so keep the old ones.
  const runAction = async (job, action, body = {}) => {
    setBusyId(job._id);
    setActionError((prev) => ({ ...prev, [job._id]: "" }));

    try {
      const response = await axios.patch(
        `${API_BASE_URL}/jobs/${job._id}/${action}`,
        body,
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );

      const updated = response.data.job;

      setJobs((current) =>
        current.map((item) =>
          item._id === job._id
            ? { ...item, ...updated, technician: item.technician, customer: item.customer }
            : item
        )
      );
    } catch (requestError) {
      setActionError((prev) => ({
        ...prev,
        [job._id]:
          requestError.response?.data?.message ||
          "Something went wrong. Please try again.",
      }));
    } finally {
      setBusyId(null);
    }
  };

  const handleApprove = (job) => {
    if (
      window.confirm(
        `Approve the repair estimate of ${formatRupees(job.estimatedCharges)}? The technician will start the repair.`
      )
    ) {
      runAction(job, "approve-estimate");
    }
  };

  const handleDecline = (job) => {
    if (
      window.confirm(
        `Don't repair? You will only pay the visiting charge of ${formatRupees(job.visitingCharge)}.`
      )
    ) {
      runAction(job, "reject-estimate");
    }
  };

  const handleRatingSubmit = (event, job) => {
    event.preventDefault();

    const rating = ratings[job._id];

    if (!rating) {
      setActionError((prev) => ({
        ...prev,
        [job._id]: "Please select 1 to 5 stars.",
      }));
      return;
    }

    runAction(job, "feedback", {
      rating,
      feedback: (feedbacks[job._id] || "").trim(),
    });
  };

  return (
    <main className="my-jobs-page">
      <header className="my-jobs-header">
        <div>
          <p className="my-jobs-eyebrow">CUSTOMER DASHBOARD</p>
          <h1>My Jobs</h1>
          <p>Track your requests, approve estimates and rate the work.</p>
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
          {jobs.map((job) => {
            const progress = job.technician ? getProgress(job) : null;
            const busy = busyId === job._id;
            const hasCharges =
              job.visitingCharge != null || job.estimatedCharges != null;

            return (
              <article className="my-job-card" key={job._id}>
                <div className="my-job-heading">
                  <div>
                    <p className="my-job-service">{job.service}</p>
                    <h2>{job.title}</h2>
                  </div>
                  <span
                    className={`my-job-status ${statusClass(job.status)}`}
                    aria-label={`Job status: ${statusLabel(job.status)}`}
                  >
                    {statusLabel(job.status)}
                  </span>
                </div>

                <p className="my-job-description">{job.description}</p>

                {progress && (
                  <ol className="job-progress" aria-label="Job progress">
                    {progress.steps.map((step) => (
                      <li key={step.label} className={step.state}>
                        <span className="dot" />
                        <span className="label">{step.label}</span>
                      </li>
                    ))}
                  </ol>
                )}

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

                {/* Visit / inspection report */}
                {job.visitDetails && (
                  <div className="job-panel">
                    <h3>Technician's inspection</h3>
                    <p>{job.visitDetails}</p>
                  </div>
                )}

                {/* Charges: visiting fee and repair estimate are separate */}
                {hasCharges && (
                  <div className="job-panel">
                    <h3>Charges</h3>
                    <div className="charges-table">
                      <div>
                        <span>Visiting charge (inspection)</span>
                        <strong>{formatRupees(job.visitingCharge)}</strong>
                      </div>

                      {job.estimatedCharges != null && (
                        <div>
                          <span>
                            Repair estimate
                            {isNotProceeded(job.status) ? " (not charged)" : ""}
                          </span>
                          <strong
                            className={isNotProceeded(job.status) ? "charge-struck" : ""}
                          >
                            {formatRupees(job.estimatedCharges)}
                          </strong>
                        </div>
                      )}

                      {isFinished(job.status) && (
                        <div className="charges-total">
                          <span>Total payable</span>
                          <strong>{formatRupees(getTotalPayable(job))}</strong>
                        </div>
                      )}
                    </div>

                    {job.estimateNotes && (
                      <p className="charges-note">{job.estimateNotes}</p>
                    )}
                  </div>
                )}

                {/* Step 3: customer decides on the repair */}
                {job.status === "Estimate Given" && (
                  <div className="job-panel decision-panel">
                    <h3>Do you want the repair done?</h3>
                    <p>
                      The repair estimate is{" "}
                      <strong>{formatRupees(job.estimatedCharges)}</strong>.
                      This is in addition to the visiting charge of{" "}
                      <strong>{formatRupees(job.visitingCharge)}</strong>.
                    </p>

                    <div className="decision-actions">
                      <button
                        type="button"
                        className="btn-approve"
                        onClick={() => handleApprove(job)}
                        disabled={busy}
                      >
                        {busy ? "Please wait..." : "Approve Repair"}
                      </button>
                      <button
                        type="button"
                        className="btn-decline"
                        onClick={() => handleDecline(job)}
                        disabled={busy}
                      >
                        Don't Repair
                      </button>
                    </div>
                  </div>
                )}

                {job.status === "In Progress" && (
                  <div className="job-panel info-panel">
                    <h3>Repair in progress</h3>
                    <p>
                      You approved the estimate. The technician will upload a
                      photo when the work is done.
                    </p>
                  </div>
                )}

                {job.status === "Completed" && job.completionPhoto && (
                  <div className="job-panel">
                    <h3>Completed work</h3>
                    <a href={job.completionPhoto} target="_blank" rel="noreferrer">
                      <img
                        className="completion-img"
                        src={job.completionPhoto}
                        alt="Completed work"
                        loading="lazy"
                      />
                    </a>
                  </div>
                )}

                {isNotProceeded(job.status) && (
                  <div className="job-panel info-panel">
                    <h3>Repair not proceeded</h3>
                    <p>
                      No repair was done, so only the visiting charge of{" "}
                      <strong>{formatRupees(job.visitingCharge)}</strong>{" "}
                      applies.
                    </p>
                    {job.inspectionDescription && (
                      <p className="charges-note">{job.inspectionDescription}</p>
                    )}
                  </div>
                )}

                {/* Step 4: rating (repair completed OR repair not proceeded) */}
                {isFinished(job.status) && !job.rating && (
                  <form
                    className="job-panel rating-panel"
                    onSubmit={(event) => handleRatingSubmit(event, job)}
                  >
                    <h3>Rate the technician</h3>

                    <StarPicker
                      value={ratings[job._id] || 0}
                      onChange={(value) =>
                        setRatings((prev) => ({ ...prev, [job._id]: value }))
                      }
                      disabled={busy}
                    />

                    <textarea
                      value={feedbacks[job._id] || ""}
                      onChange={(event) =>
                        setFeedbacks((prev) => ({
                          ...prev,
                          [job._id]: event.target.value,
                        }))
                      }
                      placeholder="Write your feedback (optional)"
                      maxLength={500}
                      rows={3}
                      disabled={busy}
                    />

                    <button type="submit" className="btn-approve" disabled={busy}>
                      {busy ? "Submitting..." : "Submit Rating"}
                    </button>
                  </form>
                )}

                {isFinished(job.status) && job.rating && (
                  <div className="job-panel">
                    <h3>Your rating</h3>
                    <div className="rating-stars" aria-label={`${job.rating} out of 5`}>
                      {"★".repeat(job.rating)}
                      <span>{"★".repeat(5 - job.rating)}</span>
                    </div>
                    {job.feedback && <p className="charges-note">{job.feedback}</p>}
                  </div>
                )}

                {actionError[job._id] && (
                  <p className="job-action-error" role="alert">
                    {actionError[job._id]}
                  </p>
                )}
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}

export default MyJobs;
