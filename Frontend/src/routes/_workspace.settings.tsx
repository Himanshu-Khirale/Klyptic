import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  User,
  Palette,
  KeyRound,
  Bell,
  Download,
  Shield,
  CreditCard,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { userApi } from "@/lib/api";
import { ApiError } from "@/lib/api/client";

export const Route = createFileRoute("/_workspace/settings")({
  component: SettingsPage,
});

const sections = [
  { id: "profile", label: "Profile", icon: User },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "account", label: "Account", icon: CreditCard },
  { id: "api", label: "API", icon: KeyRound },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "data", label: "Data export", icon: Download },
  { id: "privacy", label: "Privacy", icon: Shield },
] as const;

function SettingsPage() {
  const { user, refreshUser, logout, setUser } = useAuth();
  const navigate = useNavigate();
  const [section, setSection] = useState<(typeof sections)[number]["id"]>("profile");
  const [name, setName] = useState(user?.name ?? "");
  const [handle, setHandle] = useState(user?.handle ?? "");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(user?.name ?? "");
    setHandle(user?.handle ?? "");
  }, [user]);

  async function saveProfile() {
    setSaving(true);
    setError(null);
    setStatus(null);
    try {
      const updated = await userApi.updateProfile({
        name: name.trim(),
        handle: handle.trim() || undefined,
      });
      setUser(updated);
      setStatus("Profile saved");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save profile");
    } finally {
      setSaving(false);
    }
  }

  async function patchPrefs(body: Parameters<typeof userApi.updatePreferences>[0]) {
    setError(null);
    try {
      const updated = await userApi.updatePreferences(body);
      setUser(updated);
      await refreshUser();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not update preferences");
    }
  }

  async function exportJson() {
    setError(null);
    try {
      const data = await userApi.exportJson();
      const blob = new Blob([JSON.stringify(data.content, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = data.filename || "klyptic-export.json";
      a.click();
      URL.revokeObjectURL(url);
      setStatus("Export downloaded");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Export failed");
    }
  }

  async function deleteWorkspace() {
    if (!window.confirm("Permanently delete your account and all captures?")) return;
    try {
      await userApi.deleteWorkspace();
      await logout();
      await navigate({ to: "/signup" });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Delete failed");
    }
  }

  const prefs = user?.preferences;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:px-8">
      <p className="text-xs uppercase tracking-widest text-muted-foreground">Settings</p>
      <h1 className="mt-2 font-serif text-4xl tracking-tight">Preferences</h1>
      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
      {status && <p className="mt-3 text-sm text-accent-green">{status}</p>}

      <div className="mt-8 grid gap-6 md:grid-cols-[220px_1fr]">
        <nav className="flex flex-row gap-1 overflow-x-auto md:flex-col">
          {sections.map((s) => {
            const Icon = s.icon;
            const active = section === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setSection(s.id)}
                className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors md:justify-between ${
                  active ? "bg-muted font-medium" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  {s.label}
                </span>
                {active && <ChevronRight className="hidden h-3.5 w-3.5 md:block" />}
              </button>
            );
          })}
        </nav>

        <div>
          {section === "profile" && (
            <Panel title="Profile" desc="How you appear across Klyptic.">
              <div className="flex items-center gap-4">
                <div className="grid h-16 w-16 place-items-center rounded-full bg-muted font-serif text-2xl">
                  {user?.initials || "?"}
                </div>
              </div>
              <Field label="Name" value={name} onChange={setName} />
              <Field label="Email" value={user?.email ?? ""} onChange={() => undefined} readOnly />
              <Field label="Handle" value={handle} onChange={setHandle} />
              <button
                type="button"
                disabled={saving}
                onClick={() => void saveProfile()}
                className="inline-flex items-center gap-1.5 rounded-lg bg-foreground px-3 py-1.5 text-sm font-medium text-background disabled:opacity-60"
              >
                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                Save profile
              </button>
            </Panel>
          )}

          {section === "appearance" && (
            <Panel title="Appearance" desc="Customize how Klyptic looks.">
              <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground">Theme</p>
                <div className="grid grid-cols-3 gap-2">
                  {(["light", "dark", "system"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => void patchPrefs({ appearance: { theme: t } })}
                      className={`rounded-lg border p-3 text-left text-sm capitalize ${
                        (prefs?.appearance?.theme ?? "dark") === t
                          ? "border-foreground"
                          : "border-border"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <ToggleRow
                label="Reduced motion"
                desc="Disable non-essential animations."
                on={Boolean(prefs?.appearance?.reducedMotion)}
                onChange={(v) => void patchPrefs({ appearance: { reducedMotion: v } })}
              />
              <ToggleRow
                label="Compact density"
                desc="Tighter spacing in the inbox."
                on={Boolean(prefs?.appearance?.compactDensity)}
                onChange={(v) => void patchPrefs({ appearance: { compactDensity: v } })}
              />
            </Panel>
          )}

          {section === "account" && (
            <Panel title="Account" desc="Your plan and billing.">
              <div className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium capitalize">{user?.plan || "free"} plan</p>
                    <p className="text-xs text-muted-foreground">Managed in-app for beta</p>
                  </div>
                </div>
              </div>
            </Panel>
          )}

          {section === "api" && (
            <Panel title="API settings" desc="Personal access tokens for integrations.">
              <Field
                label="Default model"
                value={prefs?.defaultModel ?? "klyptic-medium"}
                onChange={(v) => void patchPrefs({ defaultModel: v })}
              />
              <p className="text-xs text-muted-foreground">
                Personal API keys will ship with the public API later.
              </p>
            </Panel>
          )}

          {section === "notifications" && (
            <Panel title="Notifications" desc="Choose what Klyptic tells you about.">
              <ToggleRow
                label="Weekly summary email"
                desc="Sent every Monday morning."
                on={prefs?.notifications?.weeklySummaryEmail ?? true}
                onChange={(v) => void patchPrefs({ notifications: { weeklySummaryEmail: v } })}
              />
              <ToggleRow
                label="Revision reminders"
                desc="When items are worth revisiting."
                on={prefs?.notifications?.revisionReminders ?? true}
                onChange={(v) => void patchPrefs({ notifications: { revisionReminders: v } })}
              />
              <ToggleRow
                label="New connections"
                desc="When Klyptic finds a new link."
                on={prefs?.notifications?.newConnections ?? false}
                onChange={(v) => void patchPrefs({ notifications: { newConnections: v } })}
              />
            </Panel>
          )}

          {section === "data" && (
            <Panel title="Data export" desc="Take your knowledge with you, always.">
              <button
                type="button"
                onClick={() => void exportJson()}
                className="rounded-lg border border-border bg-card px-4 py-2 text-sm"
              >
                Export as JSON
              </button>
              <p className="text-xs text-muted-foreground">
                Exports include all captures, summaries, tags, and metadata.
              </p>
            </Panel>
          )}

          {section === "privacy" && (
            <Panel title="Privacy" desc="Control what Klyptic sees and stores.">
              <ToggleRow
                label="Use my captures to improve Klyptic"
                desc="Off by default. Your library is never used for training."
                on={prefs?.privacy?.improveProduct ?? false}
                onChange={(v) => void patchPrefs({ privacy: { improveProduct: v } })}
              />
              <ToggleRow
                label="Share anonymized usage"
                desc="Helps us fix bugs faster."
                on={prefs?.privacy?.shareAnonymousUsage ?? true}
                onChange={(v) => void patchPrefs({ privacy: { shareAnonymousUsage: v } })}
              />
              <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                <p className="text-sm font-medium">Delete workspace</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Permanently delete your account and all captures.
                </p>
                <button
                  type="button"
                  onClick={() => void deleteWorkspace()}
                  className="mt-3 rounded-lg border border-destructive/40 bg-background px-3 py-1.5 text-xs font-medium text-destructive"
                >
                  Delete workspace
                </button>
              </div>
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
}

function Panel({
  title,
  desc,
  children,
}: {
  title: string;
  desc: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-6">
      <h2 className="text-[15px] font-semibold">{title}</h2>
      <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
      <div className="mt-6 space-y-5">{children}</div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  readOnly,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  readOnly?: boolean;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <input
        value={value}
        readOnly={readOnly}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full max-w-md rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground/40 read-only:opacity-70"
      />
    </div>
  );
}

function ToggleRow({
  label,
  desc,
  on,
  onChange,
}: {
  label: string;
  desc: string;
  on: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-6 border-t border-border pt-4 first:border-t-0 first:pt-0">
      <div className="min-w-0">
        <p className="text-sm font-medium">{label}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>
      </div>
      <button
        type="button"
        onClick={() => onChange(!on)}
        className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${on ? "bg-foreground" : "bg-muted"}`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-background transition-transform ${on ? "translate-x-4" : "translate-x-0.5"}`}
        />
      </button>
    </div>
  );
}
