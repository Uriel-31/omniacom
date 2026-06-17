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

// Routes qui necessitent une authentification
const protectedRoutes = ["/dashboard", "/profile", "/settings"];

// Routes accessibles uniquement aux visiteurs non connectes
const authRoutes = ["/auth/login", "/auth/register"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken =
    request.cookies.get("access_token")?.value ||
    request.headers.get("authorization")?.replace("Bearer ", "");

  // Route protegee : verifier le token
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    if (!accessToken) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Route d'auth : rediriger vers le dashboard si deja connecte
  if (authRoutes.some((route) => pathname.startsWith(route))) {
    if (accessToken) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
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
