"use client";

import { useSession } from "next-auth/react";
import { useSiwe } from "@/lib/auth/use-siwe";
import { shortenAddress } from "@/lib/utils";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export function UserMenu() {
  const { data: session } = useSession();
  const { logout } = useSiwe();

  if (!session?.user) {
    return <ConnectButton />;
  }

  return (
    <div className="flex items-center gap-3">
      <div className="text-right">
        <p className="text-sm font-medium">
          {session.user.name && session.user.name !== session.user.address
            ? session.user.name
            : shortenAddress(session.user.address)}
        </p>
        <p className="text-xs text-muted-foreground">
          {shortenAddress(session.user.address)}
        </p>
      </div>
      <button
        onClick={logout}
        className="rounded-md border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      >
        Sign Out
      </button>
    </div>
  );
}
