import { NextRequest, NextResponse } from "next/server";
import { RateLimiterMemory } from "rate-limiter-flexible";

const rateLimiter = new RateLimiterMemory({
  points: 10, // 15分間に10回まで
  duration: 15 * 60, // 15分 (秒単位)
});

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === "/api/login" || request.nextUrl.pathname === "/api/auth/request-password-reset") {
    const ip = request.ip ?? "127.0.0.1";
    try {
      await rateLimiter.consume(ip);
    } catch (error) {
      return new NextResponse("Too Many Requests", { status: 429 });
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/api/login", "/api/auth/request-password-reset"],
};