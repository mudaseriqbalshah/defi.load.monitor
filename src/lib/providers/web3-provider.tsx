"use client";

import { type ReactNode } from "react";
import dynamic from "next/dynamic";

// Dynamically import to avoid SSR prerender issues with RainbowKit/wagmi
const Web3ProviderInner = dynamic(
  () => import("./web3-provider-inner").then((mod) => mod.Web3ProviderInner),
  {
    ssr: false,
    loading: () => null,
  }
);

export function Web3Provider({ children }: { children: ReactNode }) {
  return <Web3ProviderInner>{children}</Web3ProviderInner>;
}
