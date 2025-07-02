'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client' // use client-side Supabase instance

type User = {
  name: string | null
  email: string | null
}

type UserContextType = {
  user: User | null
  loading: boolean
}

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
})

export const useUser = () => useContext(UserContext)

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const supabase = createClient();

    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        const name = data.user.user_metadata?.name ?? null;
        const email = data.user.email;
        setUser({ name, email });
      }
      setLoading(false);
    };

    fetchUser();

    // Listen for auth changes (login/logout/signup)
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        const name = session.user.user_metadata?.name;
        const email = session.user.email;
        setUser({ name, email });
      } else {
        setUser(null); // e.g. on logout
      }
    });

    return () => {
      listener?.subscription.unsubscribe(); // ✅ clean up listener
    };
  }, []);

  useEffect(() => {console.log( user)}, [user]);

  return (
    <UserContext.Provider value={{ user, loading }}>
      {children}
    </UserContext.Provider>
  )
}
