"use client";

import NextLink from "next/link";
import { useAuth } from "@/app/_hooks/useAuth";
import {
  faRightFromBracket,
  faRightToBracket,
  faSpinner,
  faUserPlus, // ★ サインアップ用アイコンをインポート
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "@/app/_components/Button";

export const Header = () => {
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    // ログアウト後にトップページなどにリダイレクト（任意）
    window.location.href = "/";
  };

  return (
    <header className="bg-slate-800 p-4 text-white">
      <div className="mx-auto flex max-w-3xl items-center justify-between">
        <NextLink href="/" className="text-xl font-bold">
          Secure App
        </NextLink>

        <nav>
          {isLoading ? (
            // ローディング中はスピナーを表示
            <FontAwesomeIcon icon={faSpinner} spin />
          ) : isAuthenticated && user ? (
            // ログイン済みの場合
            <div className="flex items-center gap-x-4">
              <span>{user.name} さん</span>
              <Button
                variant="light"
                onClick={handleLogout}
                className="flex items-center gap-x-1.5"
              >
                <FontAwesomeIcon icon={faRightFromBracket} />
                ログアウト
              </Button>
            </div>
          ) : (
            // 未ログインの場合
            <div className="flex items-center gap-x-2">
              {/* ★★★ ここからが追加箇所 ★★★ */}
              <NextLink href="/signup">
                <Button
                  variant="ghost"
                  className="flex items-center gap-x-1.5"
                >
                  <FontAwesomeIcon icon={faUserPlus} />
                  サインアップ
                </Button>
              </NextLink>
              {/* ★★★ ここまでが追加箇所 ★★★ */}
              <NextLink href="/login">
                <Button
                  variant="light"
                  className="flex items-center gap-x-1.5"
                >
                  <FontAwesomeIcon icon={faRightToBracket} />
                  ログイン
                </Button>
              </NextLink>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};