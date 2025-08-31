"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginRequest, loginRequestSchema } from "@/app/_types/LoginRequest";
import { ErrorMsgField } from "@/app/_components/ErrorMsgField";
import { Button } from "@/app/_components/Button";
import { faRightToBracket } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { TextInputField } from "@/app/_components/TextInputField";
import { PasswordInputField } from "@/app/_components/PasswordInputField";
import { useAuth } from "@/app/_hooks/useAuth";

const Page: React.FC = () => {
  const c_Email = "email";
  const c_Password = "password";

  const router = useRouter();
  const { login, isLoading: isAuthLoading } = useAuth();
  const [isPending, setIsPending] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    clearErrors,
    formState: { errors, isValid },
  } = useForm<LoginRequest>({
    mode: "onChange",
    resolver: zodResolver(loginRequestSchema),
  });

  const setRootError = (errorMsg: string) => {
    setError("root", {
      type: "manual",
      message: errorMsg,
    });
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const email = searchParams.get(c_Email);
    setValue(c_Email, email || "");
  }, [setValue]);

  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === c_Email || name === c_Password) {
        clearErrors("root");
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, clearErrors]);

  const onSubmit = async (loginRequest: LoginRequest) => {
    setIsPending(true);
    try {
      const loggedInUser = await login(loginRequest);
      if (loggedInUser) {
        toast.success(`ようこそ、${loggedInUser.name}さん！`);
        router.push("/member/about");
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "予期せぬエラーが発生しました。";
      setRootError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsPending(false);
    }
  };
  
  if (isAuthLoading) {
    return <div>読み込み中...</div>;
  }

  return (
    <main>
      <div className="text-2xl font-bold">
        <FontAwesomeIcon icon={faRightToBracket} className="mr-1.5" />
        Login
      </div>
      <div className="mt-4 text-center">
        <a href="/forgot-password" className="text-sm text-blue-600 hover:underline">
          パスワードを忘れた場合はこちら
        </a>
      </div>
      <form
        noValidate
        onSubmit={handleSubmit(onSubmit)}
        className="mt-4 flex flex-col gap-y-4"
      >
        <div>
          <label htmlFor={c_Email} className="mb-2 block font-bold">
            メールアドレス（ログインID）
          </label>
          <TextInputField
            {...register(c_Email)}
            id={c_Email}
            placeholder="name@example.com"
            type="email"
            disabled={isPending}
            error={!!errors.email}
            autoComplete="email"
          />
          <ErrorMsgField msg={errors.email?.message} />
        </div>

        <div>
          <label htmlFor={c_Password} className="mb-2 block font-bold">
            パスワード
          </label>
          <PasswordInputField
            {...register(c_Password)}
            id={c_Password}
            placeholder="*****"
            disabled={isPending}
            error={!!errors.password}
            autoComplete="current-password"
          />
          <ErrorMsgField msg={errors.password?.message} />
          <ErrorMsgField msg={errors.root?.message} />
        </div>

        <Button
          variant="indigo"
          width="stretch"
          className="tracking-widest"
          isBusy={isPending}
          disabled={!isValid || isPending}
        >
          ログイン
        </Button>
      </form>
    </main>
  );
};

export default Page;