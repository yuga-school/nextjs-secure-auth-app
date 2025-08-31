import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/libs/prisma";
import { z } from "zod";
import { createHash } from "crypto";
import bcrypt from "bcryptjs";

const resetSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8), // パスワード強度の要件をここにも追加
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, password } = resetSchema.parse(body);

    const hashedToken = createHash("sha256").update(token).digest("hex");

    const user = await prisma.user.findUnique({
      where: { passwordResetToken: hashedToken },
    });

    if (!user || !user.passwordResetTokenExpires || user.passwordResetTokenExpires < new Date()) {
      return NextResponse.json({ success: false, message: "トークンが無効か、有効期限が切れています。" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetTokenExpires: null,
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    });

    return NextResponse.json({ success: true, message: "パスワードが正常にリセットされました。" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "処理中にエラーが発生しました。" }, { status: 500 });
  }
}