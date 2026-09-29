import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/SiteLayout";
import { PostCard, type PostRow } from "@/components/PostCard";
import { COMMUNITIES, communityName } from "@/lib/communities";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/c/$slug")({
  beforeLoad: ({ params }) => {
    if (!COMMUNITIES.some((c) => c.slug === params.slug)) throw notFound();
  },
  head: ({ params }) => {
    const name = communityName(params.slug);
    return {
      meta: [
        { title: `${name} — Unsaid` },
        {
          name: "description",
          content: `Anonymous stories shared in ${name} on Unsaid. Say it, set it down, move on.`,
        },
        { property: "og:title", content: `${name} — Unsaid` },
        { property: "og:description", content: `Anonymous stories shared in ${name} on Unsaid.` },
      ],
    };
  },
  component: CommunityPage,
});

function CommunityPage() {
  const { slug } = Route.useParams();
  const community = COMMUNITIES.find((c) => c.slug === slug)!;

  const { data: posts } = useQuery({
    queryKey: ["posts", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("id, title, body, community, pseudonym, post_type, progress, created_at, expires_at")
        .eq("community", slug)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as PostRow[];
    },
  });

  return (
    <SiteLayout>
      <div className="animate-rise">
        <h1 className="font-serif text-3xl">{community.name}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{community.blurb}</p>
        <div className="mt-5">
          <Link to="/new" search={{ community: slug }}>
            <Button size="sm">Share here</Button>
          </Link>
        </div>
      </div>

      <div className="mt-10 space-y-3">
        {posts?.length ? (
          posts.map((p) => <PostCard key={p.id} post={p} />)
        ) : (
          <p className="text-sm text-muted-foreground">This room is quiet so far.</p>
        )}
      </div>
    </SiteLayout>
  );
}
