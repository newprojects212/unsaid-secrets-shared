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
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adult, setAdult] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
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
        options: { emailRedirectTo: window.location.origin },
      });
      setBusy(false);
      if (error) {
        toast(error.message);
        return;
      }
      if (!data.session) {
        toast("Check your email to confirm your account.");
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
          {mode === "signin" ? "Welcome back" : "Come in quietly"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">Say it. Set it down. Move on.</p>

        <div className="quiet-card animate-rise mt-8 p-6">
          <form onSubmit={submit} className="space-y-4">
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
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

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

            <Button type="submit" className="w-full" disabled={busy}>
              {mode === "signin" ? "Sign in" : "Create account"}
            </Button>
          </form>

          <div className="my-5 flex items-center gap-3 text-[11px] text-muted-foreground">
            <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
          </div>

          <Button variant="secondary" className="w-full" onClick={google}>
            Continue with Google
          </Button>

          <button
            type="button"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="mt-5 w-full text-center text-xs text-muted-foreground hover:text-foreground"
          >
            {mode === "signin"
              ? "New here? Create an account"
              : "Already have an account? Sign in"}
          </button>
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
