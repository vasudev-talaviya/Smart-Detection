/**
 * HTTP API client — single source of truth for all backend requests.
 * Handles JSON serialization, error parsing, and request timeouts.
 */
const BASE = import.meta.env.VITE_API_URL || "/api";

export async function request(path, options = {}) {
  const url = `${BASE}${path}`;
  const headers = { ...options.headers };
  if (options.body && !(options.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  } else if (!options.body && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000);
  try {
    const res = await fetch(url, { ...options, headers, signal: controller.signal });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      let errMsg = body.detail || body.message || `Request failed (${res.status})`;
      if (Array.isArray(errMsg)) {
        errMsg = errMsg.map(e => `${e.loc?.join('.')} - ${e.msg}`).join(", ");
      }
      throw new Error(errMsg);
    }
    return res.json();
  } catch (e) {
    if (e.name === "AbortError") {
      throw new Error("Request timed out — is the backend running?", { cause: e });
    }
    throw e;
  } finally {
    clearTimeout(timeout);
  }
}
