"use client";

import { useState } from "react";

interface WalletInputProps {
  onSubmit: (address: string) => void;
  defaultValue?: string;
  isLoading?: boolean;
}

export function WalletInput({
  onSubmit,
  defaultValue = "",
  isLoading = false,
}: WalletInputProps) {
  const [address, setAddress] = useState(defaultValue);

  const isValidAddress = /^0x[a-fA-F0-9]{40}$/.test(address);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValidAddress) {
      onSubmit(address);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      <input
        type="text"
        placeholder="Enter wallet address (0x...)"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        className="flex-1 rounded-md border bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      />
      <button
        type="submit"
        disabled={!isValidAddress || isLoading}
        className="rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        {isLoading ? "Loading..." : "Monitor"}
      </button>
    </form>
  );
}
