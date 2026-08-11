export type { CaptureType, KnowledgeItem } from "@/lib/api/types";
import type { KnowledgeItem } from "@/lib/api/types";

export const knowledgeItems: KnowledgeItem[] = [
  {
    id: "rsc-server-components",
    title: "Understanding React Server Components in depth",
    source: "overreacted.io",
    date: "2 hours ago",
    topic: "React",
    type: "article",
    preview:
      "RSC lets you render components on the server and stream them to the client without shipping their JS. The mental model shifts from a component tree to a request-scoped tree...",
    summary:
      "React Server Components decouple rendering from hydration. Server components run once per request, can access data sources directly, and only stream serialized output to the client. Client components handle interactivity.",
    takeaways: [
      "Server components never re-render on the client",
      "Props between server and client must be serializable",
      "Streaming is the primary loading UX primitive",
      "Suspense boundaries define waterfall regions",
    ],
    related: ["next-app-router", "streaming-ssr", "suspense-patterns"],
    url: "https://overreacted.io",
  },
  {
    id: "postgres-indexes",
    title: "When to use B-tree vs GIN vs BRIN indexes",
    source: "PostgreSQL Docs",
    date: "5 hours ago",
    topic: "Databases",
    type: "pdf",
    preview:
      "B-tree indexes are the default for equality and range queries. GIN indexes are optimized for composite values like JSONB and full-text search...",
    summary:
      "Choose an index type based on query patterns and data cardinality. B-tree suits selective equality and ordered scans. GIN handles containment on JSONB and tsvector. BRIN excels on massive naturally-ordered tables.",
    takeaways: [
      "B-tree: equality, range, ORDER BY",
      "GIN: containment on JSONB, full-text",
      "BRIN: append-only time-series tables",
      "Partial indexes cut write amplification",
    ],
    related: ["query-planner", "vacuum-tuning", "explain-analyze"],
  },
  {
    id: "attention-is-all-you-need",
    title: "Attention Is All You Need — annotated walkthrough",
    source: "YouTube · Yannic Kilcher",
    date: "Yesterday",
    topic: "Machine Learning",
    type: "video",
    preview:
      "A section-by-section reading of the Transformer paper with intuition on why self-attention replaced recurrence...",
    summary:
      "The Transformer replaces recurrent layers with multi-head self-attention plus positional encodings. Each token attends to every other token in parallel, enabling much longer effective context and better GPU utilization than RNNs.",
    takeaways: [
      "Self-attention is O(n²) but parallelizable",
      "Positional encodings inject sequence order",
      "Multi-head lets the model attend to different subspaces",
      "Residuals + LayerNorm stabilize training",
    ],
    related: ["gpt-architecture", "flash-attention", "rope-embeddings"],
  },
  {
    id: "linear-method",
    title: "The Linear Method — how a small team ships fast",
    source: "linear.app/method",
    date: "Yesterday",
    topic: "Product",
    type: "article",
    preview:
      "Linear's operating principles: opinionated defaults, no meetings by default, cycles over sprints, quality is not negotiable...",
    summary:
      "Linear runs on tightly scoped weekly cycles, minimal meetings, and craftsmanship as a first-class value. Roadmaps are directional; individual autonomy is high.",
    takeaways: [
      "Cycles > sprints",
      "Write, don't meet",
      "Quality is a feature",
      "Small teams outperform big ones",
    ],
    related: ["shape-up", "async-communication", "product-craft"],
  },
  {
    id: "tailscale-wireguard",
    title: "How Tailscale works — a WireGuard mesh with identity",
    source: "tailscale.com/blog",
    date: "2 days ago",
    topic: "Networking",
    type: "article",
    preview:
      "Tailscale layers OAuth identity, key distribution, and NAT traversal on top of the WireGuard protocol...",
    summary:
      "Tailscale builds a private mesh VPN where each node authenticates via SSO, exchanges WireGuard public keys through a coordination server, and uses DERP relays as a fallback when direct connections fail.",
    takeaways: [
      "Control plane distributes keys, not traffic",
      "DERP relays only fire on NAT failure",
      "ACLs live as a single JSON file",
      "Magic DNS makes hostnames trivial",
    ],
    related: ["wireguard-internals", "nat-traversal", "zero-trust"],
  },
  {
    id: "cursor-shortcuts",
    title: "Cursor keybindings I actually use",
    source: "Screenshot",
    date: "2 days ago",
    topic: "Tooling",
    type: "screenshot",
    preview:
      "Cmd+K inline edits, Cmd+L chat, Cmd+I composer, Cmd+Shift+L applies suggestion. Cmd+/ toggles suggestions...",
    summary: "A curated set of Cursor keybindings that meaningfully changed my day-to-day editing.",
    takeaways: [
      "Cmd+K for surgical edits",
      "Cmd+L for questions with file context",
      "Cmd+I for multi-file agent tasks",
      "Escape early and often",
    ],
    related: ["vscode-shortcuts", "vim-motions"],
  },
  {
    id: "rate-limiter-snippet",
    title: "Sliding-window rate limiter in TypeScript",
    source: "gist · self",
    date: "3 days ago",
    topic: "Backend",
    type: "code",
    preview:
      "class SlidingWindowLimiter { private hits = new Map<string, number[]>(); check(key: string, limit: number, windowMs: number) { ... } }",
    summary:
      "A minimal in-memory sliding-window rate limiter. Not for production, but a clean reference for the algorithm.",
    takeaways: [
      "Store timestamps per key",
      "Trim timestamps older than the window",
      "Compare length vs limit",
      "Use Redis ZSET in production",
    ],
    related: ["token-bucket", "leaky-bucket", "redis-scripting"],
  },
  {
    id: "gpt-conversation-embeddings",
    title: "Chat with GPT about embedding models for RAG",
    source: "ChatGPT",
    date: "3 days ago",
    topic: "AI Engineering",
    type: "chat",
    preview:
      "Q: What embedding model should I use for a mixed code + docs corpus? A: For mixed corpora, start with text-embedding-3-large or Voyage-2...",
    summary:
      "Discussion covered dimensionality trade-offs, MRL truncation, and reranking with cross-encoders.",
    takeaways: [
      "Start with text-embedding-3-large",
      "MRL lets you truncate dimensions without retraining",
      "Rerank top-50 with a cross-encoder",
      "Chunk on semantic boundaries, not character counts",
    ],
    related: ["rag-patterns", "vector-databases", "hybrid-search"],
  },
  {
    id: "vercel-edge-runtime",
    title: "vercel/edge-runtime — reading the source",
    source: "GitHub",
    date: "4 days ago",
    topic: "Runtime",
    type: "repo",
    preview:
      "Understanding how Vercel's edge runtime polyfills Web APIs on top of V8 isolates without Node built-ins...",
    summary:
      "The edge runtime provides a Web-standard API surface (fetch, Request, Response, crypto) with strict isolate-based sandboxing. No filesystem, no child_process.",
    takeaways: [
      "V8 isolates cold-start in single-digit ms",
      "No Node built-ins — Web APIs only",
      "Streaming responses are the primary output",
      "Small bundle sizes are non-negotiable",
    ],
    related: ["cloudflare-workers", "deno-deploy", "v8-isolates"],
  },
  {
    id: "distributed-systems-note",
    title: "Notes on quorum and split brain",
    source: "Personal note",
    date: "5 days ago",
    topic: "Distributed Systems",
    type: "note",
    preview:
      "A quorum requires a strict majority. With N=3 nodes, quorum=2. Split brain happens when a partition allows two subsets to each believe they hold the majority...",
    summary:
      "Quorum-based consensus (Raft, Paxos) prevents split brain by requiring writes to reach a majority. Even-numbered clusters offer no benefit over N-1 sized odd clusters.",
    takeaways: [
      "Odd cluster sizes only",
      "Fencing tokens prevent stale leader writes",
      "Read quorums trade latency for freshness",
      "Leases require synchronized clocks",
    ],
    related: ["raft-paper", "paxos-made-simple", "cap-theorem"],
  },
  {
    id: "css-container-queries",
    title: "Container queries in production",
    source: "web.dev",
    date: "6 days ago",
    topic: "CSS",
    type: "article",
    preview:
      "Container queries let a component respond to its container size rather than the viewport. Combined with :has(), most breakpoint hacks disappear...",
    summary:
      "Container queries decouple responsive design from viewport. Combined with subgrid and :has(), components become truly self-contained.",
    takeaways: [
      "@container replaces most @media",
      "Name containers for clarity",
      ":has() is the missing selector",
      "Subgrid aligns nested components",
    ],
    related: ["subgrid", "has-selector", "responsive-components"],
  },
  {
    id: "prompt-caching",
    title: "Anthropic prompt caching — cost model",
    source: "docs.anthropic.com",
    date: "1 week ago",
    topic: "AI Engineering",
    type: "pdf",
    preview:
      "Prompt caching stores prefixes for 5 minutes. Cache writes cost 25% more; cache reads cost 10% of base input tokens...",
    summary:
      "Prompt caching drastically cuts costs for long-context repeat calls. Structure prompts with stable prefixes and volatile suffixes.",
    takeaways: [
      "Cache writes: +25% input cost",
      "Cache reads: -90% input cost",
      "5 minute TTL, refreshed on hit",
      "Stable prefix, volatile suffix",
    ],
    related: ["context-windows", "rag-cost-model", "batching"],
  },
];

