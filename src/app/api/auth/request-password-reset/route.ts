import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/libs/prisma";
import { z } from "zod";
import { randomBytes, createHash } from "crypto";
import { sendEmail } from "@/libs/mailer";

const requestSchema = z.object({
  email: z.string().email(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = requestSchema.parse(body);

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // ユーザーが存在しない場合でも、攻撃者にヒントを与えないため成功したかのように見せかける
      return NextResponse.json({ success: true, message: "パスワードリセット用のメールを送信しました。" });
    }

    const resetToken = randomBytes(32).toString("hex");
    const hashedResetToken = createHash("sha256").update(resetToken).digest("hex");

    const expires = new Date(Date.now() + 3600000); // 1時間有効

    await prisma.user.update({
      where: { email },
      data: {
        passwordResetToken: hashedResetToken,
        // new Date() を .toISOString() で文字列に変換する
        passwordResetTokenExpires: expires.toISOString(),
      },
    });

    const resetUrl = `${req.nextUrl.origin}/reset-password?token=${resetToken}`;

    await sendEmail({
      to: user.email,
      subject: "パスワードリセットのご案内",
      html: `<p>パスワードをリセットするには、以下のリンクをクリックしてください：</p><a href="${resetUrl}">${resetUrl}</a><p>このリンクは1時間有効です。</p>`,
    });

    return NextResponse.json({ success: true, message: "パスワードリセット用のメールを送信しました。" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "処理中にエラーが発生しました。" }, { status: 500 });
  }
}