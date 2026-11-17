<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Unsaid rules
- Anonymity: public reads never touch `profiles`; posts/comments store a denormalized `pseudonym` filled by a DB trigger, so emails can stay admin-only behind RLS.
- Roles live in `user_roles` and are checked via the `has_role` security-definer function, never on `profiles`.
- Communities are a static list in `src/lib/communities.ts` (no table) since the set is fixed.
- Private messaging and profile details use validated security-definer database RPCs returning pseudonym-only DTOs; this keeps participant identifiers out of normal client responses.
- Separate author deletion from admin removal and enforce immutable moderation flags in database triggers; owner updates cannot undo moderation.
- Reuse shared pointer-motion handlers for all tiltable cards so reduced-motion and touch safeguards stay consistent.
- Keep Three.js material colors in global CSS tokens and sample them after hydration so the scene follows the theme.
- Public pseudonym discovery uses SECURITY INVOKER RPCs with safe projections and existing visibility RLS, never profile-table reads, to keep hidden content and identities private.

- Public pseudonym pages use non-nested routing so the people-search screen cannot swallow profile content.
- Cloudflare Pages shares the Lovable Cloud account backend; email confirmation returns to the official Unsaid host, while managed Google sign-in must stay on Lovable hosting because Pages does not serve the OAuth handoff.
- Keep password recovery on a public `/reset-password` route and send external-host recovery links to the official Unsaid origin, because only its callback is currently allowlisted.
