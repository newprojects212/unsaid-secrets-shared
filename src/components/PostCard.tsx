import { Link } from "@tanstack/react-router";
import { communityName, PROGRESS, type ProgressKey } from "@/lib/communities";
import { cn } from "@/lib/utils";
import { tiltCard, resetCard } from '@/lib/card-motion';

export type PostRow = {
  id: string;
  title: string;
  body: string;
  community: string;
  pseudonym: string;
  post_type: string;
  progress: string;
  created_at: string;
  expires_at: string | null;
};

export function ProgressTag({ value }: { value: string }) {
  const label = PROGRESS[value as ProgressKey] ?? value;
  return (
    <span
      className={cn(
        "rounded-full border px-2.5 py-0.5 text-[11px]",
        value === "let_go"
          ? "border-primary/50 text-primary"
          : "border-border text-muted-foreground",
      )}
    >
      {label}
    </span>
  );
}

export function PostCard({ post }: { post: PostRow }) {
  const isLetter = post.post_type === "letter";
  return (
    <article
      onMouseMove={tiltCard}
      onMouseLeave={resetCard}
      className={cn(
        "tilt-card animate-rise block rounded-lg border p-5 transition-colors",
        isLetter
          ? "border-primary/25 bg-letter text-letter-foreground"
          : "quiet-card hover:border-primary/40",
      )}
    >
      <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
        <span className="text-primary">{communityName(post.community)}</span>
        <span>·</span>
        <Link to="/people/$pseudonym" params={{pseudonym:post.pseudonym}} className="hover:text-primary">{post.pseudonym}</Link>
        {isLetter && <span className="italic">· letter to my past self</span>}
      </div>
      <h3 className="mt-2 font-serif text-lg leading-snug"><Link to="/post/$postId" params={{postId:post.id}} className="hover:text-primary">{post.title}</Link></h3>
      <Link to="/post/$postId" params={{postId:post.id}} className="mt-2 block line-clamp-3 text-sm leading-relaxed text-muted-foreground">{post.body}</Link>
      <div className="mt-3 flex items-center gap-2">
        <ProgressTag value={post.progress} />
        {post.expires_at && (
          <span className="text-[11px] text-muted-foreground">fading soon</span>
        )}
      </div>
    </article>
  );
}
