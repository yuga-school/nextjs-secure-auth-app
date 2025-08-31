import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  // `cookies()` を await で呼び出し、クッキーストアを取得
  const cookieStore = await cookies();

  // 取得したクッキーストアを使ってCookieを削除
  cookieStore.delete("access_token");
  cookieStore.delete("refresh_token");

  return NextResponse.json({ success: true });
}