import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset password — Unsaid" },
      { name: "description", content: "Choose a new password for your Unsaid account." },
      { property: "og:title", content: "Reset password — Unsaid" },
      { property: "og:description", content: "Choose a new password for your Unsaid account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const [checking, setChecking] = useState(true);
  const [validRecovery, setValidRecovery] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    let active = true;
    async function verifyRecoveryLink() {
      const params = new URLSearchParams(window.location.hash.slice(1));
      if (params.get("type") !== "recovery") {
        if (active) setChecking(false);
        return;
      }
      const { data, error } = await supabase.auth.getUser();
      if (active) {
        setValidRecovery(!error && Boolean(data.user));
        setChecking(false);
      }
    }
    void verifyRecoveryLink();
    return () => {
      active = false;
    };
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password !== confirmPassword) {
      toast("Those passwords don't match.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) {
      toast(error.message);
      return;
    }
    setComplete(true);
  }

  return (
    <main className="min-h-screen bg-background px-5 py-14">
      <div className="mx-auto max-w-md">
        <Link to="/" className="font-serif text-xl">Unsaid</Link>
        <h1 className="mt-8 font-serif text-3xl">Choose a new password</h1>
        <p className="mt-2 text-sm text-muted-foreground">Set a new password for your account.</p>

        <section className="quiet-card mt-8 p-6">
          {checking ? (
            <p role="status" className="text-sm text-muted-foreground">Checking your recovery link…</p>
          ) : complete ? (
            <div className="space-y-4">
              <p role="status" className="text-sm text-muted-foreground">Your password has been changed.</p>
              <Link to="/auth"><Button className="w-full">Return to sign in</Button></Link>
            </div>
          ) : !validRecovery ? (
            <div className="space-y-4">
              <p role="alert" className="text-sm text-muted-foreground">
                This password-reset link is invalid or expired. Request a fresh link from the sign-in page.
              </p>
              <Link to="/auth"><Button className="w-full">Back to sign in</Button></Link>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="new-password">New password</Label>
                <Input
                  id="new-password"
                  type="password"
                  autoComplete="new-password"
                  minLength={6}
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirm-password">Confirm new password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  minLength={6}
                  required
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                />
              </div>
              <Button type="submit" className="w-full" disabled={busy}>
                {busy ? "Saving…" : "Save new password"}
              </Button>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}