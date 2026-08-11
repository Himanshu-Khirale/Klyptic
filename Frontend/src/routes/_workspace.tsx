import { createFileRoute, Link, Outlet, redirect, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Inbox,
  Search,
  Sparkles,
  MessagesSquare,
  Compass,
  Settings,
  Plus,
  Command,
  Bell,
  LogOut,
} from "lucide-react";
import { QuickCaptureModal } from "@/components/quick-capture-modal";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { getToken } from "@/lib/api/client";
import { topicsApi } from "@/lib/api";

export const Route = createFileRoute("/_workspace")({
  beforeLoad: () => {
    if (typeof window !== "undefined" && !getToken()) {
      throw redirect({ to: "/login" });
    }
  },
  component: WorkspaceLayout,
});

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/inbox", label: "Inbox", icon: Inbox },
  { to: "/search", label: "Search", icon: Search },
  { to: "/topics", label: "Topics", icon: Compass },
  { to: "/insights", label: "Insights", icon: Sparkles },
  { to: "/chat", label: "Ask Klyptic", icon: MessagesSquare },
] as const;

function WorkspaceLayout() {
  const [captureOpen, setCaptureOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user, ready, isAuthenticated, logout } = useAuth();
  const navigate = Route.useNavigate();

  useEffect(() => {
    if (ready && !isAuthenticated) {
      void navigate({ to: "/login" });
    }
  }, [ready, isAuthenticated, navigate]);

  const { data: topicsData } = useQuery({
    queryKey: ["topics"],
    queryFn: () => topicsApi.list(),
    enabled: isAuthenticated,
  });

  const sidebarTopics = (topicsData?.topics ?? []).slice(0, 5);

  if (!ready || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        Loading workspace…
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-sidebar px-3 py-5 md:flex">
        <Link to="/" className="mb-6 flex items-center gap-2 px-2">
          <div className="grid h-7 w-7 place-items-center rounded-md bg-foreground text-background">
            <span className="font-serif text-base leading-none">K</span>
          </div>
          <span className="text-[15px] font-semibold tracking-tight">Klyptic</span>
        </Link>

        <button
          onClick={() => setCaptureOpen(true)}
          className="mb-4 flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2 text-left text-sm font-medium shadow-sm transition-colors hover:bg-muted"
        >
          <span className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Quick capture
          </span>
          <span className="flex items-center gap-0.5 text-[11px] text-muted-foreground">
            <Command className="h-3 w-3" />K
          </span>
        </button>

        <nav className="flex flex-col gap-0.5">
          {nav.map((item) => {
            const active = pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-6 px-2.5">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Topics
          </p>
          <div className="mt-2 flex flex-col gap-0.5">
            {sidebarTopics.length === 0 ? (
              <p className="px-1 py-1 text-[12px] text-muted-foreground">No topics yet</p>
            ) : (
              sidebarTopics.map((t) => (
                <Link
                  key={t.name}
                  to="/topics"
                  className="truncate rounded-md px-1 py-1 text-[13px] text-sidebar-foreground/70 hover:text-sidebar-foreground"
                >
                  <span className="mr-1.5 text-muted-foreground">#</span>
                  {t.name}
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="mt-auto flex items-center gap-2 rounded-lg px-2 py-2">
          <div className="grid h-8 w-8 place-items-center rounded-full bg-muted text-sm font-medium">
            {user?.initials || "?"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{user?.name}</p>
            <p className="truncate text-xs capitalize text-muted-foreground">{user?.plan} plan</p>
          </div>
          <Link to="/settings" className="rounded-md p-1.5 hover:bg-muted">
            <Settings className="h-4 w-4 text-muted-foreground" />
          </Link>
          <button
            type="button"
            title="Sign out"
            onClick={async () => {
              await logout();
              await navigate({ to: "/login" });
            }}
            className="rounded-md p-1.5 hover:bg-muted"
          >
            <LogOut className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur md:px-8">
          <button
            onClick={() => setCaptureOpen(true)}
            className="group flex flex-1 items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted md:max-w-md"
          >
            <Search className="h-4 w-4" />
            <span>Search or capture anything…</span>
            <span className="ml-auto hidden items-center gap-0.5 rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] md:flex">
              <Command className="h-2.5 w-2.5" />K
            </span>
          </button>

          <button
            onClick={() => setCaptureOpen(true)}
            className="hidden items-center gap-1.5 rounded-lg bg-foreground px-3 py-1.5 text-sm font-medium text-background transition-opacity hover:opacity-90 sm:flex"
          >
            <Plus className="h-4 w-4" /> Capture
          </button>

          <button className="rounded-md p-2 text-muted-foreground hover:bg-muted">
            <Bell className="h-4 w-4" />
          </button>

          <div className="grid h-8 w-8 place-items-center rounded-full bg-muted text-sm font-medium md:hidden">
            {user?.initials || "?"}
          </div>
        </header>

        <main className="flex-1">
          <Outlet />
        </main>
      </div>

      <QuickCaptureModal open={captureOpen} onOpenChange={setCaptureOpen} />
    </div>
  );
}
