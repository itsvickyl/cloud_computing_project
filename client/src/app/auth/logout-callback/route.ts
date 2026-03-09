import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const frontendCookieName = process.env.AUTH_COOKIE_NAME || "talentscope-auth-token";

  const host = request.headers.get("host");
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  const baseUrl = host
    ? `${protocol}://${host}`
    : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  (await cookies()).delete(frontendCookieName);

  return NextResponse.redirect(new URL(baseUrl));
}
