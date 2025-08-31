import { NextRequest, NextResponse } from "next/server";
import { RateLimiterMemory } from "rate-limiter-flexible";
import { jwtVerify } from "jose";
import { Role } from "@/app/_types/Role";

const secretKey = new TextEncoder().encode(process.env.JWT_SECRET);

const rateLimiter = new RateLimiterMemory({
  points: 10,
  duration: 15 * 60,
});

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = (request.headers.get("x-forwarded-for") ?? "127.0.0.1").split(',')[0].trim();

  // レートリミットの対象パス
  if (pathname === "/api/login" || pathname === "/api/auth/request-password-reset") {
    try {
      await rateLimiter.consume(ip);
    } catch (error) {
      return new NextResponse("Too Many Requests", { status: 429 });
    }
  }

  // 管理者ページの認可チェック
  if (pathname.startsWith('/admin')) {
    const accessToken = request.cookies.get("access_token")?.value;
    if (!accessToken) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    try {
      const { payload } = await jwtVerify(accessToken, secretKey);
      if (payload.role !== Role.ADMIN) {
        // ADMINでなければアクセス拒否（ここではトップページにリダイレクト）
        return NextResponse.redirect(new URL('/', request.url));
      }
    } catch (err) {
      // トークンが無効な場合もログインページへ
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/login",
    "/api/auth/request-password-reset",
    "/admin/:path*", // /admin以下のすべてのパスを対象に追加
  ],
};