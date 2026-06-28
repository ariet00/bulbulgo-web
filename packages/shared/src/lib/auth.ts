import GoogleProvider from 'next-auth/providers/google'
import { AuthOptions } from 'next-auth'


const baseURL = process.env.NEXT_PUBLIC_API_URL

// Refresh the backend access token a bit before it actually expires.
const REFRESH_BUFFER_MS = 60 * 1000

/** Read the `exp` (ms) out of a backend JWT, or null if it can't be parsed. */
function getJwtExpMs(jwt?: string): number | null {
  try {
    const payload = jwt?.split('.')[1]
    if (!payload) return null
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
    return typeof decoded.exp === 'number' ? decoded.exp * 1000 : null
  } catch {
    return null
  }
}

/**
 * Exchange the (non-rotating) backend refresh token for a fresh access token.
 * On failure marks the token with `error` so the session callback can surface it
 * and the client can force a re-login.
 */
async function refreshBackendToken(token: any) {
  try {
    if (!token.refreshToken) throw new Error('No refresh token')
    const res = await fetch(
      `${baseURL}/auth/refresh-token?refresh_token=${encodeURIComponent(token.refreshToken)}`,
      { method: 'POST' },
    )
    if (!res.ok) throw new Error(`Refresh failed with status ${res.status}`)
    const data = await res.json()
    const accessToken = data.access_token
    return {
      ...token,
      accessToken,
      // Backend returns the same refresh token, but honour a rotated one if sent.
      refreshToken: data.refresh_token ?? token.refreshToken,
      accessTokenExpires: getJwtExpMs(accessToken) ?? Date.now() + 5 * 60 * 1000,
      error: undefined,
    }
  } catch (error) {
    console.error('Failed to refresh backend token:', error)
    return { ...token, error: 'RefreshAccessTokenError' }
  }
}

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      httpOptions: {
        timeout: 20000,
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }: { token: any, account: any }) {
      // Initial sign in
      if (account && account.id_token) {
        try {
          const response = await fetch(`${baseURL}/auth/google`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              id_token: account.id_token,
            }),
          })

          if (!response.ok) {
            const data = await response.json()
            console.error(`Backend responded with status: ${response.status}`)
            console.log('data', data)
            throw new Error('BackendAuthenticationError')
          } else {
            const data = await response.json()
            console.log('data', data)
            token.accessToken = data.access_token
            token.refreshToken = data.refresh_token
            token.user = data.user
            token.accessTokenExpires =
              getJwtExpMs(data.access_token) ?? Date.now() + 5 * 60 * 1000
          }
        } catch (error) {
          console.error('Backend authentication error:', error)
          throw error
        }
        return token
      }

      // Subsequent calls (getServerSession / useSession): refresh the backend
      // access token when it's expired or about to expire. The refresh token is
      // reusable server-side, so this is safe even if the rotated cookie isn't
      // persisted back on a given request.
      if (token.accessToken && token.refreshToken) {
        const expires =
          (token.accessTokenExpires as number | undefined) ??
          getJwtExpMs(token.accessToken as string)
        if (expires && Date.now() < expires - REFRESH_BUFFER_MS) {
          return token
        }
        return await refreshBackendToken(token)
      }

      return token
    },
    async session({ session, token }: { session: any, token: any }) {
      session.accessToken = token.accessToken
      session.refreshToken = token.refreshToken
      session.user = token.user
      session.error = token.error
      return session
    },
  },
  events: {
    async signOut({ token }: { token: any }) {
      try {
        await fetch(`${baseURL}/auth/logout`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token?.accessToken}`,
          },
        })
      } catch (error) {
        console.error('Error logging out from backend:', error)
      }
    },
  },
  pages: {
    signIn: '/login',
    signOut: '/',
  },
}
