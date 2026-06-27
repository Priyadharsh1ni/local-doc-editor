import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  const protectedRoutes = ["/dashboard", "/editor"];

  if (
    protectedRoutes.some(route => req.nextUrl.pathname.startsWith(route)) &&
    !token
  ) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (req.nextUrl.pathname === "/login" && token) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}