import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";

export const Route = createFileRoute("/resources")({
  head: () => ({
    meta: [
      { title: "Help resources — Unsaid" },
      {
        name: "description",
        content: "Crisis lines and support directories if you need help right now.",
      },
      { property: "og:title", content: "Help resources — Unsaid" },
      { property: "og:description", content: "Crisis lines and support directories." },
    ],
  }),
  component: Resources,
});

const LINKS = [
  {
    name: "Find a Helpline",
    url: "https://findahelpline.com",
    note: "Free, confidential support lines in over 130 countries.",
  },
  {
    name: "International Association for Suicide Prevention",
    url: "https://www.iasp.info/crisis-centres-helplines/",
    note: "Directory of crisis centres worldwide.",
  },
  {
    name: "Befrienders Worldwide",
    url: "https://befrienders.org",
    note: "Emotional support to prevent suicide, worldwide.",
  },
  {
    name: "988 Suicide & Crisis Lifeline (US)",
    url: "https://988lifeline.org",
    note: "Call or text 988 in the United States.",
  },
  {
    name: "Samaritans (UK & Ireland)",
    url: "https://www.samaritans.org",
    note: "Call 116 123, free, any time.",
  },
];

function Resources() {
  return (
    <SiteLayout>
      <h1 className="animate-rise font-serif text-3xl">If you need help now</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        If you are in immediate danger, or you think you might harm yourself or someone else,
        please contact your local emergency services. Unsaid is a peer community, not a crisis
        service.
      </p>
      <div className="mt-8 space-y-3">
        {LINKS.map((l) => (
          <a
            key={l.name}
            href={l.url}
            target="_blank"
            rel="noreferrer"
            className="quiet-card animate-rise block p-5 transition-colors hover:border-primary/40"
          >
            <div className="font-serif text-lg">{l.name}</div>
            <p className="mt-1 text-sm text-muted-foreground">{l.note}</p>
          </a>
        ))}
      </div>
    </SiteLayout>
  );
}
