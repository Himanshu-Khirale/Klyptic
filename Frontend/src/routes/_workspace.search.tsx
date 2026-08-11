import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search, Sparkles, Clock, TrendingUp } from "lucide-react";
import { useState } from "react";
import { searchApi, topicsApi } from "@/lib/api";
import { typeMeta } from "@/lib/type-meta";

export const Route = createFileRoute("/_workspace/search")({
  component: SearchPage,
});

const recent = [
  "React Server Components trade-offs",
  "How does Tailscale traverse NAT?",
  "Prompt caching cost model",
  "Sliding-window vs token bucket",
];

const suggestions = [
  "Everything I saved this week about RAG",
  "Notes tagged #Distributed Systems",
  "Videos longer than 20 minutes",
  "Screenshots from Cursor",
];

function SearchPage() {
  const [q, setQ] = useState("");

  const { data: topicsData } = useQuery({
    queryKey: ["topics"],
    queryFn: () => topicsApi.list(),
  });

  const { data, isFetching } = useQuery({
    queryKey: ["search", q],
    queryFn: () => searchApi.search(q),
    enabled: q.trim().length > 0,
  });

  const results = data?.results ?? [];
  const topics = topicsData?.topics ?? [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 md:px-8">
      <p className="text-xs uppercase tracking-widest text-muted-foreground">Search</p>
      <h1 className="mt-2 font-serif text-4xl tracking-tight md:text-5xl">
        Ask your library anything.
      </h1>

      <div className="mt-8 flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-sm">
        <Search className="h-5 w-5 text-muted-foreground" />
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search across everything — plain language works."
          className="flex-1 bg-transparent text-[15px] outline-none placeholder:text-muted-foreground"
        />
        <span className="hidden rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:inline">
          {data?.mode || "semantic"}
        </span>
      </div>

      {q === "" ? (
        <div className="mt-10 grid gap-8 md:grid-cols-2">
          <section>
            <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
              <Clock className="h-3 w-3" /> Recent searches
            </div>
            <ul className="space-y-1.5">
              {recent.map((r) => (
                <li key={r}>
                  <button
                    onClick={() => setQ(r)}
                    className="w-full rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted"
                  >
                    {r}
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
              <Sparkles className="h-3 w-3" /> Try
            </div>
            <ul className="space-y-1.5">
              {suggestions.map((s) => (
                <li key={s}>
                  <button
                    onClick={() => setQ(s)}
                    className="w-full rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted"
                  >
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section className="md:col-span-2">
            <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
              <TrendingUp className="h-3 w-3" /> Popular topics
            </div>
            <div className="flex flex-wrap gap-2">
              {topics.length === 0 ? (
                <p className="text-sm text-muted-foreground">Capture items to grow topics.</p>
              ) : (
                topics.map((t) => (
                  <button
                    key={t.name}
                    onClick={() => setQ(t.name)}
                    className="rounded-full border border-border bg-card px-3 py-1 text-[13px] hover:bg-muted"
                  >
                    <span className="text-muted-foreground">#</span> {t.name}
                    <span className="ml-1.5 text-muted-foreground">{t.count}</span>
                  </button>
                ))
              )}
            </div>
          </section>
        </div>
      ) : (
        <div className="mt-8">
          <p className="text-xs text-muted-foreground">
            {isFetching
              ? "Searching…"
              : `${results.length} result${results.length !== 1 ? "s" : ""} for “${q}”`}
          </p>
          <div className="mt-3 space-y-2">
            {results.map((k) => {
              const Icon = typeMeta[k.type].icon;
              return (
                <Link
                  key={k.id}
                  to="/knowledge/$id"
                  params={{ id: k.id }}
                  className="block rounded-xl border border-border bg-card p-4 hover:bg-muted/50"
                >
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <Icon className="h-3 w-3" />
                    <span>{typeMeta[k.type].label}</span>
                    <span>·</span>
                    <span>#{k.topic}</span>
                    <span>·</span>
                    <span>{k.date}</span>
                  </div>
                  <p className="mt-2 text-[15px] font-medium">{k.title}</p>
                  <p className="mt-1 line-clamp-2 text-[13px] text-muted-foreground">{k.preview}</p>
                </Link>
              );
            })}
            {!isFetching && results.length === 0 && (
              <div className="rounded-xl border border-dashed border-border p-10 text-center">
                <p className="font-serif text-2xl">No matches</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Try a broader phrase or capture something new.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
