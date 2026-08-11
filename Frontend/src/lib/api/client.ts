import type { ApiFailure, ApiSuccess, User } from "./types";

const TOKEN_KEY = "klyptic_token";
const USER_KEY = "klyptic_user";

export function getApiBaseUrl() {
  return (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ||
    "http://localhost:5000/api";
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setSession(token: string, user: User) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export class ApiError extends Error {
  status: number;
  code?: string;
  details?: unknown;

  constructor(status: number, message: string, code?: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

type RequestOptions = {
  method?: string;
  body?: unknown;
  token?: string | null;
  formData?: FormData;
  auth?: boolean;
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, formData, auth = true } = options;
  const headers: Record<string, string> = {};

  const token = options.token === undefined ? getToken() : options.token;
  if (auth && token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let payload: BodyInit | undefined;
  if (formData) {
    payload = formData;
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    method,
    headers,
    body: payload,
  });

  const text = await response.text();
  let json: ApiSuccess<T> | ApiFailure | null = null;
  if (text) {
    try {
      json = JSON.parse(text) as ApiSuccess<T> | ApiFailure;
    } catch {
      throw new ApiError(response.status, text || "Invalid server response");
    }
  }

  if (!response.ok || !json || json.success === false) {
    const message =
      json && "message" in json ? json.message : `Request failed (${response.status})`;
    const code = json && "code" in json ? json.code : undefined;
    const details = json && "details" in json ? json.details : undefined;

    if (response.status === 401 && auth) {
      clearSession();
    }

    throw new ApiError(response.status, message, code, details);
  }

  return json.data;
}
