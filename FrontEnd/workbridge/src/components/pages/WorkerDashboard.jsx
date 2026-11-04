
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./WorkerDashboard.css";

const API_URL = "http://localhost:5000/api/jobs";

function WorkerDashboard() {
  const [availableJobs, setAvailableJobs] = useState([]);
  const [myJobs, setMyJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [acceptingId, setAcceptingId] = useState(null);

  const token = localStorage.getItem("workBridgeToken");

  // Load jobs from backend
  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError("");

      if (!token) {
        setError("Please login first.");
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [availableResponse, myJobsResponse] = await Promise.all([
        fetch(`${API_URL}/available`, { headers }),
        fetch(`${API_URL}/my-jobs`, { headers }),
      ]);

      const availableData = await availableResponse.json();
      const myJobsData = await myJobsResponse.json();

      if (!availableResponse.ok) {
        throw new Error(availableData.message || "Unable to load available jobs");
      }

      if (!myJobsResponse.ok) {
        throw new Error(myJobsData.message || "Unable to load your jobs");
      }

      setAvailableJobs(availableData.jobs || []);
      setMyJobs(myJobsData.jobs || []);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // Accept a job
  const handleAcceptJob = async (jobId) => {
    try {
      setAcceptingId(jobId);

      const response = await fetch(`${API_URL}/${jobId}/accept`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to accept job");
      }

      alert("Job accepted successfully!");
      await fetchJobs();
    } catch (err) {
      alert(err.message);
    } finally {
      setAcceptingId(null);
    }
  };

  const acceptedJobs = myJobs.filter(
    (job) => job.status === "Accepted"
  );

  const completedJobs = myJobs.filter(
    (job) => job.status === "Completed"
  );

  const getIcon = (service) => {
    const icons = {
      Plumbing: "🔧",
      Electrical: "⚡",
      "AC Repair": "❄️",
      Cleaning: "🧹",
      Painting: "🎨",
      Carpentry: "🪚",
      Handyman: "🛠️",
      Shifting: "📦",
    };

    return icons[service] || "🔧";
  };

  const formatDate = (date) => {
    if (!date) return "Date not specified";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="worker-dashboard">

      <div className="worker-welcome">
        <div>
          <span className="worker-tag">TECHNICIAN PANEL</span>
          <h1>Welcome Back, Technician!</h1>
          <p>Find new jobs and manage your service requests.</p>
        </div>
      </div>

      {/* Job Overview */}
      <section className="worker-overview">
        <h2>Job Overview</h2>

        <div className="overview-grid">

          <div className="overview-card available-card">
            <div className="overview-icon">📋</div>
            <h3>{availableJobs.length}</h3>
            <p>Available Jobs</p>
          </div>

          <div className="overview-card accepted-card">
            <div className="overview-icon">🛠️</div>
            <h3>{acceptedJobs.length}</h3>
            <p>Accepted Jobs</p>
          </div>

          <div className="overview-card completed-card">
            <div className="overview-icon">✅</div>
            <h3>{completedJobs.length}</h3>
            <p>Completed Jobs</p>
          </div>

        </div>
      </section>

      {/* Available Jobs */}
      <section className="available-jobs-section">

        <div className="jobs-heading">
          <div>
            <h2>Available Jobs</h2>
            <p>Customer requests waiting for professionals.</p>
          </div>

          <span className="jobs-count">
            {availableJobs.length} New Jobs
          </span>
        </div>

        {loading && <p>Loading jobs...</p>}

        {error && (
          <div className="no-jobs">
            <p>{error}</p>
            <button onClick={fetchJobs}>Try Again</button>
          </div>
        )}

        {!loading && !error && (
          <div className="worker-jobs-list">

            {availableJobs.length > 0 ? (
              availableJobs.map((job) => (

                <div className="worker-job-card" key={job._id}>

                  <div className="job-card-top">
                    <div className="job-service">
                      <span className="job-service-icon">
                        {getIcon(job.service)}
                      </span>
                      <span>{job.service}</span>
                    </div>

                    <span className="job-status">
                      {job.status}
                    </span>
                  </div>

                  <h3>{job.title}</h3>

                  <p className="job-description">
                    {job.description}
                  </p>

                  <div className="job-information">
                    <span>
                      👤 {job.customer?.name || "Customer"}
                    </span>

                    <span>
                      📍 {job.location || "Location shared after acceptance"}
                    </span>

                    <span>
                      📅 {formatDate(job.date)}
                    </span>

                    <span>
                      ⚡ {job.urgency || "Flexible"}
                    </span>
                  </div>

                  <div className="job-card-bottom">

                    <div className="job-budget">
                      <small>Customer Budget</small>
                      <strong>
                        {job.budget != null
                          ? `₹${job.budget}`
                          : "Not specified"}
                      </strong>
                    </div>

                    <div>
                      <button
                        className="view-job-btn"
                        onClick={() => handleAcceptJob(job._id)}
                        disabled={acceptingId === job._id}
                      >
                        {acceptingId === job._id
                          ? "Accepting..."
                          : "Accept Job"}
                      </button>
                    </div>

                  </div>

                </div>

              ))
            ) : (
              <div className="no-jobs">
                <h3>No Jobs Available</h3>
                <p>New customer requests will appear here.</p>
              </div>
            )}

          </div>
        )}

      </section>

      {/* My Accepted and Completed Jobs */}
      <section className="available-jobs-section">
        <div className="jobs-heading">
          <div>
            <h2>My Jobs</h2>
            <p>Your accepted and completed jobs.</p>
          </div>
        </div>

        {!loading && myJobs.length === 0 && (
          <div className="no-jobs">
            <p>You have not accepted any jobs yet.</p>
          </div>
        )}

        <div className="worker-jobs-list">
          {myJobs.map((job) => (
            <div className="worker-job-card" key={job._id}>
              <div className="job-card-top">
                <div className="job-service">
                  <span className="job-service-icon">
                    {getIcon(job.service)}
                  </span>
                  <span>{job.service}</span>
                </div>

                <span className="job-status">{job.status}</span>
              </div>

              <h3>{job.title}</h3>
              <p className="job-description">{job.description}</p>

              <Link
                to={`/worker-dashboard/jobs/${job._id}`}
                className="view-job-btn"
              >
                View Job Details →
              </Link>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}

export default WorkerDashboard;
