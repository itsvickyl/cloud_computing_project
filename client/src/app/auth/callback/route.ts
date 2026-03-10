import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const redirectTo = searchParams.get("redirectTo") || "/";

  if (!token) {
    return NextResponse.redirect(new URL("/auth/error", request.url));
  }

  const host = request.headers.get("host");
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  const baseUrl = host
    ? `${protocol}://${host}`
    : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  (await cookies()).set({
    name: process.env.NEXT_PUBLIC_AUTH_COOKIE_TOKEN_NAME || "talentscope_token",

    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60,
  });

  return NextResponse.redirect(new URL(redirectTo, baseUrl));
}
