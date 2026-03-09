"use client";

import { useState } from "react";
import type { SubscriptionTier, Chain } from "@prisma/client";

const CHAINS: { value: Chain; label: string }[] = [
  { value: "ETHEREUM", label: "Ethereum" },
  { value: "ARBITRUM", label: "Arbitrum" },
  { value: "BASE", label: "Base" },
];

interface UsdcPaymentModalProps {
  tier: Exclude<SubscriptionTier, "FREE">;
  onClose: () => void;
  onSuccess: () => void;
}

interface PaymentIntent {
  tier: string;
  amount: number;
  treasuryAddress: string;
  chain: string;
  usdcAddress: string;
}

export function UsdcPaymentModal({
  tier,
  onClose,
  onSuccess,
}: UsdcPaymentModalProps) {
  const [chain, setChain] = useState<Chain>("ETHEREUM");
  const [intent, setIntent] = useState<PaymentIntent | null>(null);
  const [txHash, setTxHash] = useState("");
  const [step, setStep] = useState<"chain" | "pay" | "verify">("chain");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchIntent = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `/api/payments/usdc?tier=${tier}&chain=${chain}`
      );
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setIntent(json.data);
      setStep("pay");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get payment details");
    } finally {
      setLoading(false);
    }
  };

  const verifyPayment = async () => {
    if (!txHash.trim()) {
      setError("Please enter the transaction hash");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/payments/usdc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ txHash: txHash.trim(), chain, tier }),
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-md rounded-lg border bg-card p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">Pay with USDC</h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            &#10005;
          </button>
        </div>

        {error && (
          <div className="mt-3 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {step === "chain" && (
          <div className="mt-4 space-y-4">
            <p className="text-sm text-muted-foreground">
              Select the chain to send USDC on:
            </p>
            <div className="grid grid-cols-3 gap-2">
              {CHAINS.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setChain(c.value)}
                  className={`rounded-md border px-3 py-2 text-sm font-medium ${
                    chain === c.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:bg-accent"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
            <button
              onClick={fetchIntent}
              disabled={loading}
              className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? "Loading..." : "Continue"}
            </button>
          </div>
        )}

        {step === "pay" && intent && (
          <div className="mt-4 space-y-4">
            <div className="rounded-md bg-muted p-4 text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-mono font-bold">
                  {intent.amount} USDC
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Chain</span>
                <span>{intent.chain}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Send to:</span>
                <div className="mt-1 break-all rounded bg-background p-2 font-mono text-xs">
                  {intent.treasuryAddress}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">USDC contract:</span>
                <div className="mt-1 break-all rounded bg-background p-2 font-mono text-xs">
                  {intent.usdcAddress}
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Send exactly {intent.amount} USDC to the address above using your
              wallet. After the transaction confirms, click below to verify.
            </p>
            <button
              onClick={() => setStep("verify")}
              className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              I&apos;ve sent the payment
            </button>
          </div>
        )}

        {step === "verify" && (
          <div className="mt-4 space-y-4">
            <p className="text-sm text-muted-foreground">
              Paste the transaction hash to verify your payment:
            </p>
            <input
              type="text"
              value={txHash}
              onChange={(e) => setTxHash(e.target.value)}
              placeholder="0x..."
              className="w-full rounded-md border bg-background px-3 py-2 font-mono text-sm"
            />
            <button
              onClick={verifyPayment}
              disabled={loading || !txHash.trim()}
              className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify Payment"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
