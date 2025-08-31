import { UserProfile } from "@/app/_types/UserProfile";

export const fetchUserProfile = async (): Promise<UserProfile | null> => {
  try {
    const res = await fetch("/api/auth", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      // サーバーサイドでCookieを自動的に読み取るため、credentialsは不要
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    if (data.success) {
      return data.payload as UserProfile;
    }
    return null;
  } catch (error) {
    console.error("Failed to fetch user profile", error);
    return null;
  }
};