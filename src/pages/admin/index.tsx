import AdminLayout from "@/components/admin/AdminLayout";
import { Link } from "wouter";
import {
  controlPlaneSummaries,
  dashboardMetrics,
  diagnosticLogs,
  integrations,
} from "./mock-data";
import type {
  ControlPlaneSummary,
  DiagnosticLogEntry,
  IntegrationSummary,
} from "./types";

const cardClass =
  "rounded-xl border border-[#1f242e] bg-[#0d1013]";

function DashboardMetricCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className={`${cardClass} min-h-[106px] p-4`}>
      <p className="text-[9px] font-semibold tracking-wide text-[#5c6b7d]">
        {label}
      </p>
      <p className="mt-3 text-xl font-semibold text-[#e8f0fa]">
        {value}
      </p>
      <p className="mt-1 text-[10px] text-[#7a8a9e]">
        {detail}
      </p>
    </div>
  );
}

function IntegrationCard({
  integration,
}: {
  integration: IntegrationSummary;
}) {
  const spotify = integration.id === "spotify";

  return (
    <article className={`${cardClass} p-[18px]`}>
      <div className="flex items-start gap-4">
        <div
          className={[
            "flex size-12 shrink-0 items-center justify-center rounded-xl border border-[#1f242e]",
            spotify
              ? "bg-[#0d3321] text-[#59e594]"
              : "bg-[#1a1c21] text-[#dbe3ed]",
          ].join(" ")}
        >
          <span className="text-[18px] font-semibold">
            {spotify ? "S" : "GH"}
          </span>
        </div>

        <div className="min-w-0">
          <h3 className="text-[17px] font-semibold text-[#e8f0fa]">
            {integration.name}
          </h3>
          <p className="mt-0.5 text-[10px] text-[#7a8a9e]">
            {integration.authentication}
          </p>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-3">
          <span className="hidden text-[10px] font-semibold text-[#7a8a9e] sm:block">
            Enabled
          </span>

          <span
            role="img"
            aria-label={integration.enabled ? "Enabled" : "Disabled"}
            className={[
              "relative block h-6 w-[42px] rounded-full",
              integration.enabled ? "bg-[#178a5b]" : "bg-[#303844]",
            ].join(" ")}
          >
            <span
              className={[
                "absolute top-[3px] size-[18px] rounded-full bg-[#e8f0fa]",
                integration.enabled ? "right-[3px]" : "left-[3px]",
              ].join(" ")}
            />
          </span>
        </div>
      </div>

      <div className="mt-4 flex h-[38px] items-center rounded-lg bg-[#0b0d11] px-3">
        <span className="w-[106px] text-[9px] font-semibold text-[#596678]">
          CONNECTION
        </span>

        <span
          className={[
            "mr-2 size-[7px] rounded-full",
            integration.connected ? "bg-[#59e594]" : "bg-[#ebb252]",
          ].join(" ")}
        />

        <span
          className={[
            "text-[11px] font-semibold",
            integration.connected ? "text-[#59e594]" : "text-[#ebb252]",
          ].join(" ")}
        >
          {integration.connected ? "Connected" : "Not connected"}
        </span>
      </div>

      <div className="mt-4 flex items-end justify-between gap-4">
        <div>
          <p className="text-[9px] font-semibold text-[#596678]">
            Capabilities
          </p>
          <p className="mt-2 text-[10px] text-[#87b8e5]">
            {integration.capabilities.join("   ")}
          </p>
        </div>

        <Link
          href={integration.managementRoute}
          className="flex h-[34px] shrink-0 items-center rounded-lg border border-[#2e3845] bg-[#13171c] px-5 text-[11px] font-semibold text-[#bfcfe0] transition hover:border-[#465365] hover:text-white"
        >
          Manage&nbsp; →
        </Link>
      </div>
    </article>
  );
}

