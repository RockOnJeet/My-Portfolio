import AdminLayout from "@/components/admin/AdminLayout";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { diagnosticLogs } from "../mock-data";
import type { DiagnosticLogEntry } from "../types";

type SeverityFilter = "all" | DiagnosticLogEntry["severity"];

const severityOptions: Array<{
  id: SeverityFilter;
  label: string;
}> = [
    { id: "all", label: "All" },
    { id: "error", label: "Errors" },
    { id: "warn", label: "Warnings" },
    { id: "info", label: "Info" },
  ];

function severityClass(severity: DiagnosticLogEntry["severity"]) {
  switch (severity) {
    case "error":
      return "text-red-400";
    case "warn":
      return "text-[#ebb252]";
    case "info":
      return "text-[#59b2ff]";
  }
}

function SummaryCard({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: number;
  tone?: "default" | "error" | "warning" | "info";
}) {
  const valueClass =
    tone === "error"
      ? "text-red-400"
      : tone === "warning"
        ? "text-[#ebb252]"
        : tone === "info"
          ? "text-[#59b2ff]"
          : "text-[#e8f0fa]";

  return (
    <div className="min-h-[86px] rounded-xl border border-[#1f242e] bg-[#0d1013] p-4">
      <p className="text-[9px] font-semibold tracking-wide text-[#5c6b7d]">
        {label}
      </p>

      <p className={`mt-3 text-xl font-semibold ${valueClass}`}>
        {value}
      </p>
    </div>
  );
}

function LogEntry({ entry }: { entry: DiagnosticLogEntry }) {
  return (
    <div className="border-b border-[#181d24] px-4 py-4 last:border-b-0">
      <div className="grid gap-2 lg:grid-cols-[88px_54px_90px_140px_1fr_70px] lg:items-start lg:gap-4">
        <span className="font-mono text-[10px] text-[#667587]">
          {entry.timestamp}
        </span>

        <span
          className={`text-[10px] font-semibold ${severityClass(
            entry.severity,
          )}`}
        >
          {entry.severity.toUpperCase()}
        </span>

        <span className="text-[10px] font-semibold text-[#a3b2c4]">
          {entry.subsystem}
        </span>

        <span className="font-mono text-[10px] text-[#87b8e5]">
          {entry.operation}
        </span>

        <span className="text-[10px] leading-5 text-[#94a3b5]">
          {entry.message}
        </span>

        <span className="text-right font-mono text-[10px] text-[#667587]">
          {entry.durationMs === undefined
            ? "—"
            : `${entry.durationMs} ms`}
        </span>
      </div>
    </div>
  );
}

