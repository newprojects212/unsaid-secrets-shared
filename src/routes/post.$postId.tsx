import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/SiteLayout";
import { ReactionBar } from "@/components/ReactionBar";
import { ReportButton } from "@/components/ReportButton";
import { ProgressTag } from "@/components/PostCard";
import { useAuth } from "@/hooks/useAuth";
import { communityName, PROGRESS, type ProgressKey } from "@/lib/communities";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { MessageRequestButton } from "@/components/MessageRequestButton";

export const Route = createFileRoute("/post/$postId")({
  head: () => ({
    meta: [
      { title: "A story — Unsaid" },
      { name: "description", content: "An anonymous story shared on Unsaid." },
      { property: "og:title", content: "A story — Unsaid" },
      { property: "og:description", content: "An anonymous story shared on Unsaid." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PostPage,
});

function PostPage() {
  const { postId } = Route.useParams();
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);

  const { data: post, isLoading } = useQuery({
    queryKey: ["post", postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("id,title,body,community,pseudonym,post_type,progress,created_at,expires_at")
        .eq("id", postId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: comments } = useQuery({
    queryKey: ["comments", postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("comments")
        .select("id, body, pseudonym, created_at")
        .eq("post_id", postId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  async function addComment() {
    if (!user) {
      toast("Sign in to reply.");
      return;
    }
    if (comment.trim().length < 2) return;
    setSaving(true);
    const { error } = await supabase.from("comments").insert({
      post_id: postId,
      author_id: user.id,
      pseudonym: profile?.pseudonym ?? "Someone",
      body: comment.trim(),
    });
    setSaving(false);
    if (error) {
      toast("Couldn't post that reply.");
      return;
    }
    setComment("");
    await queryClient.invalidateQueries({ queryKey: ["comments", postId] });
  }

  async function updateProgress(value: ProgressKey) {
    if(value==='let_go'){setReleasing(true);await new Promise(r=>setTimeout(r,900))}
    const {error}=await supabase.rpc('owner_post_action',{_id:postId,_action:'progress',_progress:value});
    setReleasing(false);
    if(error){toast(error.message);return}
    await queryClient.invalidateQueries({ queryKey: ["post", postId] });
  }
  const [releasing,setReleasing]=useState(false);

  if (isLoading) {
    return (
      <SiteLayout>
        <p className="text-sm text-muted-foreground">Opening…</p>
      </SiteLayout>
    );
  }

  if (!post) {
    return (
      <SiteLayout>
        <h1 className="font-serif text-2xl">This is gone</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          It may have been let go, or removed.
        </p>
        <Link to="/" className="mt-5 inline-block text-sm text-primary underline">
          Back home
        </Link>
      </SiteLayout>
    );
  }

  const isLetter = post.post_type === "letter";
  const isAuthor = !!user && profile?.pseudonym === post.pseudonym;

  return (
    <SiteLayout>
      <article
        className={cn(
          "animate-rise rounded-lg p-6",releasing&&"release-embers",
          isLetter ? "border border-primary/25 bg-letter text-letter-foreground" : "quiet-card",
        )}
      >
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
          <Link to="/c/$slug" params={{ slug: post.community }} className="text-primary">
            {communityName(post.community)}
          </Link>
          <span>·</span>
          <span>{post.pseudonym}</span>
          {isLetter && <span className="italic">· letter to my past self</span>}
        </div>

        <h1 className={cn("mt-3 font-serif", isLetter ? "text-2xl italic" : "text-3xl")}>
          {post.title}
        </h1>
        <div
          className={cn(
            "mt-5 leading-loose whitespace-pre-wrap",
            isLetter ? "font-serif text-[1.05rem]" : "text-[0.98rem]",
          )}
        >
          {post.body}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <ProgressTag value={post.progress} />
          {post.expires_at && (
            <span className="text-[11px] text-muted-foreground">
              fades {new Date(post.expires_at).toLocaleString()}
            </span>
          )}
          <div className="ml-auto">
            <ReportButton targetType="post" targetId={post.id} />
          </div>
          {!isAuthor&&<MessageRequestButton targetType="post" targetId={post.id}/>}
        </div>

        {isAuthor && (
          <div className="mt-5 border-t border-border pt-4">
            <p className="text-xs text-muted-foreground">Where are you with this now?</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {(Object.keys(PROGRESS) as ProgressKey[]).map((key) => (
                <Button
                  key={key}
                  type="button"
                  size="sm"
                  variant={post.progress===key?'secondary':'ghost'}
                  onClick={() => updateProgress(key)}
                >
                  {PROGRESS[key]}
                </Button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6">
          <ReactionBar postId={post.id} />
        </div>
      </article>

      <section className="mt-10">
        <h2 className="text-sm tracking-wide text-muted-foreground uppercase">Replies</h2>
        <div className="mt-4 space-y-3">
          {comments?.length ? (
            comments.map((c) => (
              <div key={c.id} className="quiet-card animate-rise p-4">
                <div className="text-[11px] text-muted-foreground">{c.pseudonym}</div>
                <p className="mt-1.5 text-sm leading-relaxed whitespace-pre-wrap">{c.body}</p>
                <div className="mt-2">
                  <ReportButton targetType="comment" targetId={c.id} />
                  {profile?.pseudonym!==c.pseudonym&&<MessageRequestButton targetType="comment" targetId={c.id}/>}
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No replies yet.</p>
          )}
        </div>

        <div className="mt-6">
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            placeholder={user ? "Say something kind…" : "Sign in to reply"}
            disabled={!user}
          />
          <div className="mt-2 flex items-center justify-between">
            <p className="text-[11px] text-muted-foreground">
              Replies are anonymous. Be gentle — advice only if it's asked for.
            </p>
            <Button size="sm" onClick={addComment} disabled={saving || !user}>
              Reply
            </Button>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
