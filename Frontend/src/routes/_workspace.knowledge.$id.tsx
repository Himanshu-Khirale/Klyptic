import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ExternalLink, Sparkles, Share2, Bookmark } from "lucide-react";
import { knowledgeApi } from "@/lib/api";
import { typeMeta } from "@/lib/type-meta";

export const Route = createFileRoute("/_workspace/knowledge/$id")({
  component: KnowledgeDetail,
});

function KnowledgeDetail() {
  const { id } = Route.useParams();
  const { data, isLoading, error } = useQuery({
    queryKey: ["knowledge", id],
    queryFn: () => knowledgeApi.get(id),
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (error || !data?.item) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <p className="font-serif text-3xl">Item not found</p>
        <Link to="/inbox" className="mt-4 inline-block text-sm text-muted-foreground hover:underline">
          Back to inbox
        </Link>
      </div>
    );
  }

  const item = data.item;
  const related = data.relatedItems ?? [];
  const Icon = typeMeta[item.type].icon;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:px-8">
      <Link
        to="/inbox"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" /> Back to inbox
      </Link>

      <div className="mt-6 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1.5 rounded-full border border-border px-2 py-0.5">
          <Icon className="h-3 w-3" /> {typeMeta[item.type].label}
        </span>
        <span className="rounded-full border border-border px-2 py-0.5">#{item.topic}</span>
        <span>{item.date}</span>
        <span>·</span>
        <span>{item.source}</span>
      </div>

      <h1 className="mt-4 font-serif text-4xl leading-tight tracking-tight md:text-5xl">
        {item.title}
      </h1>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        {item.url && (
          <a
            href={item.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium hover:bg-muted"
          >
            <ExternalLink className="h-3 w-3" /> Open original
          </a>
        )}
        <button className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium hover:bg-muted">
          <Bookmark className="h-3 w-3" /> Save to collection
        </button>
        <button className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium hover:bg-muted">
          <Share2 className="h-3 w-3" /> Share
        </button>
      </div>

      <div className="mt-10 grid gap-8 md:grid-cols-[1fr_260px]">
        <article className="space-y-8">
          <section className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                Klyptic summary
              </p>
            </div>
            <p className="mt-4 text-[15px] leading-relaxed">
              {item.summary || item.preview || "No summary yet."}
            </p>
          </section>

          <section>
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Key takeaways
            </p>
            <ul className="mt-4 space-y-3">
              {(item.takeaways?.length ? item.takeaways : ["No takeaways generated yet."]).map(
                (t, i) => (
                  <li key={i} className="flex gap-3 text-[15px] leading-relaxed">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                    <span>{t}</span>
                  </li>
                ),
              )}
            </ul>
          </section>

          <section>
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Original content
            </p>
            <div className="mt-4 rounded-xl border border-border bg-surface p-5">
              <p className="text-[14px] leading-relaxed text-muted-foreground">{item.preview}</p>
              <p className="mt-3 text-[12px] text-muted-foreground">
                — extracted from {item.source}
              </p>
            </div>
          </section>
        </article>

        <aside className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Detected topics
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {[item.topic, ...(item.related ?? []).slice(0, 3)].map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-border bg-background px-2.5 py-0.5 text-[12px]"
                >
                  #{t}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Metadata
            </p>
            <dl className="mt-3 space-y-2 text-[13px]">
              <MetaRow k="Type" v={typeMeta[item.type].label} />
              <MetaRow k="Source" v={item.source} />
              <MetaRow k="Captured" v={item.date} />
              <MetaRow k="Words" v={String(item.metadata?.words ?? "—")} />
              <MetaRow k="Read time" v={item.metadata?.readTime ?? "—"} />
            </dl>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Related
            </p>
            <ul className="mt-3 space-y-3">
              {related.length === 0 ? (
                <li className="text-[13px] text-muted-foreground">No related items yet.</li>
              ) : (
                related.map((r) => (
                  <li key={r.id}>
                    <Link
                      to="/knowledge/$id"
                      params={{ id: r.id }}
                      className="block text-[13px] font-medium leading-snug hover:underline"
                    >
                      {r.title}
                    </Link>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {typeMeta[r.type].label} · {r.date}
                    </p>
                  </li>
                ))
              )}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

function MetaRow({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="text-right">{v}</dd>
    </div>
  );
}
