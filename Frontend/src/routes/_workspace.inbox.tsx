import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { LayoutGrid, List, Search, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { knowledgeApi } from "@/lib/api";
import type { CaptureType } from "@/lib/api/types";
import { typeMeta } from "@/lib/type-meta";

export const Route = createFileRoute("/_workspace/inbox")({
  component: InboxPage,
});

const filters: { id: CaptureType | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "article", label: "Articles" },
  { id: "pdf", label: "PDFs" },
  { id: "video", label: "Videos" },
  { id: "screenshot", label: "Screenshots" },
  { id: "code", label: "Code" },
  { id: "chat", label: "Chats" },
  { id: "note", label: "Notes" },
  { id: "repo", label: "Repos" },
];

function InboxPage() {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [filter, setFilter] = useState<CaptureType | "all">("all");
  const [query, setQuery] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["knowledge", filter, query],
    queryFn: () =>
      knowledgeApi.list({
        type: filter,
        q: query,
        sort: "recent",
        limit: 100,
      }),
  });

  const filtered = data?.items ?? [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Library</p>
          <h1 className="mt-2 font-serif text-4xl tracking-tight">Knowledge Inbox</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Everything you've captured, auto-organized.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg border border-border bg-card p-0.5">
            <button
              onClick={() => setView("grid")}
              className={`rounded-md p-1.5 ${view === "grid" ? "bg-muted" : "text-muted-foreground"}`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView("list")}
              className={`rounded-md p-1.5 ${view === "list" ? "bg-muted" : "text-muted-foreground"}`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter within inbox…"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <button className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm">
          <SlidersHorizontal className="h-4 w-4" /> Sort: Recent
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`rounded-full border px-3 py-1 text-[13px] transition-colors ${
              filter === f.id
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="mt-10 text-sm text-muted-foreground">Loading inbox…</p>
      ) : filtered.length === 0 ? (
        <EmptyState />
      ) : view === "grid" ? (
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((k) => {
            const Icon = typeMeta[k.type].icon;
            return (
              <Link
                key={k.id}
                to="/knowledge/$id"
                params={{ id: k.id }}
                className="group flex flex-col rounded-xl border border-border bg-card p-4 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Icon className="h-3 w-3" /> {typeMeta[k.type].label}
                  </span>
                  <span>{k.date}</span>
                </div>
                <p className="mt-3 line-clamp-2 text-[14px] font-medium leading-snug">{k.title}</p>
                <p className="mt-2 line-clamp-3 flex-1 text-[12px] leading-relaxed text-muted-foreground">
                  {k.preview}
                </p>
                <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-[11px]">
                  <span className="rounded-full border border-border px-2 py-0.5 text-muted-foreground">
                    #{k.topic}
                  </span>
                  <span className="text-muted-foreground">{k.source}</span>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-xl border border-border bg-card">
          {filtered.map((k, i) => {
            const Icon = typeMeta[k.type].icon;
            return (
              <Link
                key={k.id}
                to="/knowledge/$id"
                params={{ id: k.id }}
                className={`grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3 hover:bg-muted/50 ${i > 0 ? "border-t border-border" : ""}`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <Icon className="h-3 w-3" />
                    <span>{typeMeta[k.type].label}</span>
                    <span>·</span>
                    <span>{k.source}</span>
                  </div>
                  <p className="mt-1 truncate text-[14px] font-medium">{k.title}</p>
                </div>
                <div className="flex shrink-0 items-center gap-3 text-[11px] text-muted-foreground">
                  <span className="hidden rounded-full border border-border px-2 py-0.5 sm:inline">
                    #{k.topic}
                  </span>
                  <span>{k.date}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mt-12 grid place-items-center rounded-xl border border-dashed border-border py-16 text-center">
      <p className="font-serif text-2xl">Nothing here yet.</p>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Try clearing the filter, or capture something new.
      </p>
    </div>
  );
}
