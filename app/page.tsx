"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

function getTokenFromCookies() {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)token=([^;]+)/);
  return match ? match[1] : null;
}

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    const token = getTokenFromCookies() || window.localStorage.getItem("token");

    if (token) {
      router.replace("/dashboard");
    } else {
      router.replace("/login");
    }
  }, [router]);

  return null;
}
