import type { CaptureType } from "@/lib/api/types";
import {
  FileText,
  Video,
  Image as ImageIcon,
  Code2,
  MessageSquare,
  StickyNote,
  Github,
  Newspaper,
} from "lucide-react";

export const typeMeta: Record<CaptureType, { label: string; icon: typeof FileText }> = {
  article: { label: "Article", icon: Newspaper },
  pdf: { label: "PDF", icon: FileText },
  video: { label: "Video", icon: Video },
  screenshot: { label: "Screenshot", icon: ImageIcon },
  code: { label: "Code", icon: Code2 },
  chat: { label: "Chat", icon: MessageSquare },
  note: { label: "Note", icon: StickyNote },
  repo: { label: "Repo", icon: Github },
};
