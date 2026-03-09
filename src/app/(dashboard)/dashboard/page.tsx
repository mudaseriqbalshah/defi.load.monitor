export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Overview</h1>
        <p className="text-muted-foreground">
          Your DeFi portfolio at a glance.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Value", value: "$0.00" },
          { label: "Active Positions", value: "0" },
          { label: "Avg. Health Factor", value: "—" },
          { label: "Active Alerts", value: "0" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border bg-card p-6"
          >
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="mt-2 text-2xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Placeholder sections */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold">Top Yields</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Connect your wallet to see personalized yield opportunities.
          </p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold">Loan Health</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Monitor your borrow positions across protocols.
          </p>
        </div>
      </div>
    </div>
  );
}
