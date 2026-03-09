"use client";

import { useAccount, useSignMessage } from "wagmi";
import { signIn, signOut } from "next-auth/react";
import { SiweMessage } from "siwe";
import { useCallback, useState } from "react";

export function useSiwe() {
  const { address, chain } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async () => {
    if (!address || !chain) return;

    setIsLoading(true);
    try {
      // 1. Get nonce from server
      const nonceRes = await fetch("/api/auth/nonce");
      const { nonce } = await nonceRes.json();

      // 2. Create SIWE message
      const message = new SiweMessage({
        domain: window.location.host,
        address,
        statement: "Sign in to DeFi Load Monitor",
        uri: window.location.origin,
        version: "1",
        chainId: chain.id,
        nonce,
      });

      const preparedMessage = message.prepareMessage();

      // 3. Sign message with wallet
      const signature = await signMessageAsync({
        message: preparedMessage,
      });

      // 4. Verify with NextAuth
      const result = await signIn("siwe", {
        message: JSON.stringify(message),
        signature,
        redirect: false,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      // Redirect to dashboard on success
      window.location.href = "/dashboard";
    } catch (error) {
      console.error("SIWE login failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [address, chain, signMessageAsync]);

  const logout = useCallback(async () => {
    await signOut({ callbackUrl: "/" });
  }, []);

  return { login, logout, isLoading, address };
}
