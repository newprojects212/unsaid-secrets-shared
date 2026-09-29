import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/SiteLayout";
import { PostCard, type PostRow } from "@/components/PostCard";
import { COMMUNITIES } from "@/lib/communities";
import { Button } from "@/components/ui/button";

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
      {
        property: "og:description",
        content: "A quiet anonymous community for secrets, regrets and letting go.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const { data: posts } = useQuery({
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
      <section className="animate-rise py-6">
        <h1 className="font-serif text-4xl leading-tight sm:text-5xl">Say it. Set it down.</h1>
        <h1 className="font-serif text-4xl leading-tight text-primary sm:text-5xl">Move on.</h1>
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
      </section>

      <section className="mt-14">
        <h2 className="text-sm tracking-wide text-muted-foreground uppercase">Rooms</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {COMMUNITIES.map((c) => (
            <Link
              key={c.slug}
              to="/c/$slug"
              params={{ slug: c.slug }}
              className="quiet-card animate-rise p-4 transition-colors hover:border-primary/40"
            >
              <div className="font-serif text-base">{c.name}</div>
              <p className="mt-1 text-xs text-muted-foreground">{c.blurb}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-14">
        <h2 className="text-sm tracking-wide text-muted-foreground uppercase">Recently shared</h2>
        <div className="mt-4 space-y-3">
          {posts?.length ? (
            posts.map((p) => <PostCard key={p.id} post={p} />)
          ) : (
            <p className="text-sm text-muted-foreground">
              Nothing has been said yet. You could be first.
            </p>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
