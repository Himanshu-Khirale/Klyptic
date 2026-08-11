import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Hash, ArrowUpRight } from "lucide-react";
import { topicsApi } from "@/lib/api";
import { typeMeta } from "@/lib/type-meta";

export const Route = createFileRoute("/_workspace/topics")({
  component: TopicsPage,
});

function TopicsPage() {
  const [active, setActive] = useState<string | null>(null);

  const { data: topicsData, isLoading } = useQuery({
    queryKey: ["topics"],
    queryFn: () => topicsApi.list(),
  });

  const { data: activeData, isLoading: loadingActive } = useQuery({
    queryKey: ["topics", active],
    queryFn: () => topicsApi.get(active!),
    enabled: Boolean(active),
  });

  const topics = topicsData?.topics ?? [];
  const activeItems = activeData?.items ?? [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">
      <p className="text-xs uppercase tracking-widest text-muted-foreground">Topics</p>
      <h1 className="mt-2 font-serif text-4xl tracking-tight">Explore what you're learning.</h1>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        Topics grow automatically from your captures. Click one to dive in.
      </p>

      {active ? (
        <div className="mt-8">
          <button
            onClick={() => setActive(null)}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            ← All topics
          </button>
          <div className="mt-4 flex items-baseline justify-between">
            <h2 className="font-serif text-3xl">#{active}</h2>
            <p className="text-sm text-muted-foreground">{activeData?.count ?? 0} items</p>
          </div>
          {loadingActive ? (
            <p className="mt-6 text-sm text-muted-foreground">Loading…</p>
          ) : (
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {activeItems.map((k) => {
                const Icon = typeMeta[k.type].icon;
                return (
                  <Link
                    key={k.id}
                    to="/knowledge/$id"
                    params={{ id: k.id }}
                    className="group flex flex-col rounded-xl border border-border bg-card p-4 hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <Icon className="h-3 w-3" />
                      <span>{typeMeta[k.type].label}</span>
                      <span>·</span>
                      <span>{k.date}</span>
                    </div>
                    <p className="mt-2 text-[14px] font-medium leading-snug">{k.title}</p>
                    <p className="mt-1 line-clamp-2 text-[12px] text-muted-foreground">{k.preview}</p>
                  </Link>
                );
              })}
              {activeItems.length === 0 && (
                <p className="col-span-full text-sm text-muted-foreground">
                  No items in this topic yet.
                </p>
              )}
            </div>
          )}
        </div>
      ) : isLoading ? (
        <p className="mt-8 text-sm text-muted-foreground">Loading topics…</p>
      ) : topics.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">
          No topics yet. Capture something to get started.
        </p>
      ) : (
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {topics.map((t) => (
            <button
              key={t.name}
              onClick={() => setActive(t.name)}
              className="group flex flex-col items-start rounded-2xl border border-border bg-card p-6 text-left transition-colors hover:bg-muted/50"
            >
              <div
                className="grid h-8 w-8 place-items-center rounded-lg"
                style={{ backgroundColor: `color-mix(in oklab, ${t.color} 15%, transparent)` }}
              >
                <Hash className="h-4 w-4" style={{ color: t.color }} />
              </div>
              <h3 className="mt-4 font-serif text-2xl leading-tight">{t.name}</h3>
              <div className="mt-6 flex w-full items-center justify-between border-t border-border pt-3 text-[12px] text-muted-foreground">
                <span>{t.count} items</span>
                <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
