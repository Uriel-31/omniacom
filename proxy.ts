/**
 * Proxy Next.js pour la protection des routes.
 *
 * Verifie la presence d'un token JWT valide avant d'autoriser
 * l'acces aux routes protegees. Les routes publiques d'auth
 * redirigent vers le dashboard si l'utilisateur est deja connecte.
 *
 * Configuration :
 * - `protectedRoutes` : routes necessitant une authentification
 * - `authRoutes` : routes accessibles uniquement aux visiteurs non connectes
 *
 * Voir la documentation complete : CONTRIBUTING.md
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PATHS = ["/planning", "/epi", "/pmo", "/admin", "/profile", "/settings"];
const AUTH_PATHS = ["/auth/login", "/auth/register", "/login"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token =
    request.cookies.get("access_token")?.value ||
    request.headers.get("authorization")?.replace("Bearer ", "");

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon") ||
    pathname.match(/\.(png|jpg|jpeg|gif|webp|svg|ico)$/)
  ) {
    return NextResponse.next();
  }

  if (PROTECTED_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    if (!token) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }


  if (AUTH_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    if (token) {
      return NextResponse.redirect(new URL("/planning", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Exclure les fichiers statiques, api, _next/static, etc.
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
