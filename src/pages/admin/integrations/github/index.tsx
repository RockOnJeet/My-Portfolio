import AdminLayout from "@/components/admin/AdminLayout";
import type { ReactNode } from "react";
import { Link } from "wouter";

const github = {
  enabled: false,
  connected: false,
  installation: "Not configured",
  account: "Not connected",
  token: "Installation token issued on demand",
  repository: "No repository selected",
  health: {
    appAuthentication: "Not tested",
    installationToken: "Unavailable",
    repositoryAccess: "Unavailable",
    lastProbe: "Not run",
  },
  capabilities: [
    {
      id: "contents.read",
      description: "Read repository contents and metadata",
    },
    {
      id: "contents.write",
      description: "Create or update repository contents",
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
  danger = false,
  className = "",
}: {
  children: ReactNode;
  danger?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      disabled
      title="GitHub integration management is not implemented in Phase 1."
      className={[
        "h-8 rounded-lg border border-[#1f242e] px-6 text-[11px] font-semibold",
        danger
          ? "bg-[#180e0f] text-[#f28c8c]"
          : "bg-[#131b24] text-[#b2d6f7]",
        disabledButtonClass,
        className,
      ].join(" ")}
    >
      {children}
    </button>
  );
}

export default function AdminGitHubIntegration() {
  return (
    <AdminLayout>
      <div className="mx-auto max-w-[1160px] px-6 pb-12 pt-7 md:px-12">
        <p className="text-[11px] font-semibold text-[#7a8a9e]">
          Integrations / GitHub
        </p>

        <header className="mt-3 flex flex-col gap-5 sm:flex-row sm:items-start">
          <div className="flex size-[58px] shrink-0 items-center justify-center rounded-[14px] border border-[#1f242e] bg-[#1a1c21] text-[18px] font-semibold text-[#e8f0fa]">
            GH
          </div>

          <div>
            <h1 className="text-[27px] font-semibold leading-tight text-[#e8f0fa]">
              GitHub
            </h1>

            <p className="mt-1 text-[11px] text-[#7a8a9e]">
              GitHub App · repository service
            </p>
          </div>

          <div className="flex items-center gap-3 sm:ml-auto sm:pt-3">
            <span className="text-[11px] font-semibold text-[#7a8a9e]">
              {github.enabled ? "Enabled" : "Disabled"}
            </span>

            <span
              className={[
                "size-[7px] rounded-full",
                github.connected ? "bg-[#59e594]" : "bg-[#ebb252]",
              ].join(" ")}
            />

            <span
              className={[
                "text-[11px] font-semibold",
                github.connected ? "text-[#59e594]" : "text-[#ebb252]",
              ].join(" ")}
            >
              {github.connected ? "Connected" : "Not connected"}
            </span>
          </div>
        </header>

        <section className="mt-6 rounded-[10px] border border-[#1f242e] bg-[#1b1309] px-[18px] py-3">
          <p className="text-[9px] font-semibold text-[#ebb252]">
            CONFIGURATION BOUNDARY
          </p>

          <p className="mt-2 text-[11px] text-[#d1b88c]">
            GitHub App credentials and private key are deployment-managed and
            cannot be viewed or changed here.
          </p>
        </section>

        <section className="mt-9 grid gap-6 xl:grid-cols-2">
          <article className={`${cardClass} p-[18px]`}>
            <h2 className="text-[15px] font-semibold text-[#e8f0fa]">
              Installation
            </h2>

            <dl className="mt-5 space-y-3">
              <DetailRow label="App status">
                <span className="font-semibold text-[#ebb252]">
                  Not connected
                </span>
              </DetailRow>

              <DetailRow label="Installation">
                <span className="text-[#b2bfcf]">
                  {github.installation}
                </span>
              </DetailRow>

              <DetailRow label="Account">
                <span className="text-[#b2bfcf]">{github.account}</span>
              </DetailRow>

              <DetailRow label="Token">
                <span className="text-[#b2bfcf]">{github.token}</span>
              </DetailRow>
            </dl>

            <div className="mt-5 flex flex-wrap gap-3">
              <DisabledButton>Refresh installation</DisabledButton>
              <DisabledButton danger>Disconnect</DisabledButton>
            </div>
          </article>

          <article className={`${cardClass} p-[18px]`}>
            <h2 className="text-[15px] font-semibold text-[#e8f0fa]">
              Health &amp; testing
            </h2>

            <dl className="mt-5 space-y-3">
              <DetailRow label="App authentication">
                <span className="text-[#adbacc]">
                  {github.health.appAuthentication}
                </span>
              </DetailRow>

              <DetailRow label="Installation token">
                <span className="text-[#adbacc]">
                  {github.health.installationToken}
                </span>
              </DetailRow>

              <DetailRow label="Repository access">
                <span className="text-[#adbacc]">
                  {github.health.repositoryAccess}
                </span>
              </DetailRow>

              <DetailRow label="Last API probe">
                <span className="text-[#adbacc]">
                  {github.health.lastProbe}
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
            Repository
          </h2>

          <p className="mt-1 text-[11px] text-[#7a8a9e]">
            Select the repository exposed through the backend GitHub service.
          </p>

          <div className={`${cardClass} mt-4 p-[18px]`}>
            <label
              htmlFor="github-repository"
              className="text-[10px] font-semibold text-[#7a8a9e]"
            >
              Selected repository
            </label>

            <div className="mt-3 flex flex-col gap-3 lg:flex-row">
              <input
                id="github-repository"
                type="text"
                readOnly
                value={github.repository}
                className="h-[42px] min-w-0 flex-1 rounded-[7px] border border-[#1f242e] bg-[#090b0e] px-[14px] text-[12px] text-[#c7d1e0] outline-none"
              />

              <DisabledButton className="h-[42px] lg:w-[118px]">
                Change
              </DisabledButton>

              <DisabledButton className="h-[42px] bg-[#121418] text-[#adbacc] lg:w-[124px]">
                Clear
              </DisabledButton>
            </div>

            <p className="mt-3 text-[10px] text-[#ebb252]">
              Repository access remains constrained by the GitHub App
              installation.
            </p>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-[17px] font-semibold text-[#e8f0fa]">
            Capabilities
          </h2>

          <p className="mt-1 text-[11px] text-[#7a8a9e]">
            Backend operations permitted through GitHubService. GitHub remains
            authoritative for actual App permissions.
          </p>

          <div className={`${cardClass} mt-4 p-[18px]`}>
            <div className="space-y-5">
              {github.capabilities.map((capability) => (
                <div
                  key={capability.id}
                  className="grid gap-3 sm:grid-cols-[176px_1fr_auto] sm:items-center"
                >
                  <span className="text-[11px] font-semibold text-[#94bfeb]">
                    {capability.id}
                  </span>

                  <span className="text-[10px] text-[#7a8a9e]">
                    {capability.description}
                  </span>

                  <button
                    type="button"
                    disabled
                    title="Capability management is not implemented in Phase 1."
                    className={`h-[30px] w-[138px] rounded-[7px] border border-[#1f242e] bg-[#160e0f] text-[10px] font-semibold text-[#eb8c8c] ${disabledButtonClass}`}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                disabled
                title="Capability management is not implemented in Phase 1."
                className={`h-[34px] w-[156px] rounded-lg border border-[#1f242e] bg-[#12181f] text-[11px] font-semibold text-[#b8d6f2] ${disabledButtonClass}`}
              >
                + Add capability
              </button>

              <span className="text-[10px] text-[#ebb252]">
                Unavailable operations cannot exceed permissions granted to
                the GitHub App installation.
              </span>
            </div>
          </div>
        </section>

        <section className="mt-10 flex flex-col gap-3 rounded-[9px] border border-[#1f242e] bg-[#0a0c0f] px-[18px] py-4 sm:flex-row sm:items-center">
          <span className="text-[11px] font-semibold text-[#e8f0fa]">
            Integration logs
          </span>

          <span className="text-[10px] text-[#7a8a9e] sm:ml-8">
            Authentication, token, repository and capability events
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