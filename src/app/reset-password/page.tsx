"use client";
import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { PasswordInputField } from "@/app/_components/PasswordInputField";
import { ErrorMsgField } from "@/app/_components/ErrorMsgField";
import { Button } from "@/app/_components/Button";
import toast from "react-hot-toast";
import PasswordStrengthMeter from "@/app/_components/PasswordStrengthMeter";

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "パスワードは8文字以上で入力してください。"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "パスワードが一致しません",
    path: ["confirmPassword"],
  });

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [isPending, setIsPending] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
    setError,
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onChange",
  });

  const passwordValue = watch("password");

  const onSubmit = async (data: ResetPasswordForm) => {
    if (!token) {
      toast.error("無効なリクエストです。");
      return;
    }
    setIsPending(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: data.password }),
      });
      const result = await res.json();
      
      if (res.ok && result.success) {
        toast.success("パスワードが正常にリセットされました。ログインしてください。");
        router.push("/login");
      } else {
        toast.error(result.message || "パスワードのリセットに失敗しました。");
        setError("root", { message: result.message });
      }
    } catch (error) {
      toast.error("予期せぬエラーが発生しました。");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">新しいパスワードの設定</h1>
      {!token ? (
        <p className="text-red-500">
          無効なページです。パスワードリセットをやり直してください。
        </p>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-y-4">
          <div>
            <label htmlFor="password" className="mb-2 block font-bold">
              新しいパスワード
            </label>
            <PasswordInputField
              {...register("password")}
              id="password"
              disabled={isPending}
              error={!!errors.password}
              autoComplete="new-password"
            />
            <ErrorMsgField msg={errors.password?.message} />
            <PasswordStrengthMeter password={passwordValue} />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="mb-2 block font-bold">
              新しいパスワード（確認用）
            </label>
            <PasswordInputField
              {...register("confirmPassword")}
              id="confirmPassword"
              disabled={isPending}
              error={!!errors.confirmPassword}
              autoComplete="new-password"
            />
            <ErrorMsgField msg={errors.confirmPassword?.message} />
          </div>
          <ErrorMsgField msg={errors.root?.message} />
          <Button
            type="submit"
            isBusy={isPending}
            disabled={!isValid || isPending}
            width="stretch"
          >
            パスワードをリセット
          </Button>
        </form>
      )}
    </div>
  );
}