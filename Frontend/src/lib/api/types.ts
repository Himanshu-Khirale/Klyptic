export type CaptureType =
  | "article"
  | "pdf"
  | "video"
  | "screenshot"
  | "code"
  | "chat"
  | "note"
  | "repo";

export type CaptureKind =
  | "text"
  | "pdf"
  | "image"
  | "url"
  | "youtube"
  | "docs"
  | "code"
  | "note"
  | "repo"
  | "chat";

export interface KnowledgeItem {
  id: string;
  title: string;
  source: string;
  date: string;
  capturedAt?: string;
  topic: string;
  type: CaptureType;
  preview: string;
  summary: string;
  takeaways: string[];
  related: string[];
  url?: string;
  status?: string;
  metadata?: {
    words?: number;
    readTime?: string;
    mimeType?: string;
    fileName?: string;
  };
}

export interface Topic {
  name: string;
  count: number;
  color: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  handle?: string;
  avatarUrl?: string | null;
  plan: string;
  initials: string;
  preferences?: {
    notifications?: {
      weeklySummaryEmail?: boolean;
      revisionReminders?: boolean;
      newConnections?: boolean;
    };
    appearance?: {
      theme?: "light" | "dark" | "system";
      reducedMotion?: boolean;
      compactDensity?: boolean;
    };
    privacy?: {
      improveProduct?: boolean;
      shareAnonymousUsage?: boolean;
    };
    defaultModel?: string;
  };
  createdAt?: string;
}

export interface WeeklyInsight {
  label: string;
  value: string;
  delta: string;
}

export interface DashboardData {
  user: User;
  greeting: string;
  dateLabel: string;
  newThisWeek: number;
  stats: {
    total: number;
    documents: number;
    videos: number;
    articles: number;
    screenshots: number;
    byType?: Record<string, number>;
  };
  weeklyInsights: WeeklyInsight[];
  recentCaptures: KnowledgeItem[];
  worthRevisiting: KnowledgeItem[];
  topicCount: number;
}

export interface InsightsData {
  weeklyInsights: WeeklyInsight[];
  growth: { label: string; value: number }[];
  topics: Topic[];
  cards: { title: string; body: string }[];
  weeklySummary: string;
}

export interface ApiSuccess<T> {
  success: true;
  message?: string;
  data: T;
}

export interface ApiFailure {
  success: false;
  message: string;
  code?: string;
  details?: unknown;
}
