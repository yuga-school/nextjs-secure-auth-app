"use client";

import NextLink from "next/link";
import { useAuth } from "@/app/_hooks/useAuth";
import {
  faRightFromBracket,
  faRightToBracket,
  faSpinner,
  faUserPlus,
  faUserShield, // ADMIN用アイコン
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "@/app/_components/Button";
import { Role } from "@/app/_types/Role";

export const Header = () => {
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="bg-slate-800 p-4 text-white">
      <div className="mx-auto flex max-w-3xl items-center justify-between">
        <NextLink href="/" className="text-xl font-bold">
          Secure App
        </NextLink>

        <nav>
          {isLoading ? (
            <FontAwesomeIcon icon={faSpinner} spin />
          ) : isAuthenticated && user ? (
            <div className="flex items-center gap-x-4">
              {/* ADMINの場合のみ管理者ダッシュボードへのリンクを表示 */}
              {user.role === Role.ADMIN && (
                <NextLink href="/admin/users" title="管理者ダッシュボード">
                  <FontAwesomeIcon icon={faUserShield} className="text-lg hover:text-yellow-400" />
                </NextLink>
              )}
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
            <div className="flex items-center gap-x-2">
              <NextLink href="/signup">
                <Button variant="ghost" className="flex items-center gap-x-1.5">
                  <FontAwesomeIcon icon={faUserPlus} />
                  サインアップ
                </Button>
              </NextLink>
              <NextLink href="/login">
                <Button variant="light" className="flex items-center gap-x-1.5">
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