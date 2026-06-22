"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { HOME_BY_ROLE } from "@/lib/constants";
import { Loader } from "@/components/app/brand/Logo";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    router.replace(user ? HOME_BY_ROLE[user.role] : "/login");
  }, [user, loading, router]);

  return <Loader />;
}