export const topics = [
  { name: "React", count: 24, color: "oklch(0.62 0.16 42)" },
  { name: "AI Engineering", count: 19, color: "oklch(0.55 0.09 200)" },
  { name: "Distributed Systems", count: 14, color: "oklch(0.65 0.08 145)" },
  { name: "Databases", count: 12, color: "oklch(0.7 0.12 85)" },
  { name: "CSS", count: 11, color: "oklch(0.5 0.1 300)" },
  { name: "Product", count: 9, color: "oklch(0.62 0.16 42)" },
  { name: "Networking", count: 8, color: "oklch(0.55 0.09 200)" },
  { name: "Backend", count: 7, color: "oklch(0.65 0.08 145)" },
  { name: "Tooling", count: 6, color: "oklch(0.7 0.12 85)" },
  { name: "Machine Learning", count: 5, color: "oklch(0.5 0.1 300)" },
];

export const stats = {
  total: 248,
  documents: 74,
  videos: 31,
  articles: 96,
  screenshots: 47,
};

export const trendingTopics = [
  "React Server Components",
  "Prompt caching",
  "Container queries",
  "Postgres pgvector",
  "Cursor workflows",
];

export const weeklyInsights = [
  { label: "Items captured", value: "23", delta: "+42%" },
  { label: "Topics explored", value: "7", delta: "+2" },
  { label: "Reading time saved", value: "5.4h", delta: "+18%" },
  { label: "Connections found", value: "31", delta: "+9" },
];

export const suggestedQuestions = [
  "Summarize everything I saved this week about RAG",
  "What did I learn about React Server Components?",
  "Show me the trade-offs between B-tree and GIN indexes",
  "Compare Tailscale and traditional VPNs from my notes",
];
