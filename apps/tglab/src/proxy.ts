import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

// Auth is a bearer token in localStorage (no next-auth cookie here), so the
// middleware only does locale routing — the cabinet layout guards the pages.
export default createMiddleware(routing)

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|images|.*\\..*).*)'],
}
