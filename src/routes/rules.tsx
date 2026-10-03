import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";

export const Route = createFileRoute("/rules")({
  head: () => ({
    meta: [
      { title: "Rules — Unsaid" },
      {
        name: "description",
        content: "How we keep Unsaid safe: no doxxing, no naming real people, no harassment.",
      },
      { property: "og:title", content: "Rules — Unsaid" },
      { property: "og:description", content: "How we keep Unsaid a safe, quiet place." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Rules,
});

const RULES = [
  ["Be kind", "This is a room for people at their most exposed. Comfort first, advice only if asked."],
  ["No doxxing", "Never share addresses, phone numbers, workplaces, socials or photos — yours or anyone's."],
  ["No naming real people", "Change names and identifying details. Write about what happened, not who did it."],
  ["No harassment", "No mocking, pile-ons, threats, or pressuring anyone for details."],
  ["No graphic abuse content", "You can say what happened without detailed depictions of violence or abuse."],
  ["No promotion", "No selling, recruiting, links to your projects, or DM fishing."],
  ["You must be 18+", "Unsaid is for adults only."],
];

function Rules() {
  return (
    <SiteLayout>
      <h1 className="animate-rise font-serif text-3xl">Rules</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        Unsaid only works if it stays safe. Breaking these can get a post removed or an account
        banned.
      </p>
      <div className="mt-8 space-y-3">
        {RULES.map(([title, text]) => (
          <div key={title} className="quiet-card animate-rise p-5">
            <h2 className="font-serif text-lg">{title}</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{text}</p>
          </div>
        ))}
      </div>
    </SiteLayout>
  );
}
