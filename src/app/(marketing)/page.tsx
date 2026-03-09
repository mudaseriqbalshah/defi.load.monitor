import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Nav */}
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <span className="text-xl font-bold">DeFi Load Monitor</span>
          <nav className="flex items-center gap-6">
            <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
              Dashboard
            </Link>
            <Link
              href="/login"
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Launch App
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 text-center">
        <h1 className="max-w-3xl text-5xl font-bold tracking-tight sm:text-6xl">
          Multi-chain DeFi Intelligence
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
          Monitor yields, track loan health, analyze whale movements, and detect
          MEV — all from one dashboard across Ethereum, Arbitrum, Base, Solana,
          and BNB Chain.
        </p>
        <div className="mt-10 flex gap-4">
          <Link
            href="/login"
            className="rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Get Started Free
          </Link>
          <Link
            href="#features"
            className="rounded-md border px-6 py-3 text-sm font-medium hover:bg-accent"
          >
            View Features
          </Link>
        </div>
      </main>
    </div>
  );
}