function ControlPlaneCard({
  summary,
}: {
  summary: ControlPlaneSummary;
}) {
  const statusClass =
    summary.statusTone === "healthy"
      ? "text-[#59e594]"
      : summary.statusTone === "warning"
        ? "text-[#ebb252]"
        : "text-[#adbacc]";

  return (
    <article className={`${cardClass} p-[18px]`}>
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-base font-semibold text-[#e8f0fa]">
          {summary.title}
        </h3>

        <span
          className={`min-w-[122px] rounded-full border border-[#1f242e] bg-[#131418] px-4 py-1.5 text-[10px] font-semibold ${statusClass}`}
        >
          {summary.status}
        </span>
      </div>

      <dl className="mt-3 space-y-2.5">
        {summary.rows.map((row) => (
          <div
            key={row.label}
            className="grid grid-cols-[122px_1fr] gap-4 text-[11px]"
          >
            <dt className="font-semibold text-[#617082]">
              {row.label}
            </dt>
            <dd className="text-[#adbacc]">{row.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-4 flex justify-end">
        <Link
          href={summary.managementRoute}
          className="flex h-[34px] items-center rounded-lg border border-[#2e3845] bg-[#13171c] px-5 text-[11px] font-semibold text-[#bfcfe0] transition hover:border-[#465365] hover:text-white"
        >
          Manage&nbsp; →
        </Link>
      </div>
    </article>
  );
}

function LogRow({ entry }: { entry: DiagnosticLogEntry }) {
  return (
    <div className="grid gap-1 text-[10px] sm:grid-cols-[80px_38px_104px_1fr] sm:gap-4">
      <span className="text-[#667587]">{entry.timestamp}</span>

      <span
        className={
          entry.severity === "warn"
            ? "font-semibold text-[#ebb252]"
            : entry.severity === "error"
              ? "font-semibold text-red-400"
              : "font-semibold text-[#59b2ff]"
        }
      >
        {entry.severity.toUpperCase()}
      </span>

      <span className="font-semibold text-[#a3b2c4]">
        {entry.subsystem}
      </span>

      <span className="text-[#94a3b5]">{entry.message}</span>
    </div>
  );
}

export default function Admin() {
  return (
    <AdminLayout>
      <div className="mx-auto max-w-[1160px] px-6 pb-12 pt-9 md:px-12">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-[28px] font-semibold leading-tight text-[#e8f0fa]">
              Dashboard
            </h1>

            <p className="mt-1 text-[13px] text-[#7a8a9e]">
              Control-plane summary · detailed configuration lives in each
              management page
            </p>
          </div>

          <div className="inline-flex h-8 w-fit items-center rounded-full border border-[#26664a] bg-[#0e1714] px-4 text-[11px] font-semibold text-[#59e594]">
            <span className="mr-2 size-[7px] rounded-full bg-[#59e594]" />
            Systems nominal
          </div>
        </header>

        <section className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {dashboardMetrics.map((metric) => (
            <DashboardMetricCard key={metric.label} {...metric} />
          ))}
        </section>

        <section className="mt-8">
          <h2 className="text-lg font-semibold text-[#e8f0fa]">
            Integrations
          </h2>
          <p className="mt-1 text-[11px] text-[#7a8a9e]">
            Enable/disable controls runtime availability. Connection state is
            independent.
          </p>

          <div className="mt-7 grid gap-6 xl:grid-cols-2">
            {integrations.map((integration) => (
              <IntegrationCard
                key={integration.id}
                integration={integration}
              />
            ))}
          </div>
        </section>

        <section className="mt-9">
          <h2 className="text-lg font-semibold text-[#e8f0fa]">
            Control plane
          </h2>

          <div className="mt-4 grid gap-6 xl:grid-cols-2">
            {controlPlaneSummaries.map((summary) => (
              <ControlPlaneCard key={summary.title} summary={summary} />
            ))}
          </div>
        </section>

        <section className="mt-9">
          <h2 className="text-lg font-semibold text-[#e8f0fa]">
            Diagnostic logs
          </h2>
          <p className="mt-1 text-[11px] text-[#7a8a9e]">
            Recent backend/control-plane events · full searchable stream
            available in Logs
          </p>

          <div className="mt-5 rounded-[10px] border border-[#1c2129] bg-[#06080a] p-4">
            <div className="space-y-4">
              {diagnosticLogs.map((entry) => (
                <LogRow key={entry.id} entry={entry} />
              ))}
            </div>

            <div className="mt-5 flex justify-end">
              <Link
                href="/admin/logs"
                className="flex h-[30px] items-center rounded-[7px] border border-[#2b3340] bg-[#12161b] px-3.5 text-[10px] font-semibold text-[#b8c7d9] transition hover:border-[#465365] hover:text-white"
              >
                Open full logs →
              </Link>
            </div>
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}