import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";

export const useAdmin = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAdminRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .maybeSingle();

      return !error && data !== null;
    } catch (error) {
      console.error("Error checking admin role:", error);
      return false;
    }
  };

  useEffect(() => {
    // Set up auth listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user || null);
      
      if (newSession?.user) {
        setTimeout(async () => {
          const adminStatus = await checkAdminRole(newSession.user.id);
          setIsAdmin(adminStatus);
          setLoading(false);
        }, 0);
      } else {
        setIsAdmin(false);
        setLoading(false);
      }
    });

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user || null);

      if (currentSession?.user) {
        checkAdminRole(currentSession.user.id).then((adminStatus) => {
          setIsAdmin(adminStatus);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, session, isAdmin, loading };
};
