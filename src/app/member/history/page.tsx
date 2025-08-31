"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/app/_hooks/useAuth";

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
        const res = await fetch("/api/user/login-history");
        if (res.ok) {
          const data = await res.json();
          setHistories(data.payload);
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

  if (!user) return <p>ログインしてください。</p>;
  if (loading) return <p>読み込み中...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">ログイン履歴</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">日時</th>
              <th className="py-2 px-4 border-b">IPアドレス</th>
              <th className="py-2 px-4 border-b">デバイス</th>
            </tr>
          </thead>
          <tbody>
            {histories.map((history) => (
              <tr key={history.id}>
                <td className="py-2 px-4 border-b">{new Date(history.createdAt).toLocaleString()}</td>
                <td className="py-2 px-4 border-b">{history.ipAddress}</td>
                <td className="py-2 px-4 border-b text-sm">{history.userAgent}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}