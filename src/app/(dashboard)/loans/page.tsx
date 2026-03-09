export default function LoansPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Loan Health Monitor</h1>
        <p className="text-muted-foreground">
          Track borrow positions and liquidation risk across Aave and Compound.
        </p>
      </div>
      <div className="rounded-lg border bg-card p-6">
        <p className="text-sm text-muted-foreground">
          Enter a wallet address to view positions.
        </p>
      </div>
    </div>
  );
}
