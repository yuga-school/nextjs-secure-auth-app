import { NextResponse } from "next/server";
import { prisma } from "@/libs/prisma";
import { verifyAccessToken } from "../_helper/tokens";
import { userProfileSchema } from "@/app/_types/UserProfile";

export async function GET() {
  const userPayload = await verifyAccessToken();

  if (!userPayload) {
    return NextResponse.json({ success: false, message: "認証されていません" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userPayload.userId },
    });

    if (!user) {
      return NextResponse.json({ success: false, message: "ユーザーが見つかりません" }, { status: 404 });
    }

    const userProfile = userProfileSchema.parse(user);
    return NextResponse.json({ success: true, payload: userProfile });

  } catch (error) {
    return NextResponse.json({ success: false, message: "サーバーエラー" }, { status: 500 });
  }
}