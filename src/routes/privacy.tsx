import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Unsaid" },
      {
        name: "description",
        content: "What Unsaid stores, who can see your email, and how anonymity works.",
      },
      { property: "og:title", content: "Privacy Policy — Unsaid" },
      { property: "og:description", content: "What Unsaid stores and how anonymity works." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Privacy,
});

function Privacy() {
  return (
    <SiteLayout>
      <h1 className="animate-rise font-serif text-3xl">Privacy Policy</h1>
      <div className="mt-6 space-y-6 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="font-serif text-lg text-foreground">You are anonymous to other users</h2>
          <p className="mt-2">
            Everything you post is shown under a random pseudonym such as QuietRiver482. Your email
            address and real name are never shown to other users, and are never included in public
            queries. Public profiles and pseudonym search group already-public stories and replies under the same pseudonym.
          </p>
        </section>
        <section>
          <h2 className="font-serif text-lg text-foreground">What the admin can see</h2>
          <p className="mt-2">
            The site admin can review account emails, user activity and private conversations. This is
            used only for safety and abuse handling — for example investigating harassment,
            doxxing, or threats. Opening a user detail or conversation is recorded in an internal activity log. Members do not receive individual review notifications.
          </p>
        </section>
        <section>
          <h2 className="font-serif text-lg text-foreground">What we store</h2>
          <p className="mt-2">
            Your account email, a generated pseudonym, your posts, comments, reactions and any
            reports you file. We do not sell data or run ad tracking.
          </p>
        </section>
        <section><h2 className="font-serif text-lg text-foreground">Private messages</h2><p className="mt-2">Messages are not end-to-end encrypted. The site admin can review conversations for safety and abuse handling. Other users only see your pseudonym in a conversation.</p></section>
        <section>
          <h2 className="font-serif text-lg text-foreground">Letting go</h2>
          <p className="mt-2">
            Posts marked to fade after 24 hours or 7 days stop being visible publicly once that
            time passes.
          </p>
        </section>
        <section>
          <h2 className="font-serif text-lg text-foreground">Deleting your account</h2>
          <p className="mt-2">
            Contact the admin to have your account and content removed. Copies may remain in
            backups for a limited period.
          </p>
        </section>
      </div>
    </SiteLayout>
  );
}
