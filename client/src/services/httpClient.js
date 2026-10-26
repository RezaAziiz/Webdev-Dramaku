import { apiUrl } from "../config/api";

export class HttpError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.data = data;
  }
}

const buildHeaders = (token, hasBody, isFormData) => {
  const headers = {};
  if (hasBody && !isFormData) {
    headers["Content-Type"] = "application/json";
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

const parseResponse = async (response) => {
  const contentType = response.headers.get("Content-Type") || "";
  const isJson = contentType.includes("application/json");
  const payload = isJson
    ? await response.json().catch(() => null)
    : await response.text();

  if (!response.ok) {
    const message =
      (isJson && payload && payload.message) ||
      response.statusText ||
      "Request failed";
    throw new HttpError(message, response.status, payload);
  }

  return payload;
};

const request = async (
  path,
  { method = "GET", body, token, isFormData = false, signal } = {},
) => {
  try {
    const response = await fetch(apiUrl(path), {
      method,
      headers: buildHeaders(token, body !== undefined, isFormData),
      signal,
      body:
        body === undefined ? undefined : isFormData ? body : JSON.stringify(body),
    });

    return await parseResponse(response);
  } catch (error) {
    if (signal?.aborted && error instanceof Error && error.name === "AbortError") {
      return null;
    }
    throw error;
  }
};

export const httpClient = {
  get: (path, options) => request(path, { ...options, method: "GET" }),
  post: (path, body, options) =>
    request(path, { ...options, method: "POST", body }),
  put: (path, body, options) =>
    request(path, { ...options, method: "PUT", body }),
  patch: (path, body, options) =>
    request(path, { ...options, method: "PATCH", body }),
  delete: (path, options) => request(path, { ...options, method: "DELETE" }),
};
