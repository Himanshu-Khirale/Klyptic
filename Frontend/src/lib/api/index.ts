import { apiRequest } from "./client";
import type {
  CaptureKind,
  DashboardData,
  InsightsData,
  KnowledgeItem,
  Topic,
  User,
} from "./types";

export const authApi = {
  signup(input: { name: string; email: string; password: string }) {
    return apiRequest<{ token: string; user: User }>("/auth/signup", {
      method: "POST",
      body: input,
      auth: false,
    });
  },
  login(input: { email: string; password: string }) {
    return apiRequest<{ token: string; user: User }>("/auth/login", {
      method: "POST",
      body: input,
      auth: false,
    });
  },
  me() {
    return apiRequest<User>("/auth/me");
  },
  logout() {
    return apiRequest<{ success: boolean }>("/auth/logout", { method: "POST" });
  },
};

export const knowledgeApi = {
  list(params: {
    type?: string;
    topic?: string;
    q?: string;
    sort?: string;
    page?: number;
    limit?: number;
  } = {}) {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== "" && v !== "all") qs.set(k, String(v));
    });
    const query = qs.toString();
    return apiRequest<{
      items: KnowledgeItem[];
      pagination: { page: number; limit: number; total: number; totalPages: number };
    }>(`/knowledge${query ? `?${query}` : ""}`);
  },
  get(id: string) {
    return apiRequest<{ item: KnowledgeItem; relatedItems: KnowledgeItem[] }>(
      `/knowledge/${id}`,
    );
  },
  capture(input: {
    kind: CaptureKind;
    content?: string;
    url?: string;
    title?: string;
    topic?: string;
  }) {
    return apiRequest<KnowledgeItem>("/knowledge/capture", {
      method: "POST",
      body: input,
    });
  },
  upload(file: File, fields: { kind?: string; title?: string; topic?: string } = {}) {
    const form = new FormData();
    form.append("file", file);
    if (fields.kind) form.append("kind", fields.kind);
    if (fields.title) form.append("title", fields.title);
    if (fields.topic) form.append("topic", fields.topic);
    return apiRequest<KnowledgeItem>("/knowledge/upload", {
      method: "POST",
      formData: form,
    });
  },
  update(id: string, body: Partial<KnowledgeItem>) {
    return apiRequest<KnowledgeItem>(`/knowledge/${id}`, { method: "PATCH", body });
  },
  remove(id: string) {
    return apiRequest<{ id: string }>(`/knowledge/${id}`, { method: "DELETE" });
  },
};

export const searchApi = {
  search(q: string, limit = 20) {
    const qs = new URLSearchParams({ q, limit: String(limit) });
    return apiRequest<{
      query: string;
      mode: string;
      results: KnowledgeItem[];
      count: number;
    }>(`/search?${qs}`);
  },
};

export const chatApi = {
  ask(message: string, history: { role: "user" | "assistant"; content: string }[] = []) {
    return apiRequest<{
      answer: string;
      refs: string[];
      referencedItems: KnowledgeItem[];
      mode: string;
    }>("/chat", {
      method: "POST",
      body: { message, history },
    });
  },
  suggestions() {
    return apiRequest<{ suggestions: string[] }>("/chat/suggestions");
  },
};

export const dashboardApi = {
  get() {
    return apiRequest<DashboardData>("/dashboard");
  },
};

export const insightsApi = {
  get() {
    return apiRequest<InsightsData>("/insights");
  },
};

export const topicsApi = {
  list() {
    return apiRequest<{ topics: Topic[] }>("/topics");
  },
  get(name: string) {
    return apiRequest<{ name: string; count: number; items: KnowledgeItem[] }>(
      `/topics/${encodeURIComponent(name)}`,
    );
  },
};

export const userApi = {
  updateProfile(body: { name?: string; handle?: string; avatarUrl?: string | null }) {
    return apiRequest<User>("/users/me", { method: "PATCH", body });
  },
  updatePreferences(body: NonNullable<User["preferences"]>) {
    return apiRequest<User>("/users/me/preferences", { method: "PATCH", body });
  },
  exportJson() {
    return apiRequest<{
      format: string;
      content: { exportedAt: string; user: User; items: KnowledgeItem[] };
      filename: string;
    }>("/users/me/export?format=json");
  },
  deleteWorkspace() {
    return apiRequest<{ deleted: boolean }>("/users/me", { method: "DELETE" });
  },
};
