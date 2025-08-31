"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/app/_hooks/useAuth";
import { fetchWithAuth } from "@/libs/fetcher";

type LoginHistory = {
  id: string;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
};

export default function HistoryPage() {
  const { user } = useAuth();
  const [histories, setHistories] = useState<LoginHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const res = await fetchWithAuth("/api/user/login-history") as Response;
        if (res.ok) {
          const data = await res.json();
          setHistories(data.payload);
        } else {
          console.error("Failed to fetch login history: ", res.statusText);
        }
      } catch (error) {
        console.error("Failed to fetch login history", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchHistory();
    }
  }, [user]);

  if (!user) {
    // このコンポーネントは /member/layout.tsx 内でレンダリングされるため、
    // 基本的にこの分岐には到達しないが、念のため残しておく
    return <p>ログインしてください。</p>;
  }
  if (loading) return <p>読み込み中...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">ログイン履歴</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-2 px-4 border-b text-left">日時</th>
              <th className="py-2 px-4 border-b text-left">IPアドレス</th>
              <th className="py-2 px-4 border-b text-left">デバイス</th>
            </tr>
          </thead>
          <tbody>
            {histories.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center py-4">ログイン履歴はありません。</td>
              </tr>
            ) : (
              histories.map((history) => (
              <tr key={history.id} className="hover:bg-gray-50">
                <td className="py-2 px-4 border-b">{new Date(history.createdAt).toLocaleString("ja-JP")}</td>
                <td className="py-2 px-4 border-b">{history.ipAddress}</td>
                <td className="py-2 px-4 border-b text-sm">{history.userAgent}</td>
              </tr>
            )))}
          </tbody>
        </table>
      </div>
    </div>
  );
}