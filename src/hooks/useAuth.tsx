import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type Profile = {
  id: string;
  pseudonym: string;
  is_banned: boolean;
};

type AuthValue = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isAdmin: boolean;
  loading: boolean;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthValue>({
  session: null,
  user: null,
  profile: null,
  isAdmin: false,
  loading: true,
  refresh: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  async function loadProfile(current: Session | null) {
    if (!current?.user) {
      setProfile(null);
      setIsAdmin(false);
      return;
    }
    const { data: existing } = await supabase
      .from("profiles")
       .select("id, pseudonym, is_banned")
      .eq("id", current.user.id)
      .maybeSingle();

    let row = existing;
    if (!row) {
      const { data: pseudonym } = await supabase.rpc("generate_pseudonym");
      const { data: inserted } = await supabase
        .from("profiles")
        .insert({
          id: current.user.id,
          email: current.user.email ?? "unknown",
          pseudonym: pseudonym ?? `Quiet${Math.floor(Math.random() * 900) + 100}`,
        })
         .select("id, pseudonym, is_banned")
        .maybeSingle();
      row = inserted;
    }
    setProfile(row ?? null);

    const { data: admin } = await supabase.rpc('has_role',{_user_id:current.user.id,_role:'admin'});
    setIsAdmin(admin === true);
  }

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      void loadProfile(data.session).finally(() => setLoading(false));
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event, next) => {
      setSession(next);
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        void loadProfile(next);
      }
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const refresh = async () => {
    const { data } = await supabase.auth.getSession();
    setSession(data.session);
    await loadProfile(data.session);
  };

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, profile, isAdmin, loading, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
