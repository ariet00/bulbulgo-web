import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextRequest, NextResponse, userAgent } from "next/server";
import { getToken } from "next-auth/jwt";
import { log } from "console";

const intlMiddleware = createMiddleware(routing);

const protectedPathPrefixes = [
    "/ads/post",
    "/account",
    '/messages'
];

export async function proxy(req: NextRequest) {
    const pathname = req.nextUrl.pathname;
    const { device } = userAgent(req)

    // Remove locale prefix to check path
    const pathnameWithoutLocale = pathname.replace(/^\/(en|ru)/, "");

    // Check if the path starts with any of the protected prefixes
    const isProtected = protectedPathPrefixes.some(prefix =>
        pathnameWithoutLocale === prefix ||
        pathnameWithoutLocale.startsWith(`${prefix}/`)
    );

    if (isProtected) {
        const token = await getToken({ req, raw: true });
        // TODO add check for user role and admin role
        if (!token) {
            // Get the current locale to construct the login URL
            const localeMatch = pathname.match(/^\/(en|ru)/);
            const locale = localeMatch ? localeMatch[1] : routing.defaultLocale;

            const signInUrl = new URL(`/${locale}/login`, req.url);
            signInUrl.searchParams.set("callbackUrl", pathname);

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