export default function AdminLogs() {
  const [severity, setSeverity] =
    useState<SeverityFilter>("all");
  const [subsystem, setSubsystem] = useState("all");
  const [query, setQuery] = useState("");

  const subsystems = useMemo(
    () => [
      "all",
      ...Array.from(
        new Set(diagnosticLogs.map((entry) => entry.subsystem)),
      ),
    ],
    [],
  );

  const filteredLogs = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return diagnosticLogs.filter((entry) => {
      if (severity !== "all" && entry.severity !== severity) {
        return false;
      }

      if (
        subsystem !== "all" &&
        entry.subsystem !== subsystem
      ) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      return [
        entry.subsystem,
        entry.operation,
        entry.message,
      ].some((value) =>
        value.toLowerCase().includes(normalizedQuery),
      );
    });
  }, [query, severity, subsystem]);

  const errors = diagnosticLogs.filter(
    (entry) => entry.severity === "error",
  ).length;

  const warnings = diagnosticLogs.filter(
    (entry) => entry.severity === "warn",
  ).length;

  const info = diagnosticLogs.filter(
    (entry) => entry.severity === "info",
  ).length;

  return (
    <AdminLayout>
      <div className="mx-auto max-w-[1160px] px-6 pb-12 pt-9 md:px-12">
        <header>
          <h1 className="text-[28px] font-semibold leading-tight text-[#e8f0fa]">
            Logs
          </h1>

          <p className="mt-1 text-[13px] text-[#7a8a9e]">
            Diagnostic events across control-plane subsystems.
          </p>
        </header>

        <section className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            label="EVENTS"
            value={diagnosticLogs.length}
          />
          <SummaryCard
            label="ERRORS"
            value={errors}
            tone="error"
          />
          <SummaryCard
            label="WARNINGS"
            value={warnings}
            tone="warning"
          />
          <SummaryCard
            label="INFO"
            value={info}
            tone="info"
          />
        </section>

        <section className="mt-8 rounded-xl border border-[#1f242e] bg-[#0d1013]">
          <div className="border-b border-[#1f242e] p-4">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
              <div className="relative min-w-0 flex-1">
                <Search
                  aria-hidden="true"
                  className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#596678]"
                />

                <input
                  type="search"
                  value={query}
                  onChange={(event) =>
                    setQuery(event.target.value)
                  }
                  placeholder="Search operation, subsystem or result..."
                  className="h-[38px] w-full rounded-lg border border-[#252c36] bg-[#090b0e] pl-10 pr-3 text-[11px] text-[#c7d1e0] outline-none placeholder:text-[#4f5b6b] focus:border-[#3c536d]"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {severityOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setSeverity(option.id)}
                    className={[
                      "h-[32px] rounded-lg border px-4 text-[10px] font-semibold transition",
                      severity === option.id
                        ? "border-[#365d82] bg-[#14202b] text-[#a9d2f7]"
                        : "border-[#252c36] bg-[#11151a] text-[#7f8d9f] hover:text-[#b8c7d9]",
                    ].join(" ")}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              <select
                value={subsystem}
                onChange={(event) =>
                  setSubsystem(event.target.value)
                }
                aria-label="Filter by subsystem"
                className="h-[32px] rounded-lg border border-[#252c36] bg-[#11151a] px-3 text-[10px] font-semibold text-[#a3b2c4] outline-none"
              >
                {subsystems.map((value) => (
                  <option key={value} value={value}>
                    {value === "all"
                      ? "All subsystems"
                      : value}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="hidden border-b border-[#1f242e] bg-[#090b0e] px-4 py-2 lg:grid lg:grid-cols-[88px_54px_90px_140px_1fr_70px] lg:gap-4">
            {[
              "TIME",
              "LEVEL",
              "SYSTEM",
              "OPERATION",
              "RESULT",
              "DURATION",
            ].map((heading) => (
              <span
                key={heading}
                className="text-[8px] font-semibold tracking-wide text-[#526071]"
              >
                {heading}
              </span>
            ))}
          </div>

          <div className="bg-[#07090b]">
            {filteredLogs.length > 0 ? (
              filteredLogs.map((entry) => (
                <LogEntry key={entry.id} entry={entry} />
              ))
            ) : (
              <div className="px-6 py-16 text-center">
                <p className="text-[12px] text-[#7a8a9e]">
                  No diagnostic events match the current filters.
                </p>
              </div>
            )}
          </div>

          <footer className="flex items-center justify-between border-t border-[#1f242e] px-4 py-3">
            <span className="text-[10px] text-[#667587]">
              Showing {filteredLogs.length} of{" "}
              {diagnosticLogs.length} mock events
            </span>

            <span className="text-[10px] text-[#667587]">
              Phase 1 · frontend data
            </span>
          </footer>
        </section>

        <section className="mt-6 rounded-[10px] border border-[#1f242e] bg-[#1b1309] px-[18px] py-3">
          <p className="text-[9px] font-semibold text-[#ebb252]">
            LOGGING BOUNDARY
          </p>

          <p className="mt-2 text-[11px] leading-5 text-[#d1b88c]">
            Diagnostic logs must never contain bearer tokens,
            authorization codes, private keys, provider secrets or other
            credentials.
          </p>
        </section>
      </div>
    </AdminLayout>
  );
}