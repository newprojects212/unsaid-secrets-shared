import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/useAuth";
import { CrisisBanner } from "@/components/CrisisBanner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

const UNSAID_OFFICIAL_ORIGIN = "https://unsaid-secrets-shared.lovable.app";

function isCloudflareHosted(hostname: string) {
  return hostname.endsWith(".pages.dev") || hostname.endsWith(".workers.dev");
}

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Unsaid" },
      {
        name: "description",
        content: "Sign in to Unsaid to share anonymously and reply with care.",
      },
      { property: "og:title", content: "Sign in — Unsaid" },
      { property: "og:description", content: "Sign in to Unsaid to share anonymously." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup" | "reset">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adult, setAdult] = useState(false);
  const [busy, setBusy] = useState(false);
  const [cloudflareHosted, setCloudflareHosted] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  useEffect(() => {
    const cloudflare = isCloudflareHosted(window.location.hostname);
    setCloudflareHosted(cloudflare);
    if (new URLSearchParams(window.location.search).get("mode") === "signup") {
      setMode("signup");
    }
    if (session) navigate({ to: "/", replace: true });
  }, [session, navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    if (mode === "signup") {
      if (!adult) {
        setBusy(false);
        toast("Please confirm you are 18 or older.");
        return;
      }
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: isCloudflareHosted(window.location.hostname)
            ? UNSAID_OFFICIAL_ORIGIN
            : window.location.origin,
        },
      });
      setBusy(false);
      if (error) {
        toast(error.message);
        return;
      }
      if (!data.session) {
        toast(
          cloudflareHosted
            ? "Check your email to confirm your account, then return here and sign in."
            : "Check your email to confirm your account.",
        );
        return;
      }
      navigate({ to: "/", replace: true });
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setBusy(false);
      if (error) {
        toast(error.message);
        return;
      }
      navigate({ to: "/", replace: true });
    }
  }

  async function google() {
    if (mode === "signup" && !adult) {
      toast("Please confirm you are 18 or older.");
      return;
    }
    if (isCloudflareHosted(window.location.hostname)) {
      const modeQuery = mode === "signup" ? "?mode=signup" : "";
      window.location.assign(`${UNSAID_OFFICIAL_ORIGIN}/auth${modeQuery}`);
      return;
    }
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast("Google sign-in didn't work. Try again.");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/", replace: true });
  }

  return (
    <div className="min-h-screen bg-background">
      <CrisisBanner />
      <div className="mx-auto max-w-md px-5 py-14">
        <Link to="/" className="font-serif text-xl">
          Unsaid
        </Link>
        <h1 className="animate-rise mt-8 font-serif text-3xl">
          {mode === "signin" ? "Welcome back" : mode === "signup" ? "Come in quietly" : "Reset your password"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {mode === "reset" ? "We’ll email you a secure password-reset link." : "Say it. Set it down. Move on."}
        </p>

        <div className="quiet-card animate-rise mt-8 p-6">
          <form
            onSubmit={(event) => {
              if (mode === "reset") {
                event.preventDefault();
                setBusy(true);
                setResetSent(false);
                void supabase.auth.resetPasswordForEmail(email, {
                  redirectTo: `${cloudflareHosted ? UNSAID_OFFICIAL_ORIGIN : window.location.origin}/reset-password`,
                }).then(({ error }) => {
                  setBusy(false);
                  if (error) {
                    toast(error.message);
                    return;
                  }
                  setResetSent(true);
                });
                return;
              }
              void submit(event);
            }}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            {mode !== "reset" && <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>}

            {mode === "signup" && (
              <>
                <div className="flex items-start gap-2.5">
                  <Checkbox
                    id="adult"
                    checked={adult}
                    onCheckedChange={(v) => setAdult(v === true)}
                  />
                  <Label htmlFor="adult" className="text-sm leading-relaxed font-normal">
                    I am 18 or older.
                  </Label>
                </div>
                <p className="rounded-lg border border-border bg-surface-2 p-3 text-xs leading-relaxed text-muted-foreground">
                  You're anonymous to other users. The site admin can see your account email for
                  safety and abuse handling.
                  {' '}Messages are not end-to-end encrypted. The site admin can review conversations for safety and abuse handling.
                </p>
              </>
            )}

            {mode === "signin" && (
              <Button
                type="button"
                variant="link"
                className="h-auto p-0 text-xs text-muted-foreground"
                onClick={() => {
                  setResetSent(false);
                  setMode("reset");
                }}
              >
                Forgot password?
              </Button>
            )}
            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? "Please wait…" : mode === "signin" ? "Sign in" : mode === "signup" ? "Create account" : "Send reset link"}
            </Button>
            {mode === "reset" && resetSent && (
              <p role="status" className="text-sm leading-relaxed text-muted-foreground">
                If an account uses this email, a reset link is on its way. Check your inbox and spam folder.
              </p>
            )}
          </form>

          {mode !== "reset" && <div className="my-5 flex items-center gap-3 text-[11px] text-muted-foreground">
            <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
          </div>}

          {mode !== "reset" && cloudflareHosted && (
            <p className="mb-3 text-xs leading-relaxed text-muted-foreground">
              Google sign-in opens Unsaid’s official site. Cloudflare Pages can use the same
              account and posts with email and password, but Google sessions do not transfer
              between the two sites.
            </p>
          )}
          {mode !== "reset" && (
            <Button variant="secondary" className="w-full" onClick={google}>
              {cloudflareHosted ? "Continue with Google on Unsaid" : "Continue with Google"}
            </Button>
          )}

          <Button
            type="button"
            variant="link"
            className="mt-5 h-auto w-full p-0 text-center text-xs text-muted-foreground"
            onClick={() => {
              setResetSent(false);
              setMode(mode === "reset" || mode === "signup" ? "signin" : "signup");
            }}
          >
            {mode === "signin" ? "New here? Create an account" : "Already have an account? Sign in"}
          </Button>
        </div>

        <p className="mt-6 text-[11px] leading-relaxed text-muted-foreground">
          By continuing you agree to the{" "}
          <Link to="/terms" className="underline">
            Terms
          </Link>{" "}
          and{" "}
          <Link to="/privacy" className="underline">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
