"use client";

import { useState } from "react";
import { useCloseTrade, useDeleteTrade } from "@/lib/hooks/use-trades";
import { formatUsd, formatPercent } from "@/lib/utils";

interface Trade {
  id: string;
  chain: string;
  protocol: string;
  tradeType: string;
  tokenIn: string;
  tokenOut: string;
  amountIn: number;
  amountOut: number;
  priceAtEntry: number;
  priceAtExit: number | null;
  pnl: number | null;
  pnlPercent: number | null;
  txHash: string | null;
  notes: string | null;
  tags: string[];
  openedAt: string;
  closedAt: string | null;
}

const TYPE_LABELS: Record<string, string> = {
  LONG: "Long",
  SHORT: "Short",
  SWAP: "Swap",
  PROVIDE_LIQUIDITY: "Add LP",
  REMOVE_LIQUIDITY: "Remove LP",
};

const TYPE_COLORS: Record<string, string> = {
  LONG: "bg-green-500/10 text-green-500",
  SHORT: "bg-red-500/10 text-red-500",
  SWAP: "bg-blue-500/10 text-blue-500",
  PROVIDE_LIQUIDITY: "bg-purple-500/10 text-purple-500",
  REMOVE_LIQUIDITY: "bg-orange-500/10 text-orange-500",
};

interface TradeTableProps {
  trades: Trade[];
  total: number;
}

export function TradeTable({ trades, total }: TradeTableProps) {
  const [closingId, setClosingId] = useState<string | null>(null);
  const [closeForm, setCloseForm] = useState({
    priceAtExit: "",
    pnl: "",
    pnlPercent: "",
  });

  const closeTrade = useCloseTrade();
  const deleteTrade = useDeleteTrade();

  const handleClose = async (id: string) => {
    await closeTrade.mutateAsync({
      id,
      priceAtExit: parseFloat(closeForm.priceAtExit),
      pnl: parseFloat(closeForm.pnl),
      pnlPercent: parseFloat(closeForm.pnlPercent),
    });
    setClosingId(null);
    setCloseForm({ priceAtExit: "", pnl: "", pnlPercent: "" });
  };

  if (trades.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
        No trades yet. Click &quot;+ New Trade&quot; to log your first trade.
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Pair</th>
              <th className="px-4 py-3">Protocol</th>
              <th className="px-4 py-3 text-right">Amount In</th>
              <th className="px-4 py-3 text-right">Entry</th>
              <th className="px-4 py-3 text-right">Exit</th>
              <th className="px-4 py-3 text-right">PnL</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {trades.map((trade) => (
              <tr key={trade.id} className="border-b last:border-0">
                <td className="px-4 py-3 whitespace-nowrap">
                  {new Date(trade.openedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${
                      TYPE_COLORS[trade.tradeType] ?? ""
                    }`}
                  >
                    {TYPE_LABELS[trade.tradeType] ?? trade.tradeType}
                  </span>
                </td>
                <td className="px-4 py-3 font-medium">
                  {trade.tokenIn}/{trade.tokenOut}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {trade.protocol}
                </td>
                <td className="px-4 py-3 text-right font-mono">
                  {trade.amountIn.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right font-mono">
                  {formatUsd(trade.priceAtEntry)}
                </td>
                <td className="px-4 py-3 text-right font-mono">
                  {trade.priceAtExit != null
                    ? formatUsd(trade.priceAtExit)
                    : "—"}
                </td>
                <td className="px-4 py-3 text-right">
                  {trade.pnl != null ? (
                    <div>
                      <span
                        className={`font-mono font-medium ${
                          trade.pnl >= 0 ? "text-green-500" : "text-red-500"
                        }`}
                      >
                        {trade.pnl >= 0 ? "+" : ""}
                        {formatUsd(trade.pnl)}
                      </span>
                      {trade.pnlPercent != null && (
                        <span
                          className={`ml-1 text-xs ${
                            trade.pnlPercent >= 0
                              ? "text-green-500"
                              : "text-red-500"
                          }`}
                        >
                          ({trade.pnlPercent >= 0 ? "+" : ""}
                          {formatPercent(trade.pnlPercent)})
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      trade.closedAt
                        ? "bg-muted text-muted-foreground"
                        : "bg-yellow-500/10 text-yellow-500"
                    }`}
                  >
                    {trade.closedAt ? "Closed" : "Open"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    {!trade.closedAt && (
                      <button
                        onClick={() =>
                          setClosingId(
                            closingId === trade.id ? null : trade.id
                          )
                        }
                        className="rounded px-2 py-1 text-xs hover:bg-accent"
                      >
                        Close
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (confirm("Delete this trade?"))
                          deleteTrade.mutate(trade.id);
                      }}
                      className="rounded px-2 py-1 text-xs text-destructive hover:bg-destructive/10"
                    >
                      Delete
                    </button>
                  </div>

                  {/* Inline close form */}
                  {closingId === trade.id && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      <input
                        type="number"
                        step="any"
                        placeholder="Exit price"
                        value={closeForm.priceAtExit}
                        onChange={(e) =>
                          setCloseForm({
                            ...closeForm,
                            priceAtExit: e.target.value,
                          })
                        }
                        className="w-24 rounded border bg-background px-2 py-1 text-xs"
                      />
                      <input
                        type="number"
                        step="any"
                        placeholder="PnL ($)"
                        value={closeForm.pnl}
                        onChange={(e) =>
                          setCloseForm({ ...closeForm, pnl: e.target.value })
                        }
                        className="w-24 rounded border bg-background px-2 py-1 text-xs"
                      />
                      <input
                        type="number"
                        step="any"
                        placeholder="PnL %"
                        value={closeForm.pnlPercent}
                        onChange={(e) =>
                          setCloseForm({
                            ...closeForm,
                            pnlPercent: e.target.value,
                          })
                        }
                        className="w-24 rounded border bg-background px-2 py-1 text-xs"
                      />
                      <button
                        onClick={() => handleClose(trade.id)}
                        disabled={closeTrade.isPending}
                        className="rounded bg-primary px-2 py-1 text-xs text-primary-foreground"
                      >
                        Confirm
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {total > trades.length && (
        <div className="border-t px-4 py-3 text-center text-sm text-muted-foreground">
          Showing {trades.length} of {total} trades
        </div>
      )}
    </div>
  );
}
