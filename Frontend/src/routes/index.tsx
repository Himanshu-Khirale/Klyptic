import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Sparkles,
  Search,
  Link2,
  Layers,
  Clock,
  Youtube,
  FileText,
  Image as ImageIcon,
  Code2,
  MessageSquare,
  Github,
  Plus,
  Minus,
} from "lucide-react";
import { useState } from "react";
import { typeMeta } from "@/lib/type-meta";
import { knowledgeItems, topics } from "@/lib/placeholder-data";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <Hero />
      <CaptureStrip />
      <Features />
      <HowItWorks />
      <WhyKlyptic />
      <FAQ />
      <Footer />
    </div>
  );
}

function SiteNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 md:px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid h-7 w-7 place-items-center rounded-md bg-foreground text-background">
            <span className="font-serif text-base leading-none">K</span>
          </div>
          <span className="text-[15px] font-semibold tracking-tight">Klyptic</span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
          <a href="#features" className="hover:text-foreground">Features</a>
          <a href="#how" className="hover:text-foreground">How it works</a>
          <a href="#why" className="hover:text-foreground">Why Klyptic</a>
          <a href="#faq" className="hover:text-foreground">FAQ</a>
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/login" className="hidden text-sm text-muted-foreground hover:text-foreground sm:inline">
            Sign in
          </Link>
          <Link
            to="/signup"
            className="rounded-lg bg-foreground px-3 py-1.5 text-sm font-medium text-background hover:opacity-90"
          >
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="hero-aurora absolute inset-0 opacity-70" />
      <div className="dot-pattern absolute inset-0 opacity-30" />
      <div className="relative mx-auto max-w-5xl px-4 pb-24 pt-24 text-center md:pt-32">
        <div className="animate-fade-up mx-auto inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-accent-green" />
          <span>Now in private beta</span>
        </div>

        <h1 className="animate-fade-up mt-6 text-5xl font-semibold leading-[1.05] tracking-tight text-foreground md:text-7xl" style={{ animationDelay: "60ms" }}>
          Capture once.
          <br />
          <span className="text-gradient-brand">Find forever.</span>
        </h1>

        <p className="animate-fade-up mx-auto mt-6 max-w-xl text-[15px] leading-relaxed text-muted-foreground md:text-base" style={{ animationDelay: "120ms" }}>
          An intelligent clipboard for everything you learn. Save it — Klyptic
          organizes, connects, and retrieves it for you.
        </p>

        <div className="animate-fade-up mt-9 flex flex-wrap items-center justify-center gap-3" style={{ animationDelay: "180ms" }}>
          <Link
            to="/signup"
            className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-brand px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-brand/20 transition-transform hover:-translate-y-0.5"
          >
            Get started <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card/70 px-5 py-2.5 text-sm font-medium backdrop-blur transition-colors hover:bg-muted"
          >
            View demo
          </Link>
        </div>

        <p className="mt-4 text-xs text-muted-foreground">Free while in beta · No credit card</p>

        <HeroPreview />
      </div>
    </section>
  );
}

