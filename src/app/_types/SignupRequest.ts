import { z } from "zod";
import { userNameSchema, emailSchema, passwordSchema } from "./CommonSchemas";

export const signupRequestSchema = z
  .object({
    name: userNameSchema,
    email: emailSchema,
    password: passwordSchema
        .min(8, "パスワードは8文字以上で入力してください。")
        .regex(/[a-z]/, "パスワードには小文字のアルファベットを1文字以上含めてください。")
        .regex(/[A-Z]/, "パスワードには大文字のアルファベットを1文字以上含めてください。")
        .regex(/[0-9]/, "パスワードには数字を1文字以上含めてください。"),
    confirmPassword: passwordSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "パスワードが一致しません",
    path: ["confirmPassword"], // エラーメッセージを表示するフィールド
  });

export type SignupRequest = z.infer<typeof signupRequestSchema>;