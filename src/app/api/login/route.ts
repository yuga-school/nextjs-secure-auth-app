import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/libs/prisma";
import { loginRequestSchema } from "@/app/_types/LoginRequest";
import bcrypt from "bcryptjs";
import { createAccessToken, createRefreshToken } from "../_helper/tokens";
import { userProfileSchema } from "@/app/_types/UserProfile";
import { Role } from "@/app/_types/Role"; // Roleをインポート

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME_MINUTES = 15;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = loginRequestSchema.parse(body);

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "メールアドレスまたはパスワードが正しくありません。" },
        { status: 401 }
      );
    }

    // --- アカウントロック機能 ---
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const remainingMinutes = Math.ceil((user.lockedUntil.getTime() - new Date().getTime()) / (1000 * 60));
      return NextResponse.json(
        { success: false, message: `アカウントはロックされています。約${remainingMinutes}分後にもう一度お試しください。` },
        { status: 403 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      const newFailedAttempts = user.failedLoginAttempts + 1;

      if (newFailedAttempts >= MAX_LOGIN_ATTEMPTS) {
        const lockedUntil = new Date(Date.now() + LOCK_TIME_MINUTES * 60 * 1000);
        await prisma.user.update({
          where: { email },
          data: {
            failedLoginAttempts: newFailedAttempts,
            lockedUntil: lockedUntil.toISOString(), // .toISOString() を追加
          },
        });
        return NextResponse.json(
          { success: false, message: `ログインに${MAX_LOGIN_ATTEMPTS}回失敗したため、アカウントを${LOCK_TIME_MINUTES}分間ロックします。` },
          { status: 403 }
        );
      } else {
        await prisma.user.update({
          where: { email },
          data: { failedLoginAttempts: newFailedAttempts },
        });
      }
      
      return NextResponse.json(
        { success: false, message: "メールアドレスまたはパスワードが正しくありません。" },
        { status: 401 }
      );
    }

    if (user.failedLoginAttempts > 0 || user.lockedUntil) {
      await prisma.user.update({
        where: { email },
        data: {
          failedLoginAttempts: 0,
          lockedUntil: null,
        },
      });
    }
    
    await createAccessToken({ userId: user.id, role: user.role as Role });
    await createRefreshToken(user.id);
    
    const ipAddress = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "Unknown";
    const userAgent = req.headers.get("user-agent") ?? "Unknown";

    await prisma.loginHistory.create({
      data: {
        userId: user.id,
        ipAddress,
        userAgent,
      },
    });
    
    const userProfile = userProfileSchema.parse(user);

    return NextResponse.json({ success: true, payload: userProfile });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "認証処理中にエラーが発生しました" }, { status: 500 });
  }
}