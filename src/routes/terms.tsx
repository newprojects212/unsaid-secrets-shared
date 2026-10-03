import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms — Unsaid" },
      { name: "description", content: "The terms of using Unsaid, an anonymous community." },
      { property: "og:title", content: "Terms — Unsaid" },
      { property: "og:description", content: "The terms of using Unsaid." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Terms,
});

function Terms() {
  return (
    <SiteLayout>
      <h1 className="animate-rise font-serif text-3xl">Terms</h1>
      <div className="mt-6 space-y-6 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="font-serif text-lg text-foreground">18 and over</h2>
          <p className="mt-2">
            You must be at least 18 years old to create an account or post on Unsaid.
          </p>
        </section>
        <section>
          <h2 className="font-serif text-lg text-foreground">Not a crisis or medical service</h2>
          <p className="mt-2">
            Unsaid is a peer support community, not therapy, medical care, or emergency help. If
            you are in danger, contact your local emergency services.
          </p>
        </section>
        <section>
          <h2 className="font-serif text-lg text-foreground">Your content</h2>
          <p className="mt-2">
            You keep ownership of what you write and grant us permission to display it on the site.
            Do not post content you have no right to share, or content that identifies other real
            people.
          </p>
        </section>
        <section>
          <h2 className="font-serif text-lg text-foreground">Moderation</h2>
          <p className="mt-2">
            We may remove content or suspend accounts that break the rules, without notice. Reports
            are reviewed by the admin.
          </p>
        </section>
        <section><h2 className="font-serif text-lg text-foreground">Private messages</h2><p className="mt-2">Messages are not end-to-end encrypted. The site admin can review conversations for safety and abuse handling. Do not send harassment, threats, or identifying information about other people.</p></section>
        <section>
          <h2 className="font-serif text-lg text-foreground">No warranty</h2>
          <p className="mt-2">
            Unsaid is provided as-is. We aren't liable for what other users post or for how you act
            on anything you read here.
          </p>
        </section>
      </div>
    </SiteLayout>
  );
}
