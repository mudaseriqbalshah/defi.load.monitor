# DeFi Load Monitor

A multi-chain DeFi analytics SaaS platform built with Next.js 14, providing real-time yield monitoring, loan health tracking, whale movement detection, MEV analysis, and trading journal capabilities across Ethereum, Arbitrum, Base, Solana, and BNB Chain.

## Features

### 1. Yield Dashboard
- Compare APYs across Aave V3, Compound V3, Curve, Lido, Rocket Pool, Convex, Morpho, and Spark
- Filter by chain, protocol, stablecoins, and risk level
- Sort by APY, TVL, or recent performance
- Data sourced from DefiLlama (free API)

### 2. Loan Health Monitor
- Real-time health factor tracking for Aave V3 and Compound V3 positions
- Multi-chain support (Ethereum, Arbitrum, Base)
- Liquidation price calculation with price oracle integration
- Configurable alerts via Telegram and email when health factor drops

### 3. Trading Journal
- Full CRUD for trade entries (Long, Short, Swap, Add/Remove Liquidity)
- PnL tracking with win rate, profit factor, and performance stats
- Filter by chain, trade type, status (open/closed), and token
- Tag and annotate trades with notes

### 4. Whale Tracker
- Real-time large transfer detection via Alchemy Address Activity webhooks
- Labeled wallet addresses (exchanges, protocols, funds)
- Telegram alerts for transfers above configurable thresholds
- 24h aggregation stats and chain breakdown

### 5. On-Chain Analytics
- **TVL Flows**: Track protocol TVL across 12 protocols and 5 chains via DefiLlama
- **MEV Analyzer**: Detect sandwich attacks, arbitrage, and liquidations via Flashbots API

### 6. Subscription Billing
- Stripe checkout with customer portal for credit card payments
- USDC on-chain payments on Ethereum, Arbitrum, and Base
- On-chain transaction verification via Alchemy RPC
- Four tiers: Free ($0), Pro ($29/mo), Analyst ($59/mo), Whale ($99/mo)

### 7. Public API
- RESTful API at `/api/v1/*` with API key authentication
- Per-tier rate limiting (Free: 20/min, Pro: 60/min, Analyst: 120/min, Whale: 300/min)
- SHA-256 hashed key storage with expiration support

## Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS + shadcn/ui |
| Database | PostgreSQL + Prisma ORM |
| Cache | Redis (ioredis) |
| Auth | NextAuth.js v4 + SIWE (Sign-In with Ethereum) |
| Wallet | wagmi v2 + RainbowKit |
| State | React Query (TanStack Query) + Zustand |
| Payments | Stripe + USDC on-chain |
| Charts | Recharts |
| Notifications | Telegram Bot API + Resend (email) |
| Blockchain | Alchemy RPC, The Graph subgraphs |
| Data | DefiLlama API, Flashbots API |

## Project Structure

```
src/
├── app/
│   ├── (auth)/login/           # Wallet login page
│   ├── (dashboard)/
│   │   ├── dashboard/          # Overview page
│   │   ├── yield/              # Yield dashboard
│   │   ├── loans/              # Loan health monitor
│   │   ├── trading/            # Trading journal
│   │   ├── analytics/
│   │   │   ├── whales/         # Whale tracker
│   │   │   ├── tvl/            # TVL flows
│   │   │   └── mev/            # MEV analyzer
│   │   └── settings/
│   │       ├── billing/        # Subscription management
│   │       └── api-keys/       # API key management
│   ├── (marketing)/            # Landing page
│   └── api/
│       ├── dashboard/          # Aggregated metrics
│       ├── yields/             # Yield data
│       ├── loans/              # Loan positions
│       ├── trading/            # Trade CRUD
│       ├── analytics/          # Whales, TVL, MEV
│       ├── payments/           # Checkout, portal, USDC
│       ├── subscription/       # Current plan
│       ├── keys/               # API key management
│       ├── v1/                 # Public API gateway
│       └── webhooks/           # Stripe & Alchemy webhooks
├── components/
│   ├── billing/                # Pricing cards, USDC modal
│   ├── dashboard/              # Stat cards, recent activity
│   ├── loans/                  # Health factor gauge, position cards
│   ├── trading/                # Trade form, table, stats, filters
│   ├── analytics/              # Whale cards, MEV feed, TVL tables
│   ├── yield/                  # Yield table, filters, stats
│   └── shared/                 # User menu, common components
├── lib/
│   ├── auth/                   # NextAuth config, session helpers, SIWE
│   ├── constants/              # Chain configs, protocol URLs
│   ├── db/                     # Prisma client, Redis client + cache helper
│   ├── hooks/                  # React Query hooks for all modules
│   ├── providers/              # Web3, session, query, theme providers
│   ├── services/
│   │   ├── analytics/          # Whales, labels, MEV, TVL
│   │   ├── api-keys/           # API key generation and validation
│   │   ├── loans/              # Aave, Compound, health checks
│   │   ├── payments/           # Stripe, USDC
│   │   ├── trading/            # Trade journal CRUD + stats
│   │   └── yields/             # DefiLlama integration
│   └── utils/                  # Formatters, helpers
├── types/                      # TypeScript types, tier limits
└── middleware.ts                # Route protection
```

