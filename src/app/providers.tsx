'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react'
import { PrivyProvider, usePrivy } from '@privy-io/react-auth'
import { login as apiLogin, getMe } from '@/lib/api'
import type { User } from '@/lib/types'

/* ── Auth Context ─────────────────────────────────────────────── */

interface AuthContextType {
  user: User | null
  setUser: (user: User | null) => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  isLoading: true,
})

export function useUser() {
  return useContext(AuthContext)
}

export function useRequireAuth() {
  const { user } = useUser()

  useEffect(() => {
    if (typeof window !== 'undefined' && !user) {
      window.location.href = '/'
    }
  }, [user])

  return user
}

/* ── Auth Provider (internal) ───────────────────────────────── */

function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { authenticated, getAccessToken } = usePrivy()

  /* Exchange Privy token → platform JWT */
  useEffect(() => {
    if (!authenticated) return

    const exchange = async () => {
      try {
        const privyToken = await getAccessToken()
        if (!privyToken) {
          setIsLoading(false)
          return
        }

        const { token, user: userData } = await apiLogin(privyToken)
        if (typeof window !== 'undefined') {
          localStorage.setItem('gateway_token', token)
        }
        setUser(userData)
      } catch (err) {
        console.error('Auth exchange failed:', err)
      } finally {
        setIsLoading(false)
      }
    }

    exchange()
  }, [authenticated, getAccessToken])

  /* Restore session from localStorage on mount */
  useEffect(() => {
    if (authenticated) return

    const restore = async () => {
      if (typeof window === 'undefined') {
        setIsLoading(false)
        return
      }

      const token = localStorage.getItem('gateway_token')
      if (!token) {
        setIsLoading(false)
        return
      }

      try {
        const userData = await getMe()
        setUser(userData)
      } catch {
        localStorage.removeItem('gateway_token')
      } finally {
        setIsLoading(false)
      }
    }

    restore()
  }, [authenticated])

  return (
    <AuthContext.Provider value={{ user, setUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

/* ── Exported Providers wrapper ─────────────────────────────── */

export function Providers({ children }: { children: ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ''}
      config={{
        loginMethods: ['email', 'google'],
        embeddedWallets: {
          createOnLogin: 'all-users',
          noPromptOnSignature: true,
        },
        appearance: {
          theme: 'light',
        },
      }}
    >
      <AuthProvider>{children}</AuthProvider>
    </PrivyProvider>
  )
}
