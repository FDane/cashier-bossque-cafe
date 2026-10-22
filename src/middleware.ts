import { NextRequest, NextResponse } from "next/server";
const COOKIE = "bossque_cafe_session";
export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (path === "/login" || path.startsWith("/_next/") || path.startsWith("/api/auth/") || path.includes(".")) return NextResponse.next();
  if (request.cookies.has(COOKIE)) return NextResponse.next();
  if (path.startsWith("/api/")) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  const url = request.nextUrl.clone(); url.pathname = "/login"; url.searchParams.set("next", path); return NextResponse.redirect(url);
}
export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };