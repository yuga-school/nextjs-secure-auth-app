"use client";

import React from "react";
import { useAuth } from "@/app/_hooks/useAuth";
import { faSpinner, faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import NextLink from "next/link";

interface Props {
  children: React.ReactNode;
}

const Layout: React.FC<Props> = (props) => {
  const { children } = props;

  // ★修正点1: `userProfile` を `user` に変更し、`isLoading` も取得
  const { user, isLoading } = useAuth();

  // ★修正点2: isLoading状態のハンドリングを追加
  if (isLoading) {
    return (
      <main className="flex items-center justify-center p-8">
        <FontAwesomeIcon icon={faSpinner} spin size="2x" />
        <span className="ml-2">認証情報を確認中...</span>
      </main>
    );
  }

  // 認証されていない場合の表示
  if (!user) {
    return (
      <main className="p-4">
        <div className="text-2xl font-bold">
          <FontAwesomeIcon icon={faTriangleExclamation} className="mr-1.5" />
          ログインが必要なコンテンツ
        </div>
        <div className="mt-4">
          このコンテンツを利用するためには
          <NextLink
            href={`/login`}
            className="px-1 text-blue-500 hover:underline"
          >
            ログイン
          </NextLink>
          してください。
        </div>
      </main>
    );
  }

  // 認証済みの場合のレイアウト
  return (
    <div className="container mx-auto p-4">
      <nav className="mb-8 border-b pb-4">
        <ul className="flex space-x-6">
          <li>
            <NextLink href="/member/about" className="text-gray-600 hover:text-blue-500">
              プロフィール
            </NextLink>
          </li>
          <li>
            <NextLink href="/member/history" className="text-gray-600 hover:text-blue-500">
              ログイン履歴
            </NextLink>
          </li>
        </ul>
      </nav>
      {/* 認証済みの場合のみ子コンポーネントを表示 */}
      <main>{children}</main>
    </div>
  );
};

export default Layout;