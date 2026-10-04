import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/SiteLayout";
import { PostCard, type PostRow } from "@/components/PostCard";
import { COMMUNITIES } from "@/lib/communities";
import { Button } from "@/components/ui/button";
import { lazy, Suspense, useEffect, useState } from "react";
import { tiltCard, resetCard } from '@/lib/card-motion';
const LanternScene=lazy(()=>import('@/components/LanternScene'));

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Unsaid — Say it. Set it down. Move on." },
      {
        name: "description",
        content:
          "A calm, anonymous place to share secrets, regrets and the past — and work on letting go.",
      },
      { property: "og:title", content: "Unsaid — Say it. Set it down. Move on." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      {
        property: "og:description",
        content: "A quiet anonymous community for secrets, regrets and letting go.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const [motion,setMotion]=useState(false);
  useEffect(()=>{setMotion(!window.matchMedia('(prefers-reduced-motion: reduce), (max-width: 767px)').matches && (navigator.hardwareConcurrency??4)>2)},[]);
  const { data: posts, isLoading, error } = useQuery({
    queryKey: ["posts", "recent"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("id, title, body, community, pseudonym, post_type, progress, created_at, expires_at")
        .order("created_at", { ascending: false })
        .limit(12);
      if (error) throw error;
      return data as PostRow[];
    },
  });

  return (
    <SiteLayout>
      <section className="relative -mx-5 flex min-h-[390px] items-center overflow-hidden border-b border-border/50 px-5 py-12 sm:min-h-[480px]">
        {motion&&<div className="scene-veil pointer-events-none absolute inset-0"><Suspense fallback={null}><LanternScene/></Suspense></div>}
        <div className="relative z-10 animate-rise max-w-xl">
        <p className="mb-4 text-xs uppercase tracking-widest text-primary">A quiet room for what remains</p>
        <h1 className="font-serif text-5xl leading-tight sm:text-7xl">Unsaid<span className="block mt-2 text-2xl text-primary sm:text-3xl">Say it. Set it down. Move on.</span></h1>
        <p className="mt-5 max-w-lg text-sm leading-relaxed text-muted-foreground">
          Unsaid is a quiet room, not a feed. No followers, no downvotes, no names. Share what
          you've been carrying, hear that you're not alone, and let it go when you're ready.
        </p>
        <div className="mt-7 flex gap-3">
          <Link to="/new">
            <Button>Share something</Button>
          </Link>
          <Link to="/rules">
            <Button variant="ghost">Read the rules</Button>
          </Link>
        </div>
        </div>
      </section>

      <section id="rooms" className="mt-12 scroll-mt-24">
        <h2 className="text-sm tracking-wide text-muted-foreground uppercase">Rooms</h2>
        <div className="stagger-feed mt-4 grid gap-3 sm:grid-cols-2">
          {COMMUNITIES.map((c) => (
            <Link
              key={c.slug}
              to="/c/$slug"
              params={{ slug: c.slug }}
              onMouseMove={tiltCard}
              onMouseLeave={resetCard}
               className="quiet-card tilt-card animate-rise p-5 transition-colors hover:border-primary/40"
            >
              <div className="font-serif text-base">{c.name}</div>
              <p className="mt-1 text-xs text-muted-foreground">{c.blurb}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-14">
        <h2 className="text-sm tracking-wide text-muted-foreground uppercase">Recently shared</h2>
         <div className="stagger-feed mt-4 space-y-3">
          {isLoading ? [0,1,2].map(i=><div key={i} className="h-36 animate-pulse rounded bg-surface" />) : posts?.length ? (
            posts.map((p) => <PostCard key={p.id} post={p} />)
          ) : error ? <p className="text-sm text-destructive">Couldn't load the latest stories. Please try again shortly.</p> : (
            <p className="text-sm text-muted-foreground">
              Nothing has been said yet. You could be first.
            </p>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