## Database Schema

15 Prisma models including:

- **User**, **Account**, **Session** — NextAuth + SIWE auth
- **Subscription** — Tier management with Stripe and USDC payment methods
- **CryptoPayment** — On-chain USDC payment records
- **ApiKey** — Hashed API keys with expiration
- **Wallet**, **Position** — User wallet tracking
- **Alert**, **AlertHistory** — Configurable notifications
- **TradingJournal** — Trade entries with PnL
- **WhaleTransaction**, **WalletLabel** — Whale tracking with labeled addresses
- **TvlSnapshot**, **MevEvent** — On-chain analytics data
- **YieldSnapshot** — Historical yield data

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 15+
- Redis (optional, for caching)

### Installation

```bash
git clone https://github.com/mudaseriqbalshah/defi.load.monitor.git
cd defi.load.monitor
npm install
```

### Environment Setup

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# Database
DATABASE_URL="postgresql://user@localhost:5432/defi_load_monitor"
REDIS_URL="redis://localhost:6379"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# Blockchain
ALCHEMY_API_KEY="your-alchemy-key"
ALCHEMY_WEBHOOK_SIGNING_KEY="your-webhook-key"

# Stripe (optional)
STRIPE_SECRET_KEY="sk_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_..."
STRIPE_PRICE_PRO="price_..."
STRIPE_PRICE_ANALYST="price_..."
STRIPE_PRICE_WHALE="price_..."

# USDC (optional)
USDC_TREASURY_ADDRESS="0x..."

# Notifications (optional)
TELEGRAM_BOT_TOKEN="your-bot-token"
RESEND_API_KEY="your-resend-key"

# Public
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID="your-project-id"
```

### Database Setup

```bash
# Create database (macOS with Homebrew PostgreSQL)
createdb defi_load_monitor

# Push schema
npx prisma db push

# Seed wallet labels
npx tsx -e "import { seedKnownLabels } from './src/lib/services/analytics/labels'; seedKnownLabels().then(() => console.log('Done'));"
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Production Build

```bash
npm run build
npm start
```

## Subscription Tiers

| Feature | Free | Pro ($29) | Analyst ($59) | Whale ($99) |
|---------|------|-----------|---------------|-------------|
| Wallets | 1 | 5 | 20 | Unlimited |
| Real-time data | - | ✓ | ✓ | ✓ |
| Yield dashboard | ✓ | ✓ | ✓ | ✓ |
| Trading analytics | - | ✓ | ✓ | ✓ |
| On-chain analytics | - | - | ✓ | ✓ |
| Whale tracking | - | - | ✓ | ✓ |
| MEV analyzer | - | - | - | ✓ |
| API access | - | - | - | ✓ |

## API Usage

Whale-tier users can access the public API:

```bash
curl -H "x-api-key: dlm_your_key_here" \
  https://your-domain.com/api/v1/yields

curl -H "x-api-key: dlm_your_key_here" \
  https://your-domain.com/api/v1/analytics/whales
```

### Available Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/v1/yields` | Yield data across protocols |
| `GET /api/v1/trading` | Your trade journal |
| `GET /api/v1/analytics/whales` | Whale transfer feed |
| `GET /api/v1/analytics/tvl` | Protocol TVL data |
| `GET /api/v1/analytics/mev` | MEV events |
| `GET /api/v1/dashboard` | Dashboard overview |

### Rate Limits

| Tier | Requests/min |
|------|-------------|
| Free | 20 |
| Pro | 60 |
| Analyst | 120 |
| Whale | 300 |

## Webhook Setup

### Stripe

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Events handled: `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid`, `invoice.payment_failed`

### Alchemy (Whale Tracking)

Configure an Address Activity webhook in the Alchemy dashboard pointing to:
```
https://your-domain.com/api/webhooks/alchemy
```

The webhook uses HMAC-SHA256 signature verification.

## Supported Chains

- Ethereum (Mainnet)
- Arbitrum One
- Base
- Solana
- BNB Chain (BSC)

## License

Private — All rights reserved.
