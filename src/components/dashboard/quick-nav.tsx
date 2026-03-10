"use client";

import Link from "next/link";

const NAV_ITEMS = [
  {
    href: "/yield",
    label: "Yield Dashboard",
    desc: "Compare APYs across protocols",
  },
  {
    href: "/loans",
    label: "Loan Health",
    desc: "Monitor borrow positions",
  },
  {
    href: "/trading",
    label: "Trading Journal",
    desc: "Track PnL and strategies",
  },
  {
    href: "/analytics/whales",
    label: "Whale Tracker",
    desc: "Follow smart money flows",
  },
  {
    href: "/analytics/tvl",
    label: "TVL Flows",
    desc: "Protocol TVL trends",
  },
  {
    href: "/analytics/mev",
    label: "MEV Analyzer",
    desc: "Sandwich & arbitrage detection",
  },
];

export function QuickNav() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="rounded-lg border bg-card p-4 transition-colors hover:border-primary hover:bg-accent/50"
        >
          <h4 className="text-sm font-semibold">{item.label}</h4>
          <p className="mt-1 text-xs text-muted-foreground">{item.desc}</p>
        </Link>
      ))}
    </div>
  );
}
