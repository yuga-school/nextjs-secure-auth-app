// src/app/api/_helper/tokens.ts
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { randomBytes, createHash } from "crypto";
import { prisma } from "@/libs/prisma";
import { Role } from "@/app/_types/Role";

const secretKey = new TextEncoder().encode(process.env.JWT_SECRET);
const ACCESS_TOKEN_EXPIRATION = "15m"; // 15分
const REFRESH_TOKEN_EXPIRATION_DAYS = 7; // 7日

export interface UserPayload {
  userId: string;
  role: Role;
}

// アクセストークンを生成してHttpOnly Cookieにセット
export const createAccessToken = async (payload: UserPayload) => {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_EXPIRATION)
    .sign(secretKey);

  cookies().set("access_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  });
};

// リフレッシュトークンを生成・保存し、HttpOnly Cookieにセット
export const createRefreshToken = async (userId: string) => {
  const refreshToken = randomBytes(32).toString("hex");
  const hashedToken = createHash("sha256").update(refreshToken).digest("hex");

  // 既存のトークンを無効化
  await prisma.refreshToken.updateMany({
    where: { userId: userId, revoked: false },
    data: { revoked: true },
  });

  await prisma.refreshToken.create({
    data: {
      userId,
      hashedToken,
    },
  });

  cookies().set("refresh_token", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    expires: new Date(Date.now() + REFRESH_TOKEN_EXPIRATION_DAYS * 24 * 60 * 60 * 1000),
  });
};

// アクセストークンを検証
export const verifyAccessToken = async (): Promise<UserPayload | null> => {
  const token = cookies().get("access_token")?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secretKey);
    return payload as UserPayload;
  } catch (error) {
    return null;
  }
};