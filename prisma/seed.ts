// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import { userSeedSchema } from "../src/app/_types/UserSeed";
import { Role } from "../src/app/_types/Role";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // 既存のデータを削除
  await prisma.user.deleteMany();

  const userSeeds = [
    {
      name: "管理者ユーザー",
      password: "password-admin",
      email: "admin@example.com",
      role: Role.ADMIN,
    },
    {
      name: "一般ユーザー",
      password: "password-user",
      email: "user@example.com",
      role: Role.USER,
    },
  ];

  // zodでバリデーション
  userSeedSchema.array().parse(userSeeds);

  // パスワードをハッシュ化してユーザーを作成
  await Promise.all(
    userSeeds.map(async (userSeed) => {
      const hashedPassword = await bcrypt.hash(userSeed.password, 10);
      await prisma.user.create({
        data: {
          name: userSeed.name,
          email: userSeed.email,
          password: hashedPassword,
          role: userSeed.role,
        },
      });
    })
  );

  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });