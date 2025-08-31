import { NextRequest, NextResponse } from "next/server";
import { RateLimiterMemory } from "rate-limiter-flexible";

const rateLimiter = new RateLimiterMemory({
  points: 10, // 15分間に10回まで
  duration: 15 * 60, // 15分 (秒単位)
});

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 対象のAPIパスかどうかを判定
  if (pathname === "/api/login" || pathname === "/api/auth/request-password-reset") {
    
    const ip = (request.headers.get("x-forwarded-for") ?? "127.0.0.1").split(',')[0].trim();

    try {
      await rateLimiter.consume(ip);
    } catch (error) {
      // レートリミットを超えた場合は 429 Too Many Requests を返す
      return new NextResponse("Too Many Requests", { status: 429 });
    }
  }
  
  // 対象外のパスはそのまま処理を続行
  return NextResponse.next();
}

export const config = {
  // matcherに対象パスを指定することで、不要なミドルウェアの実行を防ぐ
  matcher: ["/api/login", "/api/auth/request-password-reset"],
};