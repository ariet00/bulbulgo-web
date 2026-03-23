import GoogleProvider from 'next-auth/providers/google'
import { AuthOptions } from 'next-auth'


const baseURL = process.env.BACKEND_URL || 'http://localhost:8008/api/v1'

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
          }
        } catch (error) {
          console.error('Backend authentication error:', error)
          throw error
        }
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
