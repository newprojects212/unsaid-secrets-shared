-- ROLES
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE POLICY "own roles readable" ON public.user_roles
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- PROFILES (email admin-only)
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY,
  email text NOT NULL,
  pseudonym text NOT NULL UNIQUE,
  is_banned boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "read own profile" ON public.profiles
  FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "admins read all profiles" ON public.profiles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "insert own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "admins update profiles" ON public.profiles
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.is_banned(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT COALESCE((SELECT is_banned FROM public.profiles WHERE id = _user_id), false);
$$;

CREATE OR REPLACE FUNCTION public.generate_pseudonym()
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  adjectives text[] := ARRAY['Quiet','Soft','Distant','Gentle','Hidden','Silent','Pale','Still','Dusk','Faint','Kind','Slow','Low','Open','Grey','Amber','Calm','Late','Small','Deep'];
  nouns text[] := ARRAY['River','Harbor','Ember','Field','Window','Lantern','Meadow','Shore','Tide','Pine','Stone','Cloud','Bridge','Path','Hollow','Garden','Feather','Candle','Willow','Echo'];
  candidate text;
  i int := 0;
BEGIN
  LOOP
    candidate := adjectives[1 + floor(random() * array_length(adjectives,1))::int]
      || nouns[1 + floor(random() * array_length(nouns,1))::int]
      || (100 + floor(random() * 900))::int::text;
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.profiles WHERE pseudonym = candidate);
    i := i + 1;
    EXIT WHEN i > 50;
  END LOOP;
  RETURN candidate;
END;
$$;

-- POSTS
CREATE TABLE public.posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL,
  pseudonym text NOT NULL,
  community text NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  post_type text NOT NULL DEFAULT 'story',
  progress text NOT NULL DEFAULT 'carrying',
  expires_at timestamptz,
  is_deleted boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.posts TO anon;
GRANT SELECT, INSERT, UPDATE ON public.posts TO authenticated;
GRANT ALL ON public.posts TO service_role;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public reads visible posts" ON public.posts
  FOR SELECT TO anon, authenticated
  USING (is_deleted = false AND (expires_at IS NULL OR expires_at > now()));
CREATE POLICY "authors read own posts" ON public.posts
  FOR SELECT TO authenticated USING (author_id = auth.uid());
CREATE POLICY "admins read all posts" ON public.posts
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "create own posts" ON public.posts
  FOR INSERT TO authenticated
  WITH CHECK (author_id = auth.uid() AND NOT public.is_banned(auth.uid()));
CREATE POLICY "authors update own posts" ON public.posts
  FOR UPDATE TO authenticated USING (author_id = auth.uid()) WITH CHECK (author_id = auth.uid());
CREATE POLICY "admins update posts" ON public.posts
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- COMMENTS
CREATE TABLE public.comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  author_id uuid NOT NULL,
  pseudonym text NOT NULL,
  body text NOT NULL,
  is_deleted boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.comments TO anon;
GRANT SELECT, INSERT, UPDATE ON public.comments TO authenticated;
GRANT ALL ON public.comments TO service_role;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public reads visible comments" ON public.comments
  FOR SELECT TO anon, authenticated USING (is_deleted = false);
CREATE POLICY "admins read all comments" ON public.comments
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "create own comments" ON public.comments
  FOR INSERT TO authenticated
  WITH CHECK (author_id = auth.uid() AND NOT public.is_banned(auth.uid()));
CREATE POLICY "admins update comments" ON public.comments
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- fill pseudonym server-side from profile
CREATE OR REPLACE FUNCTION public.set_pseudonym()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  NEW.pseudonym := COALESCE((SELECT pseudonym FROM public.profiles WHERE id = NEW.author_id), 'Someone');
  RETURN NEW;
END;
$$;
CREATE TRIGGER posts_set_pseudonym BEFORE INSERT ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.set_pseudonym();
CREATE TRIGGER comments_set_pseudonym BEFORE INSERT ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.set_pseudonym();

-- REACTIONS
CREATE TABLE public.reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  kind text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (post_id, user_id, kind)
);
GRANT SELECT ON public.reactions TO anon;
GRANT SELECT, INSERT, DELETE ON public.reactions TO authenticated;
GRANT ALL ON public.reactions TO service_role;
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone reads reactions" ON public.reactions
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "create own reactions" ON public.reactions
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND NOT public.is_banned(auth.uid()));
CREATE POLICY "remove own reactions" ON public.reactions
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- REPORTS
CREATE TABLE public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL,
  target_type text NOT NULL,
  target_id uuid NOT NULL,
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.reports TO authenticated;
GRANT ALL ON public.reports TO service_role;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "create reports" ON public.reports
  FOR INSERT TO authenticated WITH CHECK (reporter_id = auth.uid());
CREATE POLICY "admins read reports" ON public.reports
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins update reports" ON public.reports
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ADMIN ACTIVITY LOG
CREATE TABLE public.admin_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL,
  action text NOT NULL,
  target_type text NOT NULL,
  target_id uuid,
  details text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.admin_actions TO authenticated;
GRANT ALL ON public.admin_actions TO service_role;
ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins read log" ON public.admin_actions
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins write log" ON public.admin_actions
  FOR INSERT TO authenticated
  WITH CHECK (admin_id = auth.uid() AND public.has_role(auth.uid(), 'admin'));

CREATE INDEX posts_community_idx ON public.posts (community, created_at DESC);
CREATE INDEX comments_post_idx ON public.comments (post_id, created_at);
CREATE INDEX reactions_post_idx ON public.reactions (post_id);