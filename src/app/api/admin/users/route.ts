import { NextResponse } from "next/server";
import { prisma } from "@/libs/prisma";
import { verifyAccessToken } from "@/app/api/_helper/tokens";
import { Role } from "@/app/_types/Role";

export async function GET() {
  const userPayload = await verifyAccessToken();

  if (!userPayload || userPayload.role !== Role.ADMIN) {
    return NextResponse.json({ success: false, message: "権限がありません。" }, { status: 403 });
  }

  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        lockedUntil: true,
      }
    });
    return NextResponse.json({ success: true, payload: users });
  } catch (error) {
    return NextResponse.json({ success: false, message: "ユーザーの取得に失敗しました。" }, { status: 500 });
  }
}