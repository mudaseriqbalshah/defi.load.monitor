export default function YieldPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Yield Dashboard</h1>
        <p className="text-muted-foreground">
          Compare APYs across protocols and chains.
        </p>
      </div>
      <div className="rounded-lg border bg-card p-6">
        <p className="text-sm text-muted-foreground">
          Yield data will be loaded from DefiLlama API.
        </p>
      </div>
    </div>
  );
}
