import Link from "next/link";

const FEATURES = [
  {
    title: "Yield Dashboard",
    description:
      "Compare APYs across Aave, Compound, Curve, Lido, and more. Filter by chain, stablecoins, and risk.",
  },
  {
    title: "Loan Health Monitor",
    description:
      "Track borrow positions across Aave V3 and Compound V3 with real-time health factor alerts.",
  },
  {
    title: "Trading Journal",
    description:
      "Log trades, track PnL, analyze win rate, and calculate profit factor across all chains.",
  },
  {
    title: "Whale Tracker",
    description:
      "Follow smart money flows with labeled addresses. Get Telegram alerts for large transfers.",
  },
  {
    title: "TVL Analytics",
    description:
      "Monitor protocol TVL across 12 protocols and 5 chains with 24h change indicators.",
  },
  {
    title: "MEV Analyzer",
    description:
      "Detect sandwich attacks, arbitrage, and liquidation MEV via Flashbots integration.",
  },
];

const TIERS = [
  {
    name: "Free",
    price: 0,
    features: ["1 wallet", "Yield dashboard", "Basic data"],
  },
  {
    name: "Pro",
    price: 29,
    features: [
      "5 wallets",
      "Real-time data",
      "Trading analytics",
      "Yield dashboard",
    ],
    highlight: true,
  },
  {
    name: "Analyst",
    price: 59,
    features: [
      "20 wallets",
      "On-chain analytics",
      "Whale tracking",
      "Telegram alerts",
    ],
  },
  {
    name: "Whale",
    price: 99,
    features: [
      "Unlimited wallets",
      "MEV analyzer",
      "API access",
      "Everything included",
    ],
  },
];

const CHAINS = ["Ethereum", "Arbitrum", "Base", "Solana", "BNB Chain"];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <span className="text-xl font-bold">DeFi Load Monitor</span>
          <nav className="flex items-center gap-6">
            <Link
              href="#features"
              className="hidden text-sm text-muted-foreground hover:text-foreground sm:block"
            >
              Features
            </Link>
            <Link
              href="#pricing"
              className="hidden text-sm text-muted-foreground hover:text-foreground sm:block"
            >
              Pricing
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
      <section className="flex flex-col items-center justify-center px-4 pb-20 pt-24 text-center">
        <div className="mb-6 flex flex-wrap justify-center gap-2">
          {CHAINS.map((chain) => (
            <span
              key={chain}
              className="rounded-full border px-3 py-1 text-xs text-muted-foreground"
            >
              {chain}
            </span>
          ))}
        </div>
        <h1 className="max-w-4xl text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
          Multi-chain DeFi
          <br />
          <span className="text-primary">Intelligence Platform</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
          Monitor yields, track loan health, analyze whale movements, detect MEV,
          and journal your trades — all from one dashboard.
        </p>
        <div className="mt-10 flex gap-4">
          <Link
            href="/login"
            className="rounded-md bg-primary px-8 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Get Started Free
          </Link>
          <Link
            href="#features"
            className="rounded-md border px-8 py-3 text-sm font-medium hover:bg-accent"
          >
            Learn More
          </Link>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t bg-muted/30 px-4 py-20">
        <div className="container">
          <h2 className="text-center text-3xl font-bold">
            Everything You Need for DeFi
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">
            Six powerful modules covering yield optimization, risk management,
            trading analytics, and on-chain intelligence.
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="rounded-lg border bg-card p-6"
              >
                <h3 className="font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-4 py-20">
        <div className="container">
          <h2 className="text-center text-3xl font-bold">
            Simple, Transparent Pricing
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">
            Pay with credit card or USDC on Ethereum, Arbitrum, or Base.
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {TIERS.map((tier) => (
              <div
                key={tier.name}
                className={`rounded-lg border p-6 ${
                  tier.highlight
                    ? "border-primary shadow-lg ring-1 ring-primary"
                    : ""
                }`}
              >
                {tier.highlight && (
                  <span className="mb-3 inline-block rounded-full bg-primary px-3 py-0.5 text-xs font-semibold text-primary-foreground">
                    Popular
                  </span>
                )}
                <h3 className="text-lg font-bold">{tier.name}</h3>
                <div className="mt-2">
                  <span className="text-3xl font-bold">${tier.price}</span>
                  {tier.price > 0 && (
                    <span className="text-muted-foreground">/mo</span>
                  )}
                </div>
                <ul className="mt-4 space-y-2">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <span className="text-green-500">&#10003;</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/login"
                  className={`mt-6 block w-full rounded-md px-4 py-2 text-center text-sm font-medium ${
                    tier.highlight
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "border hover:bg-accent"
                  }`}
                >
                  {tier.price === 0 ? "Start Free" : "Get Started"}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-4 py-8">
        <div className="container flex flex-col items-center justify-between gap-4 sm:flex-row">
          <span className="text-sm text-muted-foreground">
            DeFi Load Monitor
          </span>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="/login" className="hover:text-foreground">
              Launch App
            </Link>
            <Link href="#features" className="hover:text-foreground">
              Features
            </Link>
            <Link href="#pricing" className="hover:text-foreground">
              Pricing
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
