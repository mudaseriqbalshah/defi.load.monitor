"use client";

import { useDashboard } from "@/lib/hooks/use-dashboard";
import { StatCards } from "@/components/dashboard/stat-cards";
import { RecentTrades } from "@/components/dashboard/recent-trades";
import { RecentWhales } from "@/components/dashboard/recent-whales";
import { TopProtocols } from "@/components/dashboard/top-protocols";
import { QuickNav } from "@/components/dashboard/quick-nav";

export default function DashboardPage() {
  const { data, isLoading } = useDashboard();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Overview</h1>
          <p className="text-muted-foreground">
            Your DeFi portfolio at a glance.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="h-64 animate-pulse rounded-lg bg-muted" />
          <div className="h-64 animate-pulse rounded-lg bg-muted" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Overview</h1>
        <p className="text-muted-foreground">
          Your DeFi portfolio at a glance.
        </p>
      </div>

      {/* Key metrics */}
      <StatCards stats={data.stats} tier={data.tier} />

      {/* Main content grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RecentTrades trades={data.recentTrades} />
        <RecentWhales whales={data.recentWhales} />
      </div>

      {/* TVL protocols */}
      <TopProtocols protocols={data.topProtocols} />

      {/* Quick navigation */}
      <div>
        <h2 className="mb-3 text-lg font-semibold">Explore</h2>
        <QuickNav />
      </div>
    </div>
  );
}
