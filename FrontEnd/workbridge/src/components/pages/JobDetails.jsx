
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { API_BASE_URL } from "../../config/api";
import {
  formatRupees,
  getToken,
  getTotalPayable,
  isNotProceeded,
  statusLabel
} from "../../utils/jobWorkflow";
import "./JobDetails.css";

function JobDetails() {
  const { jobId } = useParams();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [visitDetails, setVisitDetails] = useState("");
  const [visitingCharge, setVisitingCharge] = useState("");
  const [estimatedCharges, setEstimatedCharges] = useState("");
  const [estimateNotes, setEstimateNotes] = useState("");

  const [completionFile, setCompletionFile] = useState(null);
  const [inspectionDescription, setInspectionDescription] = useState("");

  const token = getToken();

  const getHeaders = () => ({
    Authorization: `Bearer ${token}`
  });

  const updateJobState = (updatedJob) => {
    setJob(updatedJob);
    setVisitDetails(updatedJob.visitDetails || "");
    setVisitingCharge(
      updatedJob.visitingCharge !== undefined &&
      updatedJob.visitingCharge !== null
        ? String(updatedJob.visitingCharge)
        : ""
    );
    setEstimatedCharges(
      updatedJob.estimatedCharges !== undefined &&
      updatedJob.estimatedCharges !== null
        ? String(updatedJob.estimatedCharges)
        : ""
    );
    setEstimateNotes(updatedJob.estimateNotes || "");
    setInspectionDescription(updatedJob.inspectionDescription || "");
    setCompletionFile(null);
  };

  const loadJob = async () => {
    try {
      setLoading(true);
      setError("");

      if (!token) {
        setError("Please login first to view job details.");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
        method: "GET",
        headers: getHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load job details");
      }

      updateJobState(data.job);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJob();
  }, [jobId]);

  // JSON-based job updates
  const updateJob = async (endpoint, body = {}) => {
    try {
      setSaving(true);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/jobs/${jobId}/${endpoint}`,
        {
          method: "PATCH",
          headers: {
            ...getHeaders(),
            "Content-Type": "application/json"
          },
          body: JSON.stringify(body)
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to update job");
      }

      updateJobState(data.job);
      alert(data.message || "Job updated successfully");
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  // Accept job
  const handleAcceptJob = () => {
    if (window.confirm("Are you sure you want to accept this job?")) {
      updateJob("accept");
    }
  };

  // Submit visit details
  const handleVisitSubmit = (event) => {
    event.preventDefault();

    if (!visitDetails.trim()) {
      setError("Please enter visit details.");
      return;
    }

    const charge = Number(visitingCharge);

    if (visitingCharge === "" || !Number.isFinite(charge) || charge < 0) {
      setError("Please enter a valid visiting charge.");
      return;
    }

    updateJob("visit", {
      visitDetails: visitDetails.trim(),
      visitingCharge: charge
    });
  };

  // Submit estimate
  const handleEstimateSubmit = (event) => {
    event.preventDefault();

    const charges = Number(estimatedCharges);

    if (
      estimatedCharges === "" ||
      !Number.isFinite(charges) ||
      charges < 0
    ) {
      setError("Please enter valid estimated charges.");
      return;
    }

    updateJob("estimate", {
      estimatedCharges: charges,
      estimateNotes: estimateNotes.trim()
    });
  };

  // Upload completion photo
  const handleCompleteJob = async (event) => {
    event.preventDefault();

    if (!completionFile) {
      setError("Please select a completion photo.");
      return;
    }

    if (!completionFile.type.startsWith("image/")) {
      setError("Please select a valid image.");
      return;
    }

    if (completionFile.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5 MB.");
      return;
    }

    if (
      !window.confirm(
        "Are you sure the work is completed? This will upload the completion photo."
      )
    ) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      const formData = new FormData();
      formData.append("completionPhoto", completionFile);

      const response = await fetch(
        `${API_BASE_URL}/jobs/${jobId}/complete`,
        {
          method: "PATCH",
          headers: getHeaders(),
          body: formData
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to complete job");
      }

      updateJobState(data.job);
      alert(data.message || "Work completed successfully!");
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  // Customer did not proceed with the repair (visiting charge still applies)
  const handleDidNotProceed = (event) => {
    event.preventDefault();

    if (!inspectionDescription.trim()) {
      setError("Please enter the reason / inspection details.");
      return;
    }

    if (inspectionDescription.trim().length > 1000) {
      setError("Reason cannot exceed 1000 characters.");
      return;
    }

    if (
      window.confirm(
        "Mark this job as Repair Not Proceeded? No repair will be done, but the visiting charge will still apply."
      )
    ) {
      updateJob("did-not-proceed", {
        inspectionDescription: inspectionDescription.trim()
      });
    }
  };

  if (loading) {
    return (
      <div className="job-message">
        <p>Loading job details...</p>
      </div>
    );
  }

  if (error && !job) {
    return (
      <div className="job-not-found">
        <h2>Unable to Load Job</h2>
        <p>{error}</p>
        <Link to="/worker-dashboard">Back to Dashboard</Link>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="job-not-found">
        <h2>Job Not Found</h2>
        <Link to="/worker-dashboard">Back to Dashboard</Link>
      </div>
    );
  }

  const renderDidNotProceed = () => (
    <section className="details-box workflow-box not-proceed-box">
      <h2>Customer Did Not Proceed</h2>

      <p>
        If the customer does not want the repair, record the reason here. No
        repair will be done, but the visiting charge of{" "}
        <strong>{formatRupees(job.visitingCharge)}</strong> still applies.
      </p>

      <form onSubmit={handleDidNotProceed}>
        <label>Reason / Inspection Details *</label>

        <textarea
          value={inspectionDescription}
          onChange={(event) => setInspectionDescription(event.target.value)}
          placeholder="Problem found, estimate given, and why the customer did not proceed..."
          maxLength={1000}
          required
        />

        <button
          className="secondary-job-button"
          type="submit"
          disabled={saving || !inspectionDescription.trim()}
        >
          {saving ? "Saving..." : "Customer Did Not Proceed"}
        </button>
      </form>
    </section>
  );

  const customerName = job.customer?.name || "Customer";

  const preferredDate = job.date
    ? new Date(`${job.date}T00:00:00`).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric"
      })
    : "Not specified";

  return (
    <div className="job-details-page">
      <Link to="/worker-dashboard" className="back-dashboard">
        ← Back to Dashboard
      </Link>

      <div className="job-details-header">
        <div>
          <span className="details-service">{job.service}</span>

          <h1>{job.title}</h1>

          <p>Review job information and update its progress.</p>
        </div>

        <span className="details-status">{statusLabel(job.status)}</span>
      </div>

      {error && <div className="job-error">{error}</div>}

      <div className="job-details-layout">
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
                <strong>{preferredDate}</strong>
              </div>

              <div>
                <small>Urgency</small>
                <strong>{job.urgency}</strong>
              </div>

              <div>
                <small>Current Status</small>
                <strong>{statusLabel(job.status)}</strong>
              </div>
            </div>
          </section>

          <section className="details-box">
            <h2>Job Photos</h2>

            {job.photos?.length > 0 ? (
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
              <p className="no-photos">
                No photos uploaded by customer.
              </p>
            )}
          </section>

          {job.visitDetails && (
            <section className="details-box">
              <h2>Visit Details</h2>
              <p>{job.visitDetails}</p>
            </section>
          )}

          {(job.visitingCharge != null || job.estimatedCharges != null) && (
            <section className="details-box">
              <h2>Charges</h2>

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
                      className={
                        isNotProceeded(job.status) ? "charge-struck" : ""
                      }
                    >
                      {formatRupees(job.estimatedCharges)}
                    </strong>
                  </div>
                )}

                {(job.status === "Completed" ||
                  isNotProceeded(job.status)) && (
                  <div className="charges-total">
                    <span>Total payable</span>
                    <strong>{formatRupees(getTotalPayable(job))}</strong>
                  </div>
                )}
              </div>

              {job.estimateNotes && (
                <p>
                  <strong>Estimate notes:</strong> {job.estimateNotes}
                </p>
              )}

              {job.estimatedCharges != null && (
                <p>
                  Estimate Status: <strong>{job.estimateStatus}</strong>
                </p>
              )}

              <p className="charges-hint">
                The visiting charge is for inspection only. The repair charge
                is separate.
              </p>
            </section>
          )}

          {job.status === "Accepted" && (
            <section className="details-box workflow-box">
              <h2>Submit Visit Details</h2>

              <p>
                Visit the customer, inspect the problem and tell them your
                visiting charge. The repair estimate comes in the next step.
              </p>

              <form onSubmit={handleVisitSubmit}>
                <label>Visiting Charge (₹) *</label>

                <input
                  type="number"
                  min="0"
                  step="1"
                  value={visitingCharge}
                  onChange={(event) => setVisitingCharge(event.target.value)}
                  placeholder="e.g. 100"
                  required
                />

                <label>Inspection Details *</label>

                <textarea
                  value={visitDetails}
                  onChange={(event) => setVisitDetails(event.target.value)}
                  placeholder="Enter inspection and visit details..."
                  maxLength={1000}
                  required
                />

                <button
                  className="accept-job-button"
                  type="submit"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Submit Visit Details"}
                </button>
              </form>
            </section>
          )}

          {job.status === "Visited" && (
            <section className="details-box workflow-box">
              <h2>Submit Repair Estimate</h2>

              <p>
                Enter the repair charge. This is separate from the visiting charge.
              </p>

              <form onSubmit={handleEstimateSubmit}>
                <label>Repair Estimate (₹)</label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={estimatedCharges}
                  onChange={(event) =>
                    setEstimatedCharges(event.target.value)
                  }
                  placeholder="Enter estimated charges"
                  required
                />

                <label>Estimate Notes</label>

                <textarea
                  value={estimateNotes}
                  onChange={(event) => setEstimateNotes(event.target.value)}
                  placeholder="Explain the work and estimated cost..."
                  maxLength={500}
                />

                <button
                  className="accept-job-button"
                  type="submit"
                  disabled={saving}
                >
                  {saving ? "Submitting..." : "Submit Estimate"}
                </button>
              </form>
            </section>
          )}

          {job.status === "Estimate Given" && (
            <>
              <section className="details-box workflow-message">
                <h2>Waiting for Customer Decision</h2>

                <p>
                  Your estimate has been sent. If the customer approves it
                  in the app, the job moves to In Progress and you can start
                  the repair.
                </p>
              </section>

              {renderDidNotProceed()}
            </>
          )}

          {job.status === "In Progress" && (
            <>
              <section className="details-box workflow-box">
                <h2>Work Completed</h2>

                <p>
                  If you have completed the repair work, upload a photo as
                  proof. A photo is compulsory.
                </p>

                <form onSubmit={handleCompleteJob}>
                  <label>Upload Completion Photo *</label>

                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    capture="environment"
                    onChange={(event) => {
                      setCompletionFile(event.target.files?.[0] || null);
                      setError("");
                    }}
                    required
                  />

                  {completionFile && (
                    <p>
                      Selected file: <strong>{completionFile.name}</strong>
                    </p>
                  )}

                  <button
                    className="accept-job-button"
                    type="submit"
                    disabled={saving || !completionFile}
                  >
                    {saving ? "Uploading..." : "Upload Photo & Complete Job"}
                  </button>
                </form>
              </section>
            </>
          )}


          {job.status === "Completed" && (
            <section className="details-box workflow-message">
              <h2>Job Completed Successfully</h2>

              <p>
                The repair is done. Total payable:{" "}
                <strong>{formatRupees(getTotalPayable(job))}</strong>{" "}
                (visiting + repair).
              </p>

              {job.completionPhoto && (
                <>
                  <h3>Completion Photo</h3>

                  <img
                    className="completion-photo"
                    src={job.completionPhoto}
                    alt="Completed work"
                  />
                </>
              )}
            </section>
          )}

          {isNotProceeded(job.status) && (
            <section className="details-box workflow-message">
              <h2>Repair Not Proceeded</h2>

              <p>
                The customer did not go ahead with the repair. No repair
                charge applies, but the visiting charge of{" "}
                <strong>{formatRupees(job.visitingCharge)}</strong> is
                payable.
              </p>

              <h3>Reason / Inspection Details</h3>

              <p>
                {job.inspectionDescription || "No details recorded."}
              </p>
            </section>
          )}

          {job.rating && (
            <section className="details-box">
              <h2>Customer Rating</h2>

              <div className="rating-stars" aria-label={`${job.rating} out of 5`}>
                {"★".repeat(job.rating)}
                <span>{"★".repeat(5 - job.rating)}</span>
              </div>

              <p>{job.feedback || "No written feedback."}</p>
            </section>
          )}
        </div>

        <aside className="job-customer-sidebar">
          <section className="details-box customer-box">
            <h2>Customer Details</h2>

            <div className="customer-avatar">
              {customerName.charAt(0).toUpperCase()}
            </div>

            <h3>{customerName}</h3>

            <div className="customer-detail-item">
              <span>📞</span>
              <div>
                <small>Phone Number</small>
                <strong>{job.phone || "Not available"}</strong>
              </div>
            </div>

            <div className="customer-detail-item">
              <span>📍</span>
              <div>
                <small>Work Location</small>
                <strong>{job.location || "Not available"}</strong>
              </div>
            </div>

            <div className="customer-detail-item">
              <span>📅</span>
              <div>
                <small>Preferred Date</small>
                <strong>{preferredDate}</strong>
              </div>
            </div>
          </section>

          {job.status === "Available" && (
            <section className="details-box accept-box">
              <small>Job Opportunity</small>

              <h2>Accept This Job</h2>

              <p>
                Accept this job to start working with the customer.
              </p>

              <button
                className="accept-job-button"
                onClick={handleAcceptJob}
                disabled={saving}
              >
                {saving ? "Please wait..." : "Accept This Job"}
              </button>
            </section>
          )}

          {job.status !== "Available" && (
            <section className="details-box accept-box">
              <small>Job Progress</small>

              <h2>{statusLabel(job.status)}</h2>

              <p>
                Follow the steps on this page to continue updating the job.
              </p>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}

export default JobDetails;
