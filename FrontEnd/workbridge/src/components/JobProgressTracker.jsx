import "./JobProgressTracker.css";

const STAGES = ["Accepted", "On the Way", "Work Started", "Completed"];

function JobProgressTracker({ status, onAdvance, updating = false }) {
  if (status === "Available") {
    return (
      <p className="job-progress-waiting">
        Waiting for a technician to accept this job.
      </p>
    );
  }

  const currentIndex = STAGES.indexOf(status);

  if (currentIndex === -1) return null;

  const nextStage = STAGES[currentIndex + 1];

  return (
    <section className="job-progress" aria-label="Job progress">
      <ol className="job-progress-steps">
        {STAGES.map((stage, index) => {
          const isComplete = index < currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <li
              className={[
                "job-progress-step",
                isComplete ? "is-complete" : "",
                isCurrent ? "is-current" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              key={stage}
              aria-current={isCurrent ? "step" : undefined}
            >
              <span className="job-progress-marker" aria-hidden="true">
                {isComplete ? "✓" : index + 1}
              </span>
              <span className="job-progress-label">{stage}</span>
            </li>
          );
        })}
      </ol>
      {onAdvance && nextStage && (
        <button
          className="job-progress-action"
          type="button"
          onClick={onAdvance}
          disabled={updating}
        >
          {updating ? "Updating..." : `Update to ${nextStage}`}
        </button>
      )}
    </section>
  );
}

export default JobProgressTracker;
