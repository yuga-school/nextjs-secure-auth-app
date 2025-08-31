import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  // Cookieを削除
  cookies().delete("access_token");
  cookies().delete("refresh_token");

  return NextResponse.json({ success: true });
}