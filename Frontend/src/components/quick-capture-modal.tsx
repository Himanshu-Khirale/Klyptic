import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { FileText, Image as ImageIcon, Link2, Youtube, BookOpen, Type, Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { knowledgeApi } from "@/lib/api";
import type { CaptureKind } from "@/lib/api/types";
import { ApiError } from "@/lib/api/client";

const options: { id: CaptureKind; label: string; desc: string; icon: typeof Type }[] = [
  { id: "text", label: "Paste text", desc: "Save a snippet, quote, or thought", icon: Type },
  { id: "pdf", label: "Upload PDF", desc: "Papers, ebooks, receipts", icon: FileText },
  { id: "image", label: "Upload image", desc: "Screenshots, diagrams, notes", icon: ImageIcon },
  { id: "url", label: "Save website", desc: "Any article or link", icon: Link2 },
  { id: "youtube", label: "Save YouTube", desc: "We'll transcribe and summarize", icon: Youtube },
  { id: "docs", label: "Save docs page", desc: "Framework or API documentation", icon: BookOpen },
];

export function QuickCaptureModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [selected, setSelected] = useState<CaptureKind>("text");
  const [value, setValue] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isFileMode = selected === "pdf" || selected === "image";

  async function handleCapture() {
    setError(null);
    setLoading(true);
    try {
      if (isFileMode) {
        if (!file) throw new ApiError(400, "Choose a file to upload");
        await knowledgeApi.upload(file, { kind: selected });
      } else if (selected === "text") {
        if (!value.trim()) throw new ApiError(400, "Paste some text first");
        await knowledgeApi.capture({ kind: "text", content: value.trim() });
      } else {
        const url = value.trim();
        if (!url) throw new ApiError(400, "Paste a URL first");
        await knowledgeApi.capture({ kind: selected, url });
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["knowledge"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
        queryClient.invalidateQueries({ queryKey: ["topics"] }),
        queryClient.invalidateQueries({ queryKey: ["insights"] }),
      ]);

      setValue("");
      setFile(null);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Capture failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b border-border px-6 py-4">
          <DialogTitle className="text-base font-semibold">Quick capture</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Klyptic will organize, tag, and connect it automatically.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-2 p-4 sm:grid-cols-3">
          {options.map((opt) => {
            const Icon = opt.icon;
            const active = selected === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  setSelected(opt.id);
                  setError(null);
                  setFile(null);
                }}
                className={cn(
                  "flex flex-col items-start gap-1.5 rounded-lg border p-3 text-left transition-colors",
                  active
                    ? "border-foreground/40 bg-muted"
                    : "border-border bg-card hover:bg-muted/60",
                )}
              >
                <Icon className="h-4 w-4 text-muted-foreground" />
                <p className="text-[13px] font-medium">{opt.label}</p>
                <p className="line-clamp-2 text-[11px] text-muted-foreground">{opt.desc}</p>
              </button>
            );
          })}
        </div>

        <div className="border-t border-border p-4">
          {!isFileMode ? (
            <textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={
                selected === "text"
                  ? "Paste anything — Klyptic will do the rest…"
                  : "Paste a URL…"
              }
              rows={4}
              className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground/40"
            />
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="grid w-full place-items-center rounded-lg border border-dashed border-border py-8 text-center hover:bg-muted/40"
            >
              <p className="text-sm font-medium">
                {file ? file.name : "Drop a file here"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">or click to browse</p>
              <input
                ref={fileRef}
                type="file"
                className="hidden"
                accept={selected === "pdf" ? "application/pdf,.pdf" : "image/*"}
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </button>
          )}

          {error && <p className="mt-2 text-sm text-destructive">{error}</p>}

          <div className="mt-3 flex items-center justify-between">
            <p className="text-[11px] text-muted-foreground">
              Auto-tagging & summary run in the background
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => void handleCapture()}
                className="inline-flex items-center gap-1.5 rounded-md bg-foreground px-3 py-1.5 text-sm font-medium text-background hover:opacity-90 disabled:opacity-60"
              >
                {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                Capture
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
