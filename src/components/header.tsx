"use client";

import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function Header() {
  const { data: session } = useSession();

  if (!session) return null;

  return (
    <header className="border-b bg-white px-6 py-3 flex items-center justify-end gap-3">
      <span className="text-sm text-gray-700">
        {session.user?.name ?? session.user?.email}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => signOut({ callbackUrl: "/login" })}
      >
        ログアウト
      </Button>
    </header>
  );
}
