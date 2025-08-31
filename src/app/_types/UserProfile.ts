import { z } from "zod";
import {
  uuidSchema,
  userNameSchema,
  emailSchema,
  roleSchema,
} from "./CommonSchemas";

// Zodスキーマを拡張して、必要なフィールドを追加
export const userProfileSchema = z.object({
  id: uuidSchema,
  name: userNameSchema,
  email: emailSchema,
  role: roleSchema,
  createdAt: z.date().optional(), 
  lockedUntil: z.date().nullable().optional(),
});

export type UserProfile = z.infer<typeof userProfileSchema>;