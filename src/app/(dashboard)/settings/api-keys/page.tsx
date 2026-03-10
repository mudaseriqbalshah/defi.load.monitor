"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface ApiKeyEntry {
  id: string;
  name: string;
  lastUsed: string | null;
  createdAt: string;
  expiresAt: string | null;
}

interface NewKeyResponse {
  id: string;
  name: string;
  key: string;
  expiresAt: string | null;
}

export default function ApiKeysPage() {
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [expiresInDays, setExpiresInDays] = useState("");
  const [newKey, setNewKey] = useState<string | null>(null);

  const { data: keys, isLoading } = useQuery<ApiKeyEntry[]>({
    queryKey: ["api-keys"],
    queryFn: async () => {
      const res = await fetch("/api/keys");
      const json = await res.json();
      return json.data;
    },
  });

  const createKey = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          expiresInDays: expiresInDays ? Number(expiresInDays) : undefined,
        }),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error);
      }
      return (await res.json()).data as NewKeyResponse;
    },
    onSuccess: (data) => {
      setNewKey(data.key);
      setName("");
      setExpiresInDays("");
      qc.invalidateQueries({ queryKey: ["api-keys"] });
    },
  });

  const revokeKey = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/keys/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["api-keys"] });
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">API Keys</h1>
        <p className="text-muted-foreground">
          Manage your API keys for programmatic access. Requires Whale tier.
        </p>
      </div>

      {/* Create new key */}
      <div className="rounded-lg border bg-card p-6">
        <h2 className="font-semibold">Create New Key</h2>
        <div className="mt-3 flex flex-wrap gap-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Key name (e.g. My Bot)"
            className="rounded-md border bg-background px-3 py-2 text-sm"
          />
          <select
            value={expiresInDays}
            onChange={(e) => setExpiresInDays(e.target.value)}
            className="rounded-md border bg-background px-3 py-2 text-sm"
          >
            <option value="">No expiration</option>
            <option value="30">30 days</option>
            <option value="90">90 days</option>
            <option value="365">1 year</option>
          </select>
          <button
            onClick={() => createKey.mutate()}
            disabled={!name.trim() || createKey.isPending}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {createKey.isPending ? "Creating..." : "Generate Key"}
          </button>
        </div>
        {createKey.error && (
          <p className="mt-2 text-sm text-destructive">
            {createKey.error.message}
          </p>
        )}
      </div>

      {/* Show new key (only once) */}
      {newKey && (
        <div className="rounded-lg border border-green-600/30 bg-green-600/5 p-6">
          <h3 className="font-semibold text-green-600">
            Key Created Successfully
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Copy this key now. You won&apos;t be able to see it again.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <code className="flex-1 rounded bg-muted px-3 py-2 font-mono text-sm break-all">
              {newKey}
            </code>
            <button
              onClick={() => {
                navigator.clipboard.writeText(newKey);
              }}
              className="rounded-md border px-3 py-2 text-sm hover:bg-accent"
            >
              Copy
            </button>
          </div>
          <button
            onClick={() => setNewKey(null)}
            className="mt-3 text-sm text-muted-foreground hover:text-foreground"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Existing keys */}
      <div className="rounded-lg border bg-card">
        <div className="px-6 py-4">
          <h2 className="font-semibold">Your Keys</h2>
        </div>
        {isLoading ? (
          <div className="px-6 pb-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="mb-2 h-12 animate-pulse rounded bg-muted"
              />
            ))}
          </div>
        ) : !keys?.length ? (
          <div className="px-6 pb-6 text-sm text-muted-foreground">
            No API keys yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-t border-b text-left text-muted-foreground">
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Created</th>
                  <th className="px-6 py-3">Last Used</th>
                  <th className="px-6 py-3">Expires</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {keys.map((k) => (
                  <tr key={k.id} className="border-b last:border-0">
                    <td className="px-6 py-3 font-medium">{k.name}</td>
                    <td className="px-6 py-3 text-muted-foreground">
                      {new Date(k.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3 text-muted-foreground">
                      {k.lastUsed
                        ? new Date(k.lastUsed).toLocaleDateString()
                        : "Never"}
                    </td>
                    <td className="px-6 py-3 text-muted-foreground">
                      {k.expiresAt
                        ? new Date(k.expiresAt).toLocaleDateString()
                        : "Never"}
                    </td>
                    <td className="px-6 py-3">
                      <button
                        onClick={() => {
                          if (confirm(`Revoke key "${k.name}"?`))
                            revokeKey.mutate(k.id);
                        }}
                        className="text-xs text-destructive hover:underline"
                      >
                        Revoke
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Usage info */}
      <div className="rounded-lg border bg-card p-6">
        <h2 className="font-semibold">API Usage</h2>
        <div className="mt-3 space-y-2 text-sm text-muted-foreground">
          <p>
            Base URL:{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono">
              /api/v1
            </code>
          </p>
          <p>
            Auth header:{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono">
              x-api-key: dlm_...
            </code>
          </p>
          <p>Available endpoints:</p>
          <ul className="ml-4 list-disc space-y-1">
            <li>
              <code className="font-mono">GET /api/v1/yields</code> — Yield data
            </li>
            <li>
              <code className="font-mono">GET /api/v1/trading</code> — Your
              trades
            </li>
            <li>
              <code className="font-mono">GET /api/v1/analytics/whales</code> —
              Whale feed
            </li>
            <li>
              <code className="font-mono">GET /api/v1/analytics/tvl</code> — TVL
              data
            </li>
            <li>
              <code className="font-mono">GET /api/v1/analytics/mev</code> — MEV
              events
            </li>
            <li>
              <code className="font-mono">GET /api/v1/dashboard</code> — Dashboard
              overview
            </li>
          </ul>
          <p className="mt-2">
            Rate limits: Free 20/min, Pro 60/min, Analyst 120/min, Whale 300/min
          </p>
        </div>
      </div>
    </div>
  );
}
