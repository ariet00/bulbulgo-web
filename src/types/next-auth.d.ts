import NextAuth, { DefaultSession } from "next-auth"
import { JWT } from "next-auth/jwt"
import { User } from "@/types"

declare module "next-auth" {
    /**
     * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
     */
    interface Session {
        accessToken?: string
        refreshToken?: string
        error?: string
        user: User & DefaultSession["user"]
    }
}

declare module "next-auth/jwt" {
    /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
    interface JWT {
        accessToken?: string
        refreshToken?: string
        idToken?: string
        error?: string
    }
}