function HeroPreview() {
  return (
    <div className="relative mx-auto mt-16 max-w-4xl">
      <div className="absolute -inset-x-8 -top-8 bottom-0 rounded-3xl bg-gradient-to-b from-foreground/[0.04] to-transparent" />
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-foreground/5">
        <div className="flex items-center gap-1.5 border-b border-border bg-surface px-4 py-2.5">
          <div className="h-2.5 w-2.5 rounded-full bg-border" />
          <div className="h-2.5 w-2.5 rounded-full bg-border" />
          <div className="h-2.5 w-2.5 rounded-full bg-border" />
          <div className="ml-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Search className="h-3 w-3" /> klyptic.app/dashboard
          </div>
        </div>
        <div className="grid gap-0 md:grid-cols-[180px_1fr]">
          <div className="hidden border-r border-border p-3 md:block">
            <div className="mb-2 h-6 rounded-md bg-muted" />
            <div className="space-y-1">
              {["Dashboard", "Inbox", "Search", "Topics", "Insights"].map((n, i) => (
                <div
                  key={n}
                  className={`h-6 rounded-md px-2 text-[11px] leading-6 ${i === 0 ? "bg-muted font-medium" : "text-muted-foreground"}`}
                >
                  {n}
                </div>
              ))}
            </div>
          </div>
          <div className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-medium">Knowledge Inbox</p>
              <p className="text-[11px] text-muted-foreground">248 items</p>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {knowledgeItems.slice(0, 4).map((k) => {
                const Icon = typeMeta[k.type].icon;
                return (
                  <div key={k.id} className="rounded-lg border border-border bg-background p-3">
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <Icon className="h-3 w-3" />
                      <span>{typeMeta[k.type].label}</span>
                      <span>·</span>
                      <span>{k.topic}</span>
                    </div>
                    <p className="mt-1.5 line-clamp-2 text-[12px] font-medium leading-snug">
                      {k.title}
                    </p>
                    <p className="mt-1 text-[10px] text-muted-foreground">{k.date}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CaptureStrip() {
  const items = [
    { icon: FileText, label: "PDFs" },
    { icon: Youtube, label: "YouTube" },
    { icon: ImageIcon, label: "Screenshots" },
    { icon: Code2, label: "Code" },
    { icon: MessageSquare, label: "ChatGPT" },
    { icon: Github, label: "GitHub" },
    { icon: Link2, label: "Articles" },
  ];
  return (
    <section className="border-b border-border py-10">
      <div className="mx-auto max-w-5xl px-4">
        <p className="mb-6 text-center text-xs uppercase tracking-widest text-muted-foreground">
          Capture from anywhere
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-muted-foreground">
          {items.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 text-sm">
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Features() {
  const features = [
    {
      icon: Layers,
      title: "One inbox for everything",
      body: "Text, PDFs, videos, screenshots, code, and chats live side by side. No folders, no filing.",
      color: "text-brand",
      bg: "bg-brand/10",
    },
    {
      icon: Sparkles,
      title: "Auto-organized",
      body: "Klyptic detects topics, extracts summaries, and pulls key takeaways in the background.",
      color: "text-accent-violet",
      bg: "bg-accent-violet/10",
    },
    {
      icon: Link2,
      title: "Connections you didn't see",
      body: "New captures link back to related material automatically. Your knowledge compounds.",
      color: "text-accent-teal",
      bg: "bg-accent-teal/10",
    },
    {
      icon: Search,
      title: "Search the way you think",
      body: "Ask in plain language. Klyptic understands intent, not just keywords.",
      color: "text-accent-green",
      bg: "bg-accent-green/10",
    },
    {
      icon: Clock,
      title: "Revisions that stick",
      body: "Weekly suggestions surface what's worth revisiting before you forget it.",
      color: "text-accent-amber",
      bg: "bg-accent-amber/10",
    },
    {
      icon: MessageSquare,
      title: "Ask your own library",
      body: "When you do want a conversation, Klyptic answers using only what you've saved.",
      color: "text-accent-rose",
      bg: "bg-accent-rose/10",
    },
  ];
  return (
    <section id="features" className="border-b border-border py-24">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <SectionHeader
          eyebrow="Features"
          title="A workspace, not a chatbot"
          body="Klyptic is built around capturing and finding — the AI works quietly in the background."
        />
        <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="group bg-background p-8 transition-colors hover:bg-card">
                <div className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${f.bg} transition-transform group-hover:scale-110`}>
                  <Icon className={`h-4.5 w-4.5 ${f.color}`} />
                </div>
                <h3 className="mt-5 text-[15px] font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      n: "01",
      title: "Capture",
      body: "Paste, drop, or share to Klyptic from anywhere — browser, mobile, terminal.",
    },
    {
      n: "02",
      title: "Klyptic organizes",
      body: "Summaries, topics, and metadata are generated silently. You never file a thing.",
    },
    {
      n: "03",
      title: "Rediscover",
      body: "Search, browse topics, or let weekly digests surface what matters again.",
    },
  ];
  return (
    <section id="how" className="border-b border-border py-24">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <SectionHeader eyebrow="How it works" title="Three steps. That's it." />
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.n} className="rounded-2xl border border-border bg-card p-8">
              <p className="font-mono text-xs text-muted-foreground">{s.n}</p>
              <h3 className="mt-6 font-serif text-2xl">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhyKlyptic() {
  return (
    <section id="why" className="border-b border-border py-24">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 md:grid-cols-[1fr_1.2fr] md:px-6">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Why Klyptic</p>
          <h2 className="mt-4 font-serif text-4xl leading-tight tracking-tight md:text-5xl">
            The notes app you never have to organize.
          </h2>
          <p className="mt-6 text-[15px] leading-relaxed text-muted-foreground">
            Every knowledge tool asks you to become a librarian. Klyptic just asks you to save
            what interests you. The organization, the connections, the retrieval — that's our
            job.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            ["No folders", "Topics emerge from your content, not the other way around."],
            ["No manual tags", "Klyptic tags every capture with topics you actually think in."],
            ["No dead notes", "Weekly revisions bring the useful stuff back to the surface."],
            ["No black box", "Every answer cites the exact items it came from."],
          ].map(([title, body]) => (
            <div key={title} className="rounded-xl border border-border bg-card p-5">
              <h4 className="text-[14px] font-semibold">{title}</h4>
              <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="mx-auto mt-16 max-w-5xl px-4 md:px-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">
          Topics that grew from your captures
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {topics.map((t) => (
            <span
              key={t.name}
              className="rounded-full border border-border bg-card px-3 py-1 text-[13px]"
            >
              <span className="text-muted-foreground">#</span> {t.name}
              <span className="ml-1.5 text-muted-foreground">{t.count}</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function SectionHeader({ eyebrow, title, body }: { eyebrow: string; title: string; body?: string }) {
  return (
    <div className="max-w-2xl">
      <p className="text-xs uppercase tracking-widest text-muted-foreground">{eyebrow}</p>
      <h2 className="mt-3 font-serif text-4xl leading-tight tracking-tight md:text-5xl">{title}</h2>
      {body && <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">{body}</p>}
    </div>
  );
}

function FAQ() {
  const faqs = [
    {
      q: "Is Klyptic a note-taking app?",
      a: "No. Klyptic is a knowledge workspace. You capture, it organizes. There is no folder tree, no manual tagging, no daily review ritual.",
    },
    {
      q: "How is this different from a chatbot?",
      a: "The chat is one small feature. Klyptic is designed around capturing and rediscovering — the AI works silently on your saved material.",
    },
    {
      q: "What can I capture?",
      a: "Text, PDFs, screenshots, articles, docs, YouTube videos, GitHub repositories, code snippets, and ChatGPT conversations.",
    },
    {
      q: "Where does my data live?",
      a: "In your private workspace. You can export or delete everything at any time from Settings.",
    },
    {
      q: "Does Klyptic work offline?",
      a: "Reading and searching your existing captures works offline. New captures sync when you're back online.",
    },
  ];
  return (
    <section id="faq" className="border-b border-border py-24">
      <div className="mx-auto max-w-3xl px-4 md:px-6">
        <SectionHeader eyebrow="FAQ" title="Questions, answered." />
        <div className="mt-10 divide-y divide-border rounded-2xl border border-border bg-card">
          {faqs.map((f, i) => (
            <FAQItem key={i} q={f.q} a={f.a} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <button
      onClick={() => setOpen((v) => !v)}
      className="flex w-full flex-col px-6 py-5 text-left"
    >
      <div className="flex items-center justify-between gap-4">
        <span className="text-[15px] font-medium">{q}</span>
        {open ? (
          <Minus className="h-4 w-4 shrink-0 text-muted-foreground" />
        ) : (
          <Plus className="h-4 w-4 shrink-0 text-muted-foreground" />
        )}
      </div>
      {open && <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{a}</p>}
    </button>
  );
}

function Footer() {
  return (
    <footer className="py-14">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-2">
              <div className="grid h-7 w-7 place-items-center rounded-md bg-foreground text-background">
                <span className="font-serif text-base leading-none">K</span>
              </div>
              <span className="text-[15px] font-semibold tracking-tight">Klyptic</span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              An intelligent clipboard for everything you learn.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-x-14 gap-y-2 text-sm text-muted-foreground sm:grid-cols-3">
            <a href="#features" className="hover:text-foreground">Features</a>
            <a href="#how" className="hover:text-foreground">How it works</a>
            <a href="#faq" className="hover:text-foreground">FAQ</a>
            <Link to="/login" className="hover:text-foreground">Sign in</Link>
            <Link to="/signup" className="hover:text-foreground">Sign up</Link>
            <Link to="/login" className="hover:text-foreground">Demo</Link>
          </div>
        </div>
        <div className="mt-10 flex items-center justify-between border-t border-border pt-6 text-xs text-muted-foreground">
          <p>© 2026 Klyptic Labs</p>
          <p>Made for people who read too much.</p>
        </div>
      </div>
    </footer>
  );
}
