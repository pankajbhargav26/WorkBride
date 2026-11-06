// Shared helpers for the WorkBridge job workflow.
//
// Accepted -> Visited -> Estimate Given -> In Progress -> Completed
//                                      \-> Repair Not Proceeded

export const NOT_PROCEEDED = "Repair Not Proceeded";

// "Inspection Only" is the old name of "Repair Not Proceeded".
export const isNotProceeded = (status) =>
  status === NOT_PROCEEDED || status === "Inspection Only";

export const isFinished = (status) =>
  status === "Completed" || isNotProceeded(status);

// Label shown in the UI (maps the legacy status to the new name)
export const statusLabel = (status) =>
  status === "Inspection Only" ? NOT_PROCEEDED : status;

// CSS-friendly class name: "Estimate Given" -> "estimate-given"
export const statusClass = (status) =>
  statusLabel(status || "").toLowerCase().replace(/\s+/g, "-");

export const formatRupees = (value) =>
  value === null || value === undefined || value === ""
    ? "—"
    : `₹${Number(value).toLocaleString("en-IN")}`;

// Visiting charge is always payable once the technician has visited.
// Repair charge is payable only when the repair was actually completed.
export const getTotalPayable = (job) => {
  const visiting = Number(job.visitingCharge) || 0;
  const repair =
    job.status === "Completed" ? Number(job.estimatedCharges) || 0 : 0;
  return visiting + repair;
};

// Token key was saved as "workBridgeToken" by Login/Register, but some
// pages read "workbridgeToken". Read both so every page works.
export const getToken = () =>
  localStorage.getItem("workBridgeToken") ||
  localStorage.getItem("workbridgeToken");

export const clearAuth = () => {
  ["workBridgeToken", "workbridgeToken", "workBridgeUser", "workbridgeUser"].forEach(
    (key) => localStorage.removeItem(key)
  );
};

// Steps for the progress tracker
export const WORKFLOW_STEPS = [
  "Accepted",
  "Visited",
  "Estimate Given",
  "In Progress",
  "Completed"
];

// Returns { steps: [{label, state}], stopped } where state is
// "done" | "current" | "pending" | "stopped"
export const getProgress = (job) => {
  const stopped = isNotProceeded(job.status);
  const order = { Accepted: 0, Visited: 1, "Estimate Given": 2, "In Progress": 3, Completed: 4 };

  // Where a "Repair Not Proceeded" job stopped: after the estimate if one was given
  const currentIndex = stopped
    ? job.estimatedCharges !== null && job.estimatedCharges !== undefined
      ? 2
      : 1
    : order[job.status] ?? -1;

  const steps = WORKFLOW_STEPS.map((label, index) => {
    let state = "pending";
    if (job.status === "Completed" || index < currentIndex) state = "done";
    else if (index === currentIndex) state = stopped ? "done" : "current";
    return { label, state };
  });

  if (stopped) {
    // Replace the remaining steps with the final "not proceeded" step
    return {
      stopped,
      steps: [
        ...steps.slice(0, currentIndex + 1),
        { label: NOT_PROCEEDED, state: "stopped" }
      ]
    };
  }

  return { stopped, steps };
};
