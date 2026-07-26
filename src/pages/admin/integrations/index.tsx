import AdminLayout from "@/components/admin/AdminLayout";
import { Link } from "wouter";
import { integrations } from "../mock-data";
import type { IntegrationSummary } from "../types";

function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="min-h-[86px] rounded-xl border border-[#1f242e] bg-[#0d1013] p-4">
      <p className="text-[9px] font-semibold tracking-wide text-[#5c6b7d]">
        {label}
      </p>

      <p className="mt-3 text-xl font-semibold text-[#e8f0fa]">
        {value}
      </p>
    </div>
  );
}

function IntegrationToggle({ enabled }: { enabled: boolean }) {
  return (
    <span
      role="img"
      aria-label={enabled ? "Enabled" : "Disabled"}
      className={[
        "relative block h-6 w-[42px] shrink-0 rounded-full",
        enabled ? "bg-[#178a5b]" : "bg-[#303844]",
      ].join(" ")}
    >
      <span
        className={[
          "absolute top-[3px] size-[18px] rounded-full bg-[#e8f0fa]",
          enabled ? "right-[3px]" : "left-[3px]",
        ].join(" ")}
      />
    </span>
  );
}

function IntegrationCard({
  integration,
}: {
  integration: IntegrationSummary;
}) {
  const spotify = integration.id === "spotify";

  return (
    <article className="rounded-xl border border-[#1f242e] bg-[#0d1013] p-5">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
        <div className="flex min-w-0 flex-1 items-start gap-[18px]">
          <div
            className={[
              "flex size-[50px] shrink-0 items-center justify-center rounded-xl border border-[#1f242e]",
              spotify
                ? "bg-[#0d3321] text-[#59e594]"
                : "bg-[#1a1c21] text-[#e8f0fa]",
            ].join(" ")}
          >
            <span className="text-[18px] font-semibold">
              {spotify ? "S" : "GH"}
            </span>
          </div>

          <div>
            <h2 className="text-[17px] font-semibold text-[#e8f0fa]">
              {integration.name}
            </h2>

            <p className="mt-0.5 text-[10px] text-[#7a8a9e]">
              {spotify ? "OAuth" : "GitHub App"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-3 lg:justify-end">
          <span className="text-[10px] font-semibold text-[#7a8a9e]">
            Enabled
          </span>

          <IntegrationToggle enabled={integration.enabled} />

          <div className="flex min-w-[130px] items-center gap-2">
            <span
              className={[
                "size-2 rounded-full",
                integration.connected
                  ? "bg-[#59e594]"
                  : "bg-[#ebb252]",
              ].join(" ")}
            />

            <span
              className={[
                "text-[11px] font-semibold",
                integration.connected
                  ? "text-[#59e594]"
                  : "text-[#ebb252]",
              ].join(" ")}
            >
              {integration.connected
                ? "Connected"
                : "Not connected"}
            </span>
          </div>
        </div>
      </div>

      <p className="mt-4 text-[11px] text-[#91a1b2]">
        {integration.description}
      </p>

      <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <p className="text-[10px] text-[#87b8e5]">
          {integration.capabilities.join("   ")}
        </p>

        <div className="flex gap-3">
          <button
            type="button"
            disabled
            title="Health testing will be connected to the admin backend in a later phase."
            className="flex h-[34px] w-[92px] cursor-not-allowed items-center justify-center rounded-lg border border-[#2b3340] bg-[#12161b] text-[11px] font-semibold text-[#b8c7d9] opacity-60"
          >
            Test
          </button>

          <Link
            href={integration.managementRoute}
            className="flex h-[34px] min-w-[180px] items-center justify-center rounded-lg border border-[#294d73] bg-[#131b24] px-5 text-[11px] font-semibold text-[#b2d6f7] transition hover:border-[#3d6e9e] hover:text-white"
          >
            Manage integration →
          </Link>
        </div>
      </div>
    </article>
  );
}

export default function AdminIntegrations() {
  const total = integrations.length;
  const enabled = integrations.filter(
    (integration) => integration.enabled,
  ).length;
  const connected = integrations.filter(
    (integration) => integration.connected,
  ).length;

  const attention = integrations.filter(
    (integration) =>
      !integration.enabled || !integration.connected,
  ).length;

  return (
    <AdminLayout>
      <div className="mx-auto max-w-[1160px] px-6 pb-12 pt-9 md:px-12">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-[28px] font-semibold leading-tight text-[#e8f0fa]">
              Integrations
            </h1>

            <p className="mt-1 text-[13px] text-[#7a8a9e]">
              Enable, connect, test and configure backend integrations.
            </p>
          </div>

          <button
            type="button"
            disabled
            title="Integration registration is not implemented in Phase 1."
            className="flex h-[34px] w-fit cursor-not-allowed items-center rounded-lg border border-[#2b4057] bg-[#12181f] px-5 text-[11px] font-semibold text-[#b8d6f2] opacity-60"
          >
            + Add integration
          </button>
        </header>

        <section className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard label="TOTAL" value={total} />
          <SummaryCard label="ENABLED" value={enabled} />
          <SummaryCard label="CONNECTED" value={connected} />
          <SummaryCard label="ATTENTION" value={attention} />
        </section>

        <section className="mt-11 space-y-6">
          {integrations.map((integration) => (
            <IntegrationCard
              key={integration.id}
              integration={integration}
            />
          ))}
        </section>

        <section className="mt-11 rounded-xl border border-[#1c2129] bg-[#0a0c0f] p-[22px]">
          <h2 className="text-[15px] font-semibold text-[#e8f0fa]">
            Add another integration
          </h2>

          <p className="mt-3 text-[11px] text-[#7a8a9e]">
            Providers may use OAuth, App authentication, API keys, or
            another mechanism.
          </p>

          <p className="mt-2 text-[11px] text-[#7a8a9e]">
            Authentication-specific setup remains inside the provider
            management view.
          </p>

          <button
            type="button"
            disabled
            title="Integration registration is not implemented in Phase 1."
            className="mt-4 flex h-8 cursor-not-allowed items-center rounded-lg border border-[#2b3340] bg-[#12161b] px-5 text-[11px] font-semibold text-[#b8c7d9] opacity-60"
          >
            + Add integration
          </button>
        </section>
      </div>
    </AdminLayout>
  );
}