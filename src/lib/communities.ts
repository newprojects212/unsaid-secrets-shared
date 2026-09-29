export type Community = {
  slug: string;
  name: string;
  blurb: string;
};

export const COMMUNITIES: Community[] = [
  { slug: "regrets", name: "Regrets", blurb: "The choices that still echo." },
  { slug: "family-secrets", name: "Family Secrets", blurb: "What the house never said out loud." },
  { slug: "heartbreak", name: "Heartbreak", blurb: "Love that ended, love that didn't." },
  { slug: "guilt", name: "Guilt", blurb: "The weight you've carried quietly." },
  {
    slug: "things-i-never-said",
    name: "Things I Never Said",
    blurb: "Words that stayed behind your teeth.",
  },
  { slug: "healing", name: "Healing", blurb: "Slow progress counts as progress." },
  { slug: "forgiveness", name: "Forgiveness", blurb: "For others. For yourself." },
];

export const communityName = (slug: string) =>
  COMMUNITIES.find((c) => c.slug === slug)?.name ?? slug;

export const PROGRESS = {
  carrying: "Still carrying it",
  working: "Working through it",
  let_go: "Let it go",
} as const;

export type ProgressKey = keyof typeof PROGRESS;

export const REACTIONS = {
  hear_you: "I hear you",
  me_too: "Me too",
  strength: "Sending strength",
} as const;

export type ReactionKey = keyof typeof REACTIONS;
