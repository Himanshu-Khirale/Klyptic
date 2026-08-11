import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Send, Sparkles, Info, Loader2 } from "lucide-react";
import { useState } from "react";
import { chatApi } from "@/lib/api";
import type { KnowledgeItem } from "@/lib/api/types";
import { ApiError } from "@/lib/api/client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export const Route = createFileRoute("/_workspace/chat")({
  component: ChatPage,
});

interface Msg {
  role: "user" | "assistant";
  content: string;
  refs?: string[];
  referencedItems?: KnowledgeItem[];
}

function ChatPage() {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: suggestionsData } = useQuery({
    queryKey: ["chat-suggestions"],
    queryFn: () => chatApi.suggestions(),
  });

  const suggestions = suggestionsData?.suggestions ?? [];
  const sidebarItems =
    [...msgs]
      .reverse()
      .flatMap((m) => m.referencedItems ?? [])
      .filter((item, index, arr) => arr.findIndex((x) => x.id === item.id) === index)
      .slice(0, 4);

  const send = async (text?: string) => {
    const t = (text ?? draft).trim();
    if (!t || sending) return;
    setError(null);
    setSending(true);
    setDraft("");
    const history = msgs.map(({ role, content }) => ({ role, content }));
    setMsgs((m) => [...m, { role: "user", content: t }]);

    try {
      const res = await chatApi.ask(t, history);
      setMsgs((m) => [
        ...m,
        {
          role: "assistant",
          content: res.answer,
          refs: res.refs,
          referencedItems: res.referencedItems,
        },
      ]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Chat request failed");
      setMsgs((m) => m.slice(0, -1));
      setDraft(t);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mx-auto grid h-[calc(100vh-3.5rem)] max-w-6xl grid-cols-1 lg:grid-cols-[1fr_280px]">
      <div className="flex min-h-0 flex-col border-r border-border">
        <div className="border-b border-border px-6 py-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-muted-foreground" />
            <h1 className="text-[15px] font-semibold">Ask Klyptic</h1>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Answers cite only what you've saved. One feature among many.
          </p>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-8">
          {msgs.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Ask a question about anything you've captured.
            </p>
          )}
          {msgs.map((m, i) => (
            <div key={i} className={m.role === "user" ? "flex justify-end" : "flex"}>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-[14px] leading-relaxed ${
                  m.role === "user"
                    ? "bg-foreground text-background"
                    : "border border-border bg-card"
                }`}
              >
                {m.role === "assistant" ? (
                  <div className="text-sm">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-2 space-y-1" {...props} />,
                        ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-2 space-y-1" {...props} />,
                        li: ({node, ...props}) => <li {...props} />,
                        strong: ({node, ...props}) => <strong className="font-semibold" {...props} />,
                        a: ({node, ...props}) => <a className="text-primary hover:underline" {...props} />,
                        h1: ({node, ...props}) => <h1 className="text-lg font-bold mb-2 mt-4" {...props} />,
                        h2: ({node, ...props}) => <h2 className="text-base font-bold mb-2 mt-3" {...props} />,
                        h3: ({node, ...props}) => <h3 className="text-sm font-bold mb-1 mt-2" {...props} />,
                      }}
                    >
                      {m.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  m.content
                )}
                {m.refs && m.refs.length > 0 && (
                  <div className="mt-3 border-t border-border/60 pt-2 text-[11px] text-muted-foreground">
                    Referenced:
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {(m.referencedItems ?? []).map((k) => (
                        <Link
                          key={k.id}
                          to="/knowledge/$id"
                          params={{ id: k.id }}
                          className="rounded border border-border bg-background px-1.5 py-0.5 text-foreground hover:bg-muted"
                        >
                          {k.title.length > 40 ? `${k.title.slice(0, 40)}…` : k.title}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-border p-4">
          {error && <p className="mb-2 text-sm text-destructive">{error}</p>}
          <div className="mb-2 flex flex-wrap gap-1.5">
            {suggestions.slice(0, 3).map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => void send(q)}
                className="rounded-full border border-border bg-card px-2.5 py-1 text-[12px] text-muted-foreground hover:text-foreground"
              >
                {q}
              </button>
            ))}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void send();
            }}
            className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2"
          >
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Ask something you learned…"
              className="flex-1 bg-transparent text-sm outline-none"
            />
            <button
              type="submit"
              disabled={sending}
              className="rounded-lg bg-foreground p-1.5 text-background hover:opacity-90 disabled:opacity-60"
            >
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </form>
        </div>
      </div>

      <aside className="hidden overflow-y-auto p-6 lg:block">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Referenced knowledge
        </p>
        <ul className="mt-3 space-y-3">
          {sidebarItems.length === 0 ? (
            <li className="text-sm text-muted-foreground">Citations appear here after you ask.</li>
          ) : (
            sidebarItems.map((k) => (
              <li key={k.id}>
                <Link
                  to="/knowledge/$id"
                  params={{ id: k.id }}
                  className="block rounded-lg border border-border bg-card p-3 hover:bg-muted/50"
                >
                  <p className="line-clamp-2 text-[13px] font-medium leading-snug">{k.title}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    #{k.topic} · {k.date}
                  </p>
                </Link>
              </li>
            ))
          )}
        </ul>

        <div className="mt-6 rounded-lg border border-border bg-card p-4 text-[12px] leading-relaxed text-muted-foreground">
          <div className="mb-1.5 flex items-center gap-1.5 text-foreground">
            <Info className="h-3 w-3" />
            <span className="font-medium">About Klyptic chat</span>
          </div>
          The chat is one feature among many. Klyptic is designed for capturing and finding — use
          this only when a conversation is faster than a search.
        </div>
      </aside>
    </div>
  );
}
