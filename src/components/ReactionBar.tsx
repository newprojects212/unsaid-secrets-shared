import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { REACTIONS, type ReactionKey } from "@/lib/communities";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function ReactionBar({ postId }: { postId: string }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ["reactions", postId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("reaction_state", { _post: postId });
      if (error) throw error;
      return data as unknown as {kind:string;mine:boolean}[];
    },
  });

  const rows = data ?? [];

  async function toggle(kind: ReactionKey) {
    if (!user) {
      toast("Sign in to respond.");
      return;
    }
    const { error } = await supabase.rpc("toggle_reaction", { _post: postId, _kind: kind });
    if (error) toast("Couldn't save that right now.");
    await queryClient.invalidateQueries({ queryKey: ["reactions", postId] });
  }

  return (
    <div className="flex flex-wrap gap-2">
      {(Object.keys(REACTIONS) as ReactionKey[]).map((kind) => {
        const count = rows.filter((r) => r.kind === kind).length;
        const mine = !!user && rows.some((r) => r.kind === kind && r.mine);
        return (
          <Button
            key={kind}
            type="button"
            variant="outline"
            size="sm"
            onClick={() => toggle(kind)}
            className={cn(
              "rounded-full border-border text-xs transition-all active:scale-95 active:shadow-quiet",
              mine
                ? "border-primary/60 bg-primary/15 text-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {REACTIONS[kind]}
            {count > 0 && <span className="ml-1.5 opacity-70">{count}</span>}
          </Button>
        );
      })}
    </div>
  );
}
