import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowUpRight,
  FileText,
  Image as ImageIcon,
  Newspaper,
  Video,
  Layers,
  Sparkles,
  Clock,
} from "lucide-react";
import { dashboardApi } from "@/lib/api";
import { typeMeta } from "@/lib/type-meta";

export const Route = createFileRoute("/_workspace/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => dashboardApi.get(),
  });

  if (isLoading) {
    return <PageState>Loading dashboard…</PageState>;
  }

  if (error || !data) {
    return <PageState>Could not load dashboard.</PageState>;
  }

  const statCards = [
    { label: "Total items", value: data.stats.total, icon: Layers, color: "text-brand", bg: "bg-brand/10" },
    { label: "Documents", value: data.stats.documents, icon: FileText, color: "text-accent-teal", bg: "bg-accent-teal/10" },
    { label: "Videos", value: data.stats.videos, icon: Video, color: "text-accent-rose", bg: "bg-accent-rose/10" },
    { label: "Articles", value: data.stats.articles, icon: Newspaper, color: "text-accent-amber", bg: "bg-accent-amber/10" },
    { label: "Screenshots", value: data.stats.screenshots, icon: ImageIcon, color: "text-accent-violet", bg: "bg-accent-violet/10" },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
      <div className="animate-fade-up">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">{data.dateLabel}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">{data.greeting}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{data.newThisWeek} new items</span> captured
          this week.
        </p>
      </div>

      <div
        className="animate-fade-up mt-8 grid grid-cols-2 gap-3 md:grid-cols-5"
        style={{ animationDelay: "80ms" }}
      >
        {statCards.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="group rounded-xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-foreground/20"
            >
              <div className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${s.bg}`}>
                <Icon className={`h-4 w-4 ${s.color}`} />
              </div>
              <p className="mt-5 text-2xl font-semibold tracking-tight">{s.value}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">{s.label}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1.7fr_1fr]">
        <section className="animate-fade-up" style={{ animationDelay: "140ms" }}>
          <SectionTitle title="Recent captures" href="/inbox" />
          <div className="mt-4 space-y-2">
            {data.recentCaptures.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
                Nothing captured yet. Use Quick capture to add your first item.
              </p>
            ) : (
              data.recentCaptures.map((k) => {
                const Icon = typeMeta[k.type].icon;
                return (
                  <Link
                    key={k.id}
                    to="/knowledge/$id"
                    params={{ id: k.id }}
                    className="group flex items-center gap-4 rounded-xl border border-border bg-card px-4 py-3.5 transition-all hover:border-foreground/20 hover:bg-muted/40"
                  >
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-muted transition-colors group-hover:bg-brand/10">
                      <Icon className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-brand" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{k.title}</p>
                      <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                        {typeMeta[k.type].label} · {k.source} · {k.date}
                      </p>
                    </div>
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                  </Link>
                );
              })
            )}
          </div>
        </section>

        <div className="animate-fade-up space-y-6" style={{ animationDelay: "200ms" }}>
          <section className="relative overflow-hidden rounded-xl border border-border bg-card p-5">
            <div className="glow-brand absolute -right-16 -top-16 h-40 w-40 opacity-60" />
            <div className="relative">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-brand" />
                <p className="text-sm font-medium">This week</p>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-4">
                {data.weeklyInsights.map((w) => (
                  <div key={w.label}>
                    <p className="text-2xl font-semibold tracking-tight">{w.value}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">{w.label}</p>
                    <p className="text-[10px] font-medium text-accent-green">{w.delta}</p>
                  </div>
                ))}
              </div>
              <Link
                to="/insights"
                className="mt-5 inline-flex items-center gap-1 text-xs font-medium text-brand hover:underline"
              >
                See full report <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
          </section>

          <section className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-accent-amber" />
              <p className="text-sm font-medium">Worth revisiting</p>
            </div>
            <ul className="mt-4 space-y-2.5">
              {data.worthRevisiting.length === 0 ? (
                <li className="text-sm text-muted-foreground">No older items yet.</li>
              ) : (
                data.worthRevisiting.map((k) => (
                  <li key={k.id} className="flex items-center justify-between gap-3">
                    <Link
                      to="/knowledge/$id"
                      params={{ id: k.id }}
                      className="min-w-0 truncate text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {k.title}
                    </Link>
                    <span className="shrink-0 text-[11px] text-muted-foreground">{k.date}</span>
                  </li>
                ))
              )}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ title, href }: { title: string; href: string }) {
  return (
    <div className="flex items-baseline justify-between">
      <h2 className="text-[15px] font-semibold">{title}</h2>
      <Link to={href} className="text-xs text-muted-foreground transition-colors hover:text-foreground">
        View all →
      </Link>
    </div>
  );
}

function PageState({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 text-sm text-muted-foreground md:px-8">
      {children}
    </div>
  );
}
