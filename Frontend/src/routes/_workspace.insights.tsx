import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, Sparkles, Target, Clock, BookOpen, LineChart } from "lucide-react";
import { insightsApi } from "@/lib/api";

export const Route = createFileRoute("/_workspace/insights")({
  component: InsightsPage,
});

const cardIcons = [TrendingUp, Sparkles, Clock];

function InsightsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["insights"],
    queryFn: () => insightsApi.get(),
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-sm text-muted-foreground md:px-8">
        Loading insights…
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-sm text-muted-foreground md:px-8">
        Could not load insights.
      </div>
    );
  }

  const max = Math.max(1, ...data.growth.map((g) => g.value));

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">
      <p className="text-xs uppercase tracking-widest text-muted-foreground">Insights</p>
      <h1 className="mt-2 font-serif text-4xl tracking-tight">Your learning, at a glance.</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Klyptic looks at your captures and surfaces what's changing.
      </p>

      <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        {data.weeklyInsights.map((w) => (
          <div key={w.label} className="rounded-xl border border-border bg-card p-4">
            <p className="text-[11px] text-muted-foreground">{w.label}</p>
            <p className="mt-2 font-serif text-3xl leading-none">{w.value}</p>
            <p className="mt-1.5 text-[11px] font-medium text-brand">{w.delta}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className="rounded-xl border border-border bg-card p-5 lg:col-span-2">
          <div className="flex items-center gap-2">
            <LineChart className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm font-medium">Knowledge growth this week</p>
          </div>
          <div className="mt-6 flex h-40 items-end gap-3">
            {data.growth.map((g) => (
              <div key={g.label} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className="w-full rounded-md bg-foreground"
                  style={{ height: `${(g.value / max) * 100}%`, minHeight: 4 }}
                />
                <span className="text-[11px] text-muted-foreground">{g.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm font-medium">Most learned topics</p>
          </div>
          <ul className="mt-4 space-y-3">
            {data.topics.length === 0 ? (
              <li className="text-sm text-muted-foreground">No topics yet.</li>
            ) : (
              data.topics.map((t) => {
                const top = data.topics[0]?.count || 1;
                return (
                  <li key={t.name}>
                    <div className="flex items-center justify-between text-sm">
                      <span>#{t.name}</span>
                      <span className="text-xs text-muted-foreground">{t.count}</span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-foreground"
                        style={{ width: `${(t.count / top) * 100}%` }}
                      />
                    </div>
                  </li>
                );
              })
            )}
          </ul>
        </section>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {data.cards.map((card, i) => {
          const Icon = cardIcons[i % cardIcons.length];
          return <InsightCard key={card.title} icon={Icon} title={card.title} body={card.body} />;
        })}
      </div>

      <section className="mt-6 rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm font-medium">Weekly summary</p>
        </div>
        <p className="mt-4 text-[15px] leading-relaxed">{data.weeklySummary}</p>
      </section>
    </div>
  );
}

function InsightCard({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof TrendingUp;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <p className="text-sm font-medium">{title}</p>
      </div>
      <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}
