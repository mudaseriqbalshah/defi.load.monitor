import Link from "next/link";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">On-Chain Analytics</h1>
        <p className="text-muted-foreground">
          Whale tracking, TVL flows, smart money, and MEV analysis.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { href: "/analytics/whales", label: "Whale Tracker", desc: "Large transfers and smart money flows" },
          { href: "/analytics/tvl", label: "TVL Flows", desc: "Protocol TVL changes and trends" },
          { href: "/analytics/mev", label: "MEV Analyzer", desc: "Sandwich attacks, arbitrage, liquidations" },
        ].map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="rounded-lg border bg-card p-6 hover:border-primary"
          >
            <h3 className="font-semibold">{card.label}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{card.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
