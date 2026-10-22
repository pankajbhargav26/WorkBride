const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000/api")
  .replace(/\/+$/, "");

export function getCustomerToken() {
  return localStorage.getItem("token") || localStorage.getItem("accessToken");
}

async function requestJobs(path, options = {}) {
  const token = getCustomerToken();
  if (!token) {
    throw new Error("Please log in as a customer before posting or viewing your jobs.");
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    ...(options.body ? { "Content-Type": "application/json" } : {})
  };

  let response;
  try {
    response = await fetch(`${API_BASE_URL}/jobs${path}`, {
      ...options,
      headers: { ...headers, ...options.headers }
    });
  } catch {
    throw new Error(`Cannot reach the WorkBridge API at ${API_BASE_URL}. Make sure the backend is running.`);
  }

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : null;

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem("token");
      localStorage.removeItem("accessToken");
    }
    throw new Error(data?.message || `The request failed with status ${response.status}.`);
  }

  if (!data) {
    throw new Error("The API returned an unexpected response.");
  }

  return data;
}

export function createJob(job) {
  return requestJobs("", {
    method: "POST",
    body: JSON.stringify(job)
  });
}

export function getMyJobs() {
  return requestJobs("/my-jobs");
}

export function getMyJob(id) {
  return requestJobs(`/${encodeURIComponent(id)}`);
}

export function getAllJobs(page = 1, limit = 20) {
  return requestJobs(`/admin/all?page=${page}&limit=${limit}`);
}
