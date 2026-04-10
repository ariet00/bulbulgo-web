import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextRequest, NextResponse, userAgent } from "next/server";
import { getToken } from "next-auth/jwt";

const intlMiddleware = createMiddleware(routing);

export async function proxy(req: NextRequest) {
    const pathname = req.nextUrl.pathname;
    const { device } = userAgent(req);

    // Remove locale prefix to check path
    const pathnameWithoutLocale = pathname.replace(/^\/(en|ru)/, "");

    // Skip auth check for public assets and api
    const isPublic = pathnameWithoutLocale === "" || 
                     pathnameWithoutLocale === "/" ||
                     pathnameWithoutLocale.startsWith("/_next") ||
                     pathnameWithoutLocale.startsWith("/api") ||
                     pathname.includes(".");

    if (!isPublic) {
        const token = await getToken({ req, raw: true });
        
        if (!token) {
            // Get the current locale to construct the login URL
            const localeMatch = pathname.match(/^\/(en|ru)/);
            const locale = localeMatch ? localeMatch[1] : routing.defaultLocale;

            // Redirect to the main application's login page
            // Assuming the main app is on port 3000 and shared session/cookie domain
            const mainAppUrl = process.env.NEXT_PUBLIC_MAIN_APP_URL || "http://localhost:3000";
            const signInUrl = new URL(`${mainAppUrl}/${locale}/login`, req.url);
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
