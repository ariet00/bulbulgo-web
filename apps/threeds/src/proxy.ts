import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextRequest, NextResponse, userAgent } from "next/server";
import { getToken } from "next-auth/jwt";

const intlMiddleware = createMiddleware(routing);

const protectedPathPrefixes = [
    "/",
];

export async function proxy(req: NextRequest) {
    const pathname = req.nextUrl.pathname;
    const { device } = userAgent(req);

    // Remove locale prefix to check path
    const pathnameWithoutLocale = pathname.replace(/^\/(en|ru)/, "") || "/";

    // Check if the path starts with any of the protected prefixes
    const isProtected = protectedPathPrefixes.some(prefix =>
        pathnameWithoutLocale === prefix ||
        (prefix === "/" ? true : pathnameWithoutLocale.startsWith(`${prefix}/`))
    );

    if (isProtected) {
        const token = await getToken({ req, raw: true });

        if (!token) {
            // Get the current locale to construct the login URL
            const localeMatch = pathname.match(/^\/(en|ru)/);
            const locale = localeMatch ? localeMatch[1] : routing.defaultLocale;

            // Redirect to the local application's login page
            const signInUrl = new URL(`/${locale}/login`, req.url);
            signInUrl.searchParams.set("callbackUrl", req.url);

            return NextResponse.redirect(signInUrl);
        }
    }

    const response = intlMiddleware(req);
    response.headers.set("x-is-mobile", device.type === "mobile" ? "true" : "false");
    return response;
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico|images|.*\\..*).*)"],
};
