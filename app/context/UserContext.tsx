'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client' // use client-side Supabase instance

type User = {
  name?: string | null
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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient()
      const { data, error } = await supabase.auth.getUser()

      if (data?.user) {
        const name = data.user.user_metadata?.name ?? null
        const email = data.user.email
        setUser({ name, email })
      }

      setLoading(false)
    }

    fetchUser()
  }, [])

  return (
    <UserContext.Provider value={{ user, loading }}>
      {children}
    </UserContext.Provider>
  )
}
