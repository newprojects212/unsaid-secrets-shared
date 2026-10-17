# The Quiet Room

Build a website called "Unsaid" — a calm, dark-themed anonymous community where people share deep secrets, regrets and their past, and work on letting go. Tagline: "Say it. Set it down. Move on."

DESIGN: Deep navy/charcoal background, soft warm accent color, large readable serif headings, subtle fade animations. Peaceful, not noisy. Mobile-first. It should feel like a quiet room, not a feed.

AUTH: Google login and email login via Supabase Auth. On signup require an "I am 18+" checkbox and show this notice clearly: "You're anonymous to other users. The site admin can see your account email for safety and abuse handling."

FEATURES:
- Communities: Regrets, Family Secrets, Heartbreak, Guilt, Things I Never Said, Healing, Forgiveness
- Create posts (title + body). Each user gets a random pseudonym like "QuietRiver482"; never show email or real name publicly.
- Reactions instead of votes: "I hear you", "Me too", "Sending strength". No downvotes, no follower counts.
- Comments (also anonymous, supportive tone)
- "Let it go" option on posts: auto-hide after 24 hours or 7 days
- Progress tag on posts: Still carrying it / Working through it / Let it go (author can update later)
- "Letter to my past self" special post type with a softer layout
- Report button on every post and comment
- Crisis banner with a link to help resources and a note that people in danger should contact local emergency services

DATABASE (Supabase, with strict Row Level Security):
- profiles: id, email, pseudonym, is_banned, created_at. Email must be readable ONLY by the admin role, never by normal users or public queries.
- user_roles table with an admin role (use a security definer function to check roles).
- posts, comments, reactions, reports tables.
- Public queries must only return pseudonym, never email or user identity.

ADMIN DASHBOARD (admin role only):
- View reports, delete posts/comments, ban users
- Look up the account email behind a reported post/comment
- Activity log of admin actions

Also add pages: Rules (no doxxing, no naming real people, no harassment, no graphic abuse content, be kind), Privacy Policy, Terms.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://unsaid-secrets-shared.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/4f58fa7d-2db6-4753-86f7-d3602bcf0c4c).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
