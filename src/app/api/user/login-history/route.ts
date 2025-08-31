import { NextResponse } from "next/server";
import { prisma } from "@/libs/prisma";
import { verifyAccessToken } from "@/app/api/_helper/tokens";

export async function GET() {
  const userPayload = await verifyAccessToken();
  if (!userPayload) {
    return NextResponse.json({ success: false, message: "認証されていません" }, { status: 401 });
  }

  try {
    const loginHistories = await prisma.loginHistory.findMany({
      where: { userId: userPayload.userId },
      orderBy: { createdAt: "desc" },
      take: 10, // 最新10件を取得
    });

    return NextResponse.json({ success: true, payload: loginHistories });
  } catch (error) {
    return NextResponse.json({ success: false, message: "履歴の取得に失敗しました" }, { status: 500 });
  }
}