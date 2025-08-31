"use client";

import { useEffect, useState } from 'react';
import { fetchWithAuth } from '@/libs/fetcher';
import { UserProfile } from '@/app/_types/UserProfile';

// UserProfileから必要なキーをPickする。`createdAt`と`lockedUntil`も含まれるようになった。
type AdminUserView = Pick<UserProfile, 'id' | 'email' | 'name' | 'role' | 'createdAt' | 'lockedUntil'>;

const AdminUsersPage = () => {
  const [users, setUsers] = useState<AdminUserView[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getUsers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetchWithAuth('/api/admin/users') as Response;
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'ユーザー情報の取得に失敗しました。');
        }
        const data = await res.json();
        // APIからのデータは日付が文字列になっているため、Dateオブジェクトに変換
        const formattedUsers = data.payload.map((user: AdminUserView) => ({
          ...user,
          createdAt: user.createdAt ? new Date(user.createdAt) : null,
          lockedUntil: user.lockedUntil ? new Date(user.lockedUntil) : null,
        }));
        setUsers(formattedUsers);
      } catch (err) {
        setError(err instanceof Error ? err.message : '不明なエラーが発生しました。');
      } finally {
        setIsLoading(false);
      }
    };
    getUsers();
  }, []);

  if (isLoading) return <div className="text-center p-8">読み込み中...</div>;
  if (error) return <div className="text-red-500 text-center p-8">エラー: {error}</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">ユーザー管理</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-2 px-4 border-b text-left">名前</th>
              <th className="py-2 px-4 border-b text-left">メールアドレス</th>
              <th className="py-2 px-4 border-b text-left">役割</th>
              <th className="py-2 px-4 border-b text-left">登録日時</th>
              <th className="py-2 px-4 border-b text-left">ステータス</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="py-2 px-4 border-b">{user.name}</td>
                <td className="py-2 px-4 border-b">{user.email}</td>
                <td className="py-2 px-4 border-b">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${user.role === 'ADMIN' ? 'bg-red-200 text-red-800' : 'bg-green-200 text-green-800'}`}>
                    {user.role}
                  </span>
                </td>
                <td className="py-2 px-4 border-b">{user.createdAt?.toLocaleDateString("ja-JP")}</td>
                <td className="py-2 px-4 border-b">
                  {user.lockedUntil && new Date(user.lockedUntil) > new Date() ? (
                    <span className="text-red-500 font-bold">ロック中</span>
                  ) : (
                    <span className="text-green-600">アクティブ</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsersPage;