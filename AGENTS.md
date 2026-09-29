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
