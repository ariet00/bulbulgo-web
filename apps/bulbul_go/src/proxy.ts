import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextRequest, NextResponse, userAgent } from "next/server";
import { getToken } from "next-auth/jwt";
import { log } from "console";
import { STORE_LINKS } from "@/lib/store-links";

const intlMiddleware = createMiddleware(routing);

const protectedPathPrefixes = [
    "/dashboard",
    "/account",
    "/messages",
    "/my-companies",
    "/company",
];

// Маркетинговый сайт go.bulbul.asia (route-группа (marketing)) — без локали и
// без next-intl-редиректа. Пути совпадают с оригинальным сайтом (важно для
// AASA-путей и внешних ссылок).
const marketingPaths = new Set([
    "/",
    "/news",
    "/faq",
    "/support",
    "/privacy",
    "/terms",
    "/download",
]);

function isMarketingPath(pathname: string) {
    return (
        marketingPaths.has(pathname) ||
        pathname.startsWith("/news/") ||
        // Реферальные инвайт-ссылки /i/<code> — без локали и intl-редиректа.
        pathname.startsWith("/i/") ||
        // og-баннеры (marketing)-группы: Next добавляет к роуту хэш-суффикс
        // (/opengraph-image-<hash>), поэтому матчим по префиксу
        pathname.startsWith("/opengraph-image") ||
        pathname.startsWith("/download/opengraph-image")
    );
}

export async function proxy(req: NextRequest) {
    const pathname = req.nextUrl.pathname;
    const { device } = userAgent(req)

    // /download: мобильные сразу получают 307 в стор с edge, не загружая
    // страницу. Боты (превью Telegram/WhatsApp, краулеры) и десктоп получают
    // статичную страницу с OG-тегами; useEffect на ней остаётся фолбэком.
    // if (pathname === "/download") {
    //     const { os, isBot } = userAgent(req);
    //     if (!isBot) {
    //         if (os.name === "iOS") {
    //             return NextResponse.redirect(STORE_LINKS.appStore);
    //         }
    //         if (os.name === "Android") {
    //             return NextResponse.redirect(STORE_LINKS.playStore);
    //         }
    //     }
    // }

    if (isMarketingPath(pathname)) {
        return NextResponse.next();
    }

    // og-баннер [locale]-сегмента (/ru/opengraph-image*): мимо intl-миддлвары,
    // иначе она редиректит, срезая префикс дефолтной локали, и URL ломается
    if (/^\/(en|ru)\/opengraph-image/.test(pathname)) {
        return NextResponse.next();
    }

    // Remove locale prefix to check path
    const pathnameWithoutLocale = pathname.replace(/^\/(en|ru)/, "");

    // Check if the path starts with any of the protected prefixes
    const isProtected = protectedPathPrefixes.some(prefix =>
        pathnameWithoutLocale === prefix ||
        pathnameWithoutLocale.startsWith(`${prefix}/`)
    );

    if (isProtected) {
        const token = await getToken({ req, raw: true });

        if (!token) {
            // Get the current locale to construct the login URL
            const localeMatch = pathname.match(/^\/(en|ru)/);
            const locale = localeMatch ? localeMatch[1] : routing.defaultLocale;

            // Use absolute URL construction for reliability
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
    // Match all request paths except for the ones starting with:
    // - api (API routes)
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.ico (favicon file)
    // - images (public images)
    // - webview (страницы для вебвью мобильного приложения — без локали и auth-редиректов)
    // - rideshare (smart-link /rideshare/trips/:id — App Link-цель, без локали)
    // - auto (share-страница объявления авторынка /auto/:id — без локали)
    // - real_estate (share-страница объявления недвижимости /real_estate/details/:id — без локали)
    matcher: ["/((?!api|webview|rideshare|auto|real_estate|_next/static|_next/image|favicon.ico|images|.*\\..*).*)"],
};
