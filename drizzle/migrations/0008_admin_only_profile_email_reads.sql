REVOKE SELECT ON public.profiles FROM authenticated;
GRANT SELECT (id,pseudonym,is_banned,created_at) ON public.profiles TO authenticated;
CREATE OR REPLACE FUNCTION public.admin_list_users() RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT CASE WHEN public.has_role(auth.uid(),'admin') THEN (SELECT coalesce(jsonb_agg(jsonb_build_object('id',p.id,'pseudonym',p.pseudonym,'email',p.email,'created_at',p.created_at,'is_banned',p.is_banned) ORDER BY p.created_at DESC),'[]'::jsonb) FROM public.profiles p) ELSE NULL END $$;
REVOKE ALL ON FUNCTION public.admin_list_users() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_list_users() TO authenticated;