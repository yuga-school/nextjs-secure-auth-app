// src/app/api/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/libs/prisma";
import { loginRequestSchema } from "@/app/_types/LoginRequest";
import bcrypt from "bcryptjs";
import { createAccessToken, createRefreshToken } from "../_helper/tokens";
import { userProfileSchema } from "@/app/_types/UserProfile";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = loginRequestSchema.parse(body);

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({ success: false, message: "メールアドレスまたはパスワードが正しくありません。" }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ success: false, message: "メールアドレスまたはパスワードが正しくありません。" }, { status: 401 });
    }

    await createAccessToken({ userId: user.id, role: user.role });
    await createRefreshToken(user.id);
    
    const userProfile = userProfileSchema.parse(user);

    return NextResponse.json({ success: true, payload: userProfile });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "認証処理中にエラーが発生しました" }, { status: 500 });
  }
}