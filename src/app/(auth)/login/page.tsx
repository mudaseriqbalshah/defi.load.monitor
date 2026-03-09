"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { useSiwe } from "@/lib/auth/use-siwe";
import Link from "next/link";

export default function LoginPage() {
  const { isConnected } = useAccount();
  const { login, isLoading } = useSiwe();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-sm space-y-6 rounded-lg border bg-card p-8">
        <div className="text-center">
          <Link href="/" className="text-xl font-bold">
            DeFi Load Monitor
          </Link>
          <h1 className="mt-4 text-2xl font-bold">Sign In</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Connect your wallet to get started.
          </p>
        </div>

        <div className="flex flex-col items-center gap-4">
          {/* Step 1: Connect wallet */}
          <ConnectButton />

          {/* Step 2: Sign SIWE message */}
          {isConnected && (
            <button
              onClick={login}
              disabled={isLoading}
              className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {isLoading ? "Signing..." : "Sign In with Ethereum"}
            </button>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
