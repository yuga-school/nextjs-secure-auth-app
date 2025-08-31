"use client";
import { useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/app/_components/Button";
import { TextInputField } from "@/app/_components/TextInputField";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ErrorMsgField } from "@/app/_components/ErrorMsgField";

const ForgotPasswordSchema = z.object({
  email: z.string().email({ message: "有効なメールアドレスを入力してください。" }),
});
type ForgotPasswordForm = z.infer<typeof ForgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isPending, setIsPending] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(ForgotPasswordSchema),
    mode: "onChange",
  });

  const onSubmit = async ({ email }: ForgotPasswordForm) => {
    setIsPending(true);
    try {
      const res = await fetch("/api/auth/request-password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.message);
        reset(); // フォームをリセット
      } else {
        toast.error(data.message || "リクエストに失敗しました。");
      }
    } catch (error) {
      toast.error("予期せぬエラーが発生しました。");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">パスワードを忘れた場合</h1>
      <p className="mb-4 text-gray-600">
        ご登録のメールアドレスを入力してください。パスワードリセット用のリンクを送信します。
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-y-4">
        <div>
          <TextInputField
            {...register("email")}
            placeholder="登録したメールアドレス"
            type="email"
            disabled={isPending}
            error={!!errors.email}
          />
          <ErrorMsgField msg={errors.email?.message} />
        </div>
        <Button
          type="submit"
          isBusy={isPending}
          disabled={!isValid || isPending}
          width="stretch"
        >
          リセットメールを送信
        </Button>
      </form>
    </div>
  );
}