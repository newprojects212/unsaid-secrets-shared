import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { REACTIONS, type ReactionKey } from "@/lib/communities";
import { cn } from "@/lib/utils";

export function ReactionBar({ postId }: { postId: string }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ["reactions", postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reactions")
        .select("kind, user_id")
        .eq("post_id", postId);
      if (error) throw error;
      return data;
    },
  });

  const rows = data ?? [];

  async function toggle(kind: ReactionKey) {
    if (!user) {
      toast("Sign in to respond.");
      return;
    }
    const mine = rows.some((r) => r.kind === kind && r.user_id === user.id);
    if (mine) {
      await supabase
        .from("reactions")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", user.id)
        .eq("kind", kind);
    } else {
      const { error } = await supabase
        .from("reactions")
        .insert({ post_id: postId, user_id: user.id, kind });
      if (error) toast("Couldn't save that right now.");
    }
    await queryClient.invalidateQueries({ queryKey: ["reactions", postId] });
  }

  return (
    <div className="flex flex-wrap gap-2">
      {(Object.keys(REACTIONS) as ReactionKey[]).map((kind) => {
        const count = rows.filter((r) => r.kind === kind).length;
        const mine = !!user && rows.some((r) => r.kind === kind && r.user_id === user.id);
        return (
          <button
            key={kind}
            type="button"
            onClick={() => toggle(kind)}
            className={cn(
              "rounded-full border border-border px-3 py-1.5 text-xs transition-colors",
              mine
                ? "border-primary/60 bg-primary/15 text-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {REACTIONS[kind]}
            {count > 0 && <span className="ml-1.5 opacity-70">{count}</span>}
          </button>
        );
      })}
    </div>
  );
}
