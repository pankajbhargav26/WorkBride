const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();

const apiBaseUrl =
  configuredApiUrl || "http://localhost:5000/api";

export const API_BASE_URL = apiBaseUrl.replace(/\/+$/, "");