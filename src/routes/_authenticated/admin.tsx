import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Unsaid" },
      { name: "description", content: "Moderation dashboard for Unsaid." },
      { property: "og:title", content: "Admin — Unsaid" },
      { property: "og:description", content: "Moderation dashboard for Unsaid." },
    ],
  }),
  component: AdminPage,
});

type ReportRow = {
  id: string;
  target_type: string;
  target_id: string;
  reason: string;
  status: string;
  created_at: string;
};

function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const queryClient = useQueryClient();
  const [emails, setEmails] = useState<Record<string, string>>({});

  const { data: reports } = useQuery({
    queryKey: ["admin", "reports"],
    enabled: isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reports")
        .select("id, target_type, target_id, reason, status, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as ReportRow[];
    },
  });

  const { data: log } = useQuery({
    queryKey: ["admin", "log"],
    enabled: isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_actions")
        .select("id, action, target_type, target_id, details, created_at")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
  });

  async function logAction(
    action: string,
    target_type: string,
    target_id: string,
    details?: string,
  ) {
    if (!user) return;
    await supabase
      .from("admin_actions")
      .insert({ admin_id: user.id, action, target_type, target_id, details: details ?? null });
    await queryClient.invalidateQueries({ queryKey: ["admin", "log"] });
  }

  async function authorOf(report: ReportRow) {
    const table = report.target_type === "post" ? "posts" : "comments";
    const { data } = await supabase
      .from(table)
      .select("author_id")
      .eq("id", report.target_id)
      .maybeSingle();
    return data?.author_id as string | undefined;
  }

  async function lookupEmail(report: ReportRow) {
    const authorId = await authorOf(report);
    if (!authorId) {
      toast("Content not found.");
      return;
    }
    const { data } = await supabase
      .from("profiles")
      .select("email")
      .eq("id", authorId)
      .maybeSingle();
    if (!data) {
      toast("No profile found.");
      return;
    }
    setEmails((prev) => ({ ...prev, [report.id]: data.email }));
    await logAction("lookup_email", report.target_type, report.target_id, "Viewed account email");
  }

  async function removeContent(report: ReportRow) {
    const table = report.target_type === "post" ? "posts" : "comments";
    const { error } = await supabase
      .from(table)
      .update({ is_deleted: true })
      .eq("id", report.target_id);
    if (error) {
      toast("Couldn't remove that.");
      return;
    }
    await logAction("delete_content", report.target_type, report.target_id);
    await resolve(report, "resolved");
    toast("Content removed.");
  }

  async function banAuthor(report: ReportRow) {
    const authorId = await authorOf(report);
    if (!authorId) {
      toast("Content not found.");
      return;
    }
    const { error } = await supabase
      .from("profiles")
      .update({ is_banned: true })
      .eq("id", authorId);
    if (error) {
      toast("Couldn't ban that user.");
      return;
    }
    await logAction("ban_user", "profile", authorId);
    toast("User banned.");
  }

  async function resolve(report: ReportRow, status: string) {
    await supabase.from("reports").update({ status }).eq("id", report.id);
    await queryClient.invalidateQueries({ queryKey: ["admin", "reports"] });
  }

  if (loading) {
    return (
      <SiteLayout>
        <p className="text-sm text-muted-foreground">Checking…</p>
      </SiteLayout>
    );
  }

  if (!isAdmin) {
    return (
      <SiteLayout>
        <h1 className="font-serif text-2xl">Not for you</h1>
        <p className="mt-2 text-sm text-muted-foreground">This area is for moderators only.</p>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <h1 className="font-serif text-3xl">Moderation</h1>
      <Tabs defaultValue="reports" className="mt-6">
        <TabsList>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="log">Activity log</TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="mt-5 space-y-3">
          {reports?.length ? (
            reports.map((r) => (
              <div key={r.id} className="quiet-card p-4">
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                  <span className="text-primary">{r.target_type}</span>
                  <span>·</span>
                  <span>{new Date(r.created_at).toLocaleString()}</span>
                  <span>·</span>
                  <span>{r.status}</span>
                </div>
                <p className="mt-2 text-sm">{r.reason}</p>
                {emails[r.id] && (
                  <p className="mt-2 text-xs text-primary">Account email: {emails[r.id]}</p>
                )}
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button size="sm" variant="secondary" onClick={() => lookupEmail(r)}>
                    Look up email
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => removeContent(r)}>
                    Delete content
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => banAuthor(r)}>
                    Ban author
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => resolve(r, "dismissed")}>
                    Dismiss
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No reports.</p>
          )}
        </TabsContent>

        <TabsContent value="log" className="mt-5 space-y-2">
          {log?.length ? (
            log.map((a) => (
              <div key={a.id} className="quiet-card p-3 text-xs text-muted-foreground">
                <span className="text-foreground">{a.action}</span> · {a.target_type} ·{" "}
                {new Date(a.created_at).toLocaleString()}
                {a.details ? ` · ${a.details}` : ""}
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No admin activity yet.</p>
          )}
        </TabsContent>
      </Tabs>
    </SiteLayout>
  );
}
