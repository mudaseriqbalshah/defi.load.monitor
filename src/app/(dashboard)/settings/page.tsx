import Link from "next/link";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account, wallets, notifications, and subscription.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold">Profile</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Connected wallet and email settings.
          </p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold">Notifications</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Configure Telegram and email alerts.
          </p>
        </div>
        <Link
          href="/settings/billing"
          className="rounded-lg border bg-card p-6 transition-colors hover:bg-accent"
        >
          <h3 className="font-semibold">Billing</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage your subscription, upgrade plan, or pay with USDC.
          </p>
        </Link>
      </div>
    </div>
  );
}
