import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { CrisisBanner } from "@/components/CrisisBanner";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { Home, LayoutGrid, PenLine, MessageCircle, UserRound, Shield, Search } from "lucide-react";

export function SiteLayout({ children }: { children: ReactNode }) {
  const { session, profile, isAdmin } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: unread = 0 } = useQuery({ queryKey: ["unread", session?.user.id], enabled: !!session, queryFn: async () => { const { data } = await supabase.rpc("list_my_conversations"); return ((data ?? []) as unknown as {unread:number}[]).reduce((n,c)=>n+Number(c.unread||0),0); }, refetchInterval: 30000 });
  const links = [{to:"/" as const,label:"Home",icon:Home},{to:"/" as const,label:"Communities",icon:LayoutGrid},{to:"/new" as const,label:"New post",icon:PenLine},{to:"/messages" as const,label:"Messages",icon:MessageCircle},{to:"/profile" as const,label:"My Space",icon:UserRound}];

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen">
      <CrisisBanner />
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
          <Link to="/" className="font-serif text-xl tracking-tight text-foreground">
            Unsaid
          </Link>
          <nav className="flex items-center gap-2 text-sm">
            <Link to="/people" aria-label="Search people"><Button variant="ghost" size="icon" title="Search people"><Search className="size-4"/></Button></Link>
             <div className="hidden items-center gap-1 md:flex">{links.map(l=><Link key={l.label} to={l.to} {...(l.label==='Communities'?{hash:'rooms'}:{})} className="relative flex items-center gap-1.5 rounded px-2 py-2 text-xs text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"><l.icon className="size-4"/>{l.label}{l.label==='Messages'&&unread>0&&<span className="rounded-full bg-primary px-1.5 text-[10px] text-primary-foreground">{unread}</span>}</Link>)}</div>
            <Link
              to="/rules"
              className="hidden text-muted-foreground transition-colors hover:text-foreground sm:inline"
            >
              Rules
            </Link>
            {session ? (
              <>
                <Link to="/new" className="md:hidden">
                  <Button size="sm">Share</Button>
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="text-muted-foreground transition-colors hover:text-foreground"
                    >
                    <Shield className="inline size-4"/> Admin
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

       <main className="animate-soft-fade relative z-10 mx-auto max-w-5xl px-5 py-10 pb-24 md:pb-10">{children}</main>
       <nav className="fixed inset-x-0 bottom-0 z-50 flex justify-around border-t border-border bg-background/90 px-1 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden" aria-label="Main navigation">{links.map(l=><Link key={l.label} to={l.to} {...(l.label==='Communities'?{hash:'rooms'}:{})} className="relative flex min-w-0 flex-1 flex-col items-center gap-1 py-2 text-[10px] text-muted-foreground hover:text-primary"><l.icon className="size-5"/><span>{l.label}</span>{l.label==='Messages'&&unread>0&&<span className="absolute right-2 top-1 size-2 rounded-full bg-primary"/>}</Link>)}</nav>

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
