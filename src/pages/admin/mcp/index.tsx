import AdminLayout from "@/components/admin/AdminLayout";
import type { ReactNode } from "react";
import { Link } from "wouter";

const mcp = {
  enabled: false,
  online: false,
  transport: "Streamable HTTP",
  protocol: "MCP",
  lastProbe: "Not run",
  endpoint: "/mcp",
  health: {
    endpoint: "Not tested",
    authentication: "Not tested",
    toolRegistry: "Not tested",
  },
  access: {
    authentication: "OAuth protected resource",
    policy: "Authenticated clients only",
    activeSessions: 0,
  },
  tools: [
    {
      id: "repo.search",
      description: "Search selected repository memory/index",
      service: "GitHubService",
      enabled: false,
    },
    {
      id: "repo.read",
      description: "Read repository file content",
      service: "GitHubService",
      enabled: false,
    },
    {
      id: "repo.write",
      description: "Write permitted repository content",
      service: "GitHubService",
      enabled: false,
    },
  ],
} as const;

const cardClass =
  "rounded-[10px] border border-[#1f242e] bg-[#0d1013]";

const disabledButtonClass = "cursor-not-allowed opacity-60";

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="grid grid-cols-[132px_1fr] gap-4 text-[11px]">
      <dt className="text-[10px] text-[#7a8a9e]">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

function DisabledButton({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      disabled
      title="MCP management is not implemented in Phase 1."
      className={[
        "h-8 rounded-lg border border-[#1f242e] bg-[#12181f]",
        "px-6 text-[11px] font-semibold text-[#b8d6f2]",
        disabledButtonClass,
        className,
      ].join(" ")}
    >
      {children}
    </button>
  );
}

