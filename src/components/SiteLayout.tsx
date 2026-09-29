import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { CrisisBanner } from "@/components/CrisisBanner";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";

export function SiteLayout({ children }: { children: ReactNode }) {
  const { session, profile, isAdmin } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen bg-background">
      <CrisisBanner />
      <header className="border-b border-border/70">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-5 py-5">
          <Link to="/" className="font-serif text-xl tracking-tight text-foreground">
            Unsaid
          </Link>
          <nav className="flex items-center gap-2 text-sm">
            <Link
              to="/rules"
              className="hidden text-muted-foreground transition-colors hover:text-foreground sm:inline"
            >
              Rules
            </Link>
            {session ? (
              <>
                <Link to="/new">
                  <Button size="sm">Share</Button>
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Admin
                  </Link>
                )}
                <span className="hidden text-xs text-muted-foreground sm:inline">
                  {profile?.pseudonym}
                </span>
                <Button variant="ghost" size="sm" onClick={signOut}>
                  Sign out
                </Button>
              </>
            ) : (
              <Link to="/auth">
                <Button size="sm">Sign in</Button>
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="animate-soft-fade mx-auto max-w-3xl px-5 py-10">{children}</main>

      <footer className="mt-16 border-t border-border/70">
        <div className="mx-auto flex max-w-3xl flex-wrap gap-x-5 gap-y-2 px-5 py-8 text-xs text-muted-foreground">
          <span>Unsaid — say it, set it down, move on.</span>
          <Link to="/rules" className="hover:text-foreground">
            Rules
          </Link>
          <Link to="/privacy" className="hover:text-foreground">
            Privacy
          </Link>
          <Link to="/terms" className="hover:text-foreground">
            Terms
          </Link>
          <Link to="/resources" className="hover:text-foreground">
            Help resources
          </Link>
        </div>
      </footer>
    </div>
  );
}
