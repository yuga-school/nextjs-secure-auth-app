import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { prisma } from "@/libs/prisma";
import { createAccessToken, createRefreshToken } from "../../_helper/tokens";
import { Role } from "@/app/_types/Role";

export async function POST(req: NextRequest) {
  const refreshToken = cookies().get("refresh_token")?.value;
  if (!refreshToken) {
    return NextResponse.json({ success: false, message: "Refresh token not found." }, { status: 401 });
  }

  try {
    const hashedToken = createHash("sha256").update(refreshToken).digest("hex");

    const dbToken = await prisma.refreshToken.findUnique({
      where: { hashedToken },
      include: { user: true },
    });

    // トークンが存在しない、または既に使用済み
    if (!dbToken || dbToken.revoked) {
      // 不正利用の可能性があるため、このユーザーの全トークンを無効化
      if (dbToken) {
        await prisma.refreshToken.updateMany({
          where: { userId: dbToken.userId },
          data: { revoked: true },
        });
      }
      // Cookieを削除
      cookies().set("access_token", "", { expires: new Date(0) });
      cookies().set("refresh_token", "", { expires: new Date(0) });
      return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
    }

    // --- トークンローテーション ---
    // 1. 現在のトークンを使用済み（revoked）にする
    await prisma.refreshToken.update({
      where: { id: dbToken.id },
      data: { revoked: true },
    });

    // 2. 新しいアクセストークンとリフレッシュトークンを生成
    await createAccessToken({ userId: dbToken.user.id, role: dbToken.user.role as Role });
    await createRefreshToken(dbToken.user.id);

    return NextResponse.json({ success: true, message: "Tokens refreshed." });
  } catch (error) {
    console.error("Refresh token error:", error);
    return NextResponse.json({ success: false, message: "Internal server error." }, { status: 500 });
  }
}