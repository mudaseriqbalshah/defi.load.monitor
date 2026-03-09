export default function TradingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Trading Analytics</h1>
        <p className="text-muted-foreground">
          PnL journal and cross-chain trade scanner.
        </p>
      </div>
      <div className="rounded-lg border bg-card p-6">
        <p className="text-sm text-muted-foreground">
          Available on Pro tier and above.
        </p>
      </div>
    </div>
  );
}
