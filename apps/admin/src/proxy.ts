import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextRequest, NextResponse, userAgent } from "next/server";
import { getToken } from "next-auth/jwt";
import { log } from "console";

const intlMiddleware = createMiddleware(routing);

// This is an admin-only app: every path requires an authenticated admin
// EXCEPT the login page itself.
const publicPathPrefixes = [
    "/login"
];

export async function proxy(req: NextRequest) {
    const pathname = req.nextUrl.pathname;
    const { device } = userAgent(req)

    // Remove locale prefix to check path
    const pathnameWithoutLocale = pathname.replace(/^\/(en|ru)/, "");

    const isPublic = publicPathPrefixes.some(prefix =>
        pathnameWithoutLocale === prefix ||
        pathnameWithoutLocale.startsWith(`${prefix}/`)
    );

    if (!isPublic) {
        const localeMatch = pathname.match(/^\/(en|ru)/);
        const locale = localeMatch ? localeMatch[1] : routing.defaultLocale;

        // Decoded token so we can read the user's role.
        const token = await getToken({ req });

        if (!token) {
            const signInUrl = new URL(`/${locale}/login`, req.url);
            signInUrl.searchParams.set("callbackUrl", req.url);
            return NextResponse.redirect(signInUrl);
        }

        // Logged in but not an admin → deny access entirely.
        const roleSlug = (token.user as { role_slug?: string } | undefined)?.role_slug;
        if (roleSlug !== "admin") {
            const signInUrl = new URL(`/${locale}/login`, req.url);
            signInUrl.searchParams.set("error", "forbidden");
            return NextResponse.redirect(signInUrl);
        }
    }
    const response = intlMiddleware(req);
    response.headers.set("x-is-mobile", device.type === "mobile" ? "true" : "false");
    return response;
}

export const config = {
    // Match all request paths except for the ones starting with:
    // - api (API routes)
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.ico (favicon file)
    // - images (public images)
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico|images|.*\\..*).*)"],
};
