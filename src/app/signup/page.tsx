"use client";
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupRequestSchema, SignupRequest } from "@/app/_types/SignupRequest";
import { signupServerAction } from "@/app/_actions/signup";
import { TextInputField } from "@/app/_components/TextInputField";
import { ErrorMsgField } from "@/app/_components/ErrorMsgField";
import { Button } from "@/app/_components/Button";
import { faUserPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import NextLink from "next/link";
import PasswordStrengthMeter from "@/app/_components/PasswordStrengthMeter";
import { PasswordInputField } from "@/app/_components/PasswordInputField";

const Page: React.FC = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
    setError,
  } = useForm<SignupRequest>({
    mode: "onChange",
    resolver: zodResolver(signupRequestSchema),
  });

  const [isPending, setIsPending] = React.useState(false);
  const [isSignUpCompleted, setIsSignUpCompleted] = React.useState(false);

  const passwordValue = watch("password");

  const onSubmit = async (data: SignupRequest) => {
    setIsPending(true);
    try {
      const res = await signupServerAction(data);
      if (!res.success) {
        setError("root", { message: res.message });
        return;
      }
      setIsSignUpCompleted(true);
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : "予期せぬエラーが発生しました。";
      setError("root", { message: errorMsg });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <main>
      <div className="text-2xl font-bold">
        <FontAwesomeIcon icon={faUserPlus} className="mr-1.5" />
        Sign Up
      </div>
      {!isSignUpCompleted ? (
        <form
          noValidate
          onSubmit={handleSubmit(onSubmit)}
          className="mt-4 flex flex-col gap-y-4"
        >
          <div>
            <label htmlFor="name" className="mb-2 block font-bold">名前</label>
            <TextInputField {...register("name")} id="name" type="text" disabled={isPending} error={!!errors.name} />
            <ErrorMsgField msg={errors.name?.message} />
          </div>
          <div>
            <label htmlFor="email" className="mb-2 block font-bold">メールアドレス</label>
            <TextInputField {...register("email")} id="email" type="email" placeholder="name@example.com" disabled={isPending} error={!!errors.email} />
            <ErrorMsgField msg={errors.email?.message} />
          </div>
          <div>
            <label htmlFor="password" className="mb-2 block font-bold">パスワード</label>
            <PasswordInputField {...register("password")} id="password" disabled={isPending} error={!!errors.password} autoComplete="new-password" />
            <ErrorMsgField msg={errors.password?.message} />
            <PasswordStrengthMeter password={passwordValue} />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="mb-2 block font-bold">パスワード（確認用）</label>
            <PasswordInputField {...register("confirmPassword")} id="confirmPassword" disabled={isPending} error={!!errors.confirmPassword} autoComplete="new-password" />
            <ErrorMsgField msg={errors.confirmPassword?.message} />
          </div>
          <ErrorMsgField msg={errors.root?.message} />
          <Button variant="indigo" width="stretch" isBusy={isPending} disabled={!isValid || isPending}>
            登録する
          </Button>
        </form>
      ) : (
        <div className="mt-4 text-center p-8 border rounded-lg">
          <h2 className="text-2xl font-bold text-green-600 mb-4">登録完了</h2>
          <p>ユーザー登録が完了しました。</p>
          <NextLink href="/login" className="text-blue-500 hover:underline mt-4 inline-block">
            ログインページへ進む
          </NextLink>
        </div>
      )}
    </main>
  );
};

export default Page;