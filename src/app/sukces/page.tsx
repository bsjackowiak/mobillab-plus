"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SuccessRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    const token = sessionStorage.getItem("mobillab-order-token");
    if (token) {
      router.replace(`/sukces/${token}`);
      return;
    }
    router.replace("/");
  }, [router]);

  return null;
}