export default function AdminMcp() {
  return (
    <AdminLayout>
      <div className="mx-auto max-w-[1160px] px-6 pb-12 pt-9 md:px-12">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-[28px] font-semibold leading-tight text-[#e8f0fa]">
              MCP Server
            </h1>

            <p className="mt-1 text-[13px] text-[#7a8a9e]">
              Expose selected backend capabilities to authenticated MCP
              clients.
            </p>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <span className="text-[11px] font-semibold text-[#7a8a9e]">
              {mcp.enabled ? "Enabled" : "Disabled"}
            </span>

            <span
              className={[
                "size-[7px] rounded-full",
                mcp.online ? "bg-[#59e594]" : "bg-[#ebb252]",
              ].join(" ")}
            />

            <span
              className={[
                "text-[11px] font-semibold",
                mcp.online ? "text-[#59e594]" : "text-[#ebb252]",
              ].join(" ")}
            >
              {mcp.online ? "Online" : "Offline"}
            </span>
          </div>
        </header>

        <section className="mt-9 grid gap-6 xl:grid-cols-2">
          <article className={`${cardClass} p-[18px]`}>
            <h2 className="text-[15px] font-semibold text-[#e8f0fa]">
              Server
            </h2>

            <dl className="mt-5 space-y-3">
              <DetailRow label="Status">
                <span className="font-semibold text-[#ebb252]">
                  {mcp.online ? "Online" : "Offline"}
                </span>
              </DetailRow>

              <DetailRow label="Transport">
                <span className="text-[#b2bfcf]">{mcp.transport}</span>
              </DetailRow>

              <DetailRow label="Protocol">
                <span className="text-[#b2bfcf]">{mcp.protocol}</span>
              </DetailRow>

              <DetailRow label="Last probe">
                <span className="text-[#adbacc]">{mcp.lastProbe}</span>
              </DetailRow>
            </dl>
          </article>

          <article className={`${cardClass} p-[18px]`}>
            <h2 className="text-[15px] font-semibold text-[#e8f0fa]">
              Health &amp; testing
            </h2>

            <dl className="mt-5 space-y-3">
              <DetailRow label="Endpoint">
                <span className="text-[#adbacc]">
                  {mcp.health.endpoint}
                </span>
              </DetailRow>

              <DetailRow label="Authentication">
                <span className="text-[#adbacc]">
                  {mcp.health.authentication}
                </span>
              </DetailRow>

              <DetailRow label="Tool registry">
                <span className="text-[#adbacc]">
                  {mcp.health.toolRegistry}
                </span>
              </DetailRow>
            </dl>

            <DisabledButton className="mt-5">
              Run health test
            </DisabledButton>
          </article>
        </section>

        <section className="mt-10">
          <h2 className="text-[17px] font-semibold text-[#e8f0fa]">
            Endpoint
          </h2>

          <p className="mt-1 text-[11px] text-[#7a8a9e]">
            Configure the MCP endpoint exposed to clients.
          </p>

          <div className={`${cardClass} mt-4 p-[18px]`}>
            <label
              htmlFor="mcp-endpoint"
              className="text-[10px] font-semibold text-[#7a8a9e]"
            >
              Endpoint path
            </label>

            <div className="mt-3 flex flex-col gap-3 lg:flex-row">
              <input
                id="mcp-endpoint"
                type="text"
                readOnly
                value={mcp.endpoint}
                className="h-[42px] min-w-0 flex-1 rounded-[7px] border border-[#1f242e] bg-[#090b0e] px-[14px] text-[12px] text-[#c7d1e0] outline-none"
              />

              <DisabledButton className="h-[42px] lg:w-[118px]">
                Save
              </DisabledButton>

              <DisabledButton className="h-[42px] bg-[#121418] text-[#adbacc] lg:w-[124px]">
                Reset
              </DisabledButton>
            </div>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-[17px] font-semibold text-[#e8f0fa]">
            Access policy
          </h2>

          <p className="mt-1 text-[11px] text-[#7a8a9e]">
            MCP authentication is independent from Admin Auth and
            integration/provider authentication.
          </p>

          <div
            className={`${cardClass} mt-4 flex flex-col gap-6 p-[18px] lg:flex-row lg:items-center`}
          >
            <dl className="min-w-0 flex-1 space-y-3">
              <DetailRow label="Authentication">
                <span className="text-[#b8c7d9]">
                  {mcp.access.authentication}
                </span>
              </DetailRow>

              <DetailRow label="Policy">
                <span className="text-[#b8c7d9]">
                  {mcp.access.policy}
                </span>
              </DetailRow>

              <DetailRow label="Active sessions">
                <span className="font-semibold text-[#adbacc]">
                  {mcp.access.activeSessions} clients
                </span>
              </DetailRow>
            </dl>

            <div className="flex shrink-0 flex-col gap-3">
              <DisabledButton className="lg:w-[208px]">
                Manage access policy →
              </DisabledButton>

              <DisabledButton className="bg-[#121418] text-[#adc2d6] lg:w-[208px]">
                View active clients →
              </DisabledButton>
            </div>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-[17px] font-semibold text-[#e8f0fa]">
            Tools
          </h2>

          <p className="mt-1 text-[11px] text-[#7a8a9e]">
            Enable only the MCP tools that should be exposed. Tools consume
            backend services; they do not own provider authentication.
          </p>

          <div className={`${cardClass} mt-4 p-[18px]`}>
            <div className="space-y-5">
              {mcp.tools.map((tool) => (
                <div
                  key={tool.id}
                  className="grid gap-3 md:grid-cols-[130px_1fr_130px_80px_auto] md:items-center"
                >
                  <span className="text-[11px] font-semibold text-[#94bfeb]">
                    {tool.id}
                  </span>

                  <span className="text-[10px] text-[#7a8a9e]">
                    {tool.description}
                  </span>

                  <span className="text-[10px] text-[#a1b0c2]">
                    {tool.service}
                  </span>

                  <span
                    className={[
                      "text-[10px] font-semibold",
                      tool.enabled
                        ? "text-[#59e594]"
                        : "text-[#ebb252]",
                    ].join(" ")}
                  >
                    {tool.enabled ? "Enabled" : "Disabled"}
                  </span>

                  <button
                    type="button"
                    disabled
                    title="MCP tool configuration is not implemented in Phase 1."
                    className={[
                      "h-[30px] w-[138px] cursor-not-allowed rounded-[7px]",
                      "border border-[#1f242e] text-[10px] font-semibold opacity-60",
                      tool.enabled
                        ? "bg-[#0e1c16] text-[#eb8c8c]"
                        : "bg-[#121418] text-[#b8d6f2]",
                    ].join(" ")}
                  >
                    {tool.enabled ? "Disable" : "Enable"}
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                disabled
                title="MCP tool registration is not implemented in Phase 1."
                className={`h-[30px] w-[136px] rounded-[7px] border border-[#1f242e] bg-[#12181f] text-[10px] font-semibold text-[#b8d6f2] ${disabledButtonClass}`}
              >
                + Add tool
              </button>

              <span className="text-[10px] text-[#ebb252]">
                Tool availability is additionally constrained by the backing
                service and integration capabilities.
              </span>
            </div>
          </div>
        </section>

        <section className="mt-10 flex flex-col gap-3 rounded-[9px] border border-[#1f242e] bg-[#0a0c0f] px-[18px] py-4 sm:flex-row sm:items-center">
          <span className="text-[11px] font-semibold text-[#e8f0fa]">
            MCP logs
          </span>

          <span className="text-[10px] text-[#7a8a9e] sm:ml-8">
            Authentication, sessions, tool calls, errors and configuration
            events
          </span>

          <Link
            href="/admin/logs"
            className="text-[10px] font-semibold text-[#a6c7e5] sm:ml-auto"
          >
            View logs →
          </Link>
        </section>
      </div>
    </AdminLayout>
  );
}