import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { SiteLayout } from "@/components/SiteLayout";
import { COMMUNITIES, PROGRESS, type ProgressKey } from "@/lib/communities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const searchSchema = z.object({ community: z.string().optional() });

export const Route = createFileRoute("/_authenticated/new")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Share something — Unsaid" },
      { name: "description", content: "Write it down anonymously and set it down." },
      { property: "og:title", content: "Share something — Unsaid" },
      { property: "og:description", content: "Write it down anonymously and set it down." },
    ],
  }),
  component: NewPost,
});

type LetGo = "never" | "24h" | "7d";

function NewPost() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const [community, setCommunity] = useState(search.community ?? COMMUNITIES[0]!.slug);
  const [postType, setPostType] = useState<"story" | "letter">("story");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [progress, setProgress] = useState<ProgressKey>("carrying");
  const [letGo, setLetGo] = useState<LetGo>("never");
  const [busy, setBusy] = useState(false);
  const [releasing,setReleasing]=useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (title.trim().length < 3 || body.trim().length < 10) {
      toast("Add a short title and a little more text.");
      return;
    }
    if(letGo!=="never"||progress==='let_go'){setReleasing(true);await new Promise(r=>setTimeout(r,850))}
    setBusy(true);
    const expires_at =
      letGo === "never"
        ? null
        : new Date(Date.now() + (letGo === "24h" ? 24 : 24 * 7) * 3600 * 1000).toISOString();

    const { data, error } = await supabase
      .from("posts")
      .insert({
        author_id: user.id,
        pseudonym: profile?.pseudonym ?? "Someone",
        community,
        title: title.trim(),
        body: body.trim(),
        post_type: postType,
        progress,
        expires_at,
      })
      .select("id")
      .maybeSingle();
    setBusy(false);
    setReleasing(false);

    if (error || !data) {
      toast("Couldn't share that right now.");
      return;
    }
    navigate({ to: "/post/$postId", params: { postId: data.id } });
  }

  return (
    <SiteLayout>
      <h1 className="animate-rise font-serif text-3xl">Share something</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        You're posting as <span className="text-primary">{profile?.pseudonym}</span>. No one sees
        your email or name.
      </p>

      <form onSubmit={submit} className={cn("quiet-card animate-rise mt-8 space-y-6 p-6",releasing&&"release-embers")}>
        <div className="flex gap-2">
          {(["story", "letter"] as const).map((t) => (
            <Button
              key={t}
              type="button"
              variant={postType===t?'secondary':'ghost'}
              size="sm"
              onClick={() => setPostType(t)}
            >
              {t === "story" ? "A thing I've never said" : "Letter to my past self"}
            </Button>
          ))}
        </div>

        <div className="space-y-1.5">
          <Label>Room</Label>
          <Select value={community} onValueChange={setCommunity}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {COMMUNITIES.map((c) => (
                <SelectItem key={c.slug} value={c.slug}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="title">Title</Label>
          <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="body">{postType === "letter" ? "Dear me…" : "What happened"}</Label>
          <Textarea
            id="body"
            rows={10}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className={postType === "letter" ? "font-serif leading-loose" : ""}
          />
        </div>

        <div className="space-y-2">
          <Label>Where are you with this?</Label>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(PROGRESS) as ProgressKey[]).map((key) => (
              <Button
                key={key}
                type="button"
                variant={progress===key?'secondary':'ghost'}
                size="sm"
                onClick={() => setProgress(key)}
              >
                {PROGRESS[key]}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Let it go</Label>
          <div className="flex flex-wrap gap-2">
            {(
              [
                ["never", "Keep it up"],
                ["24h", "Hide after 24 hours"],
                ["7d", "Hide after 7 days"],
              ] as const
            ).map(([key, label]) => (
              <Button
                key={key}
                type="button"
                variant={letGo===key?'secondary':'ghost'}
                size="sm"
                onClick={() => setLetGo(key)}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>

        <Button type="submit" disabled={busy}>
          Set it down
        </Button>
      </form>
    </SiteLayout>
  );
}
