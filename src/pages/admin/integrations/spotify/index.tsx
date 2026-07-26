import AdminLayout from "@/components/admin/AdminLayout";
import { Link } from "wouter";

const spotify = {
  enabled: true,
  connected: true,
  authorization: "Active · refresh token available",
  account: "Portfolio owner",
  health: {
    lastProbe: "Succeeded · 184 ms",
    tokenRefresh: "OK",
    playbackApi: "OK",
  },
  capabilities: [
    {
      id: "playback.read",
      description: "Current playback and device state",
    },
    {
      id: "queue.read",
      description: "Upcoming queue metadata",
    },
  ],
  endpoint: "/api/spotify/console",
} as const;

const cardClass =
  "rounded-[10px] border border-[#1f242e] bg-[#0d1013]";

const disabledButtonClass =
  "cursor-not-allowed opacity-60";

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[116px_1fr] gap-4 text-[11px]">
      <dt className="text-[10px] text-[#7a8a9e]">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

export default function AdminSpotifyIntegration() {
  return (
    <AdminLayout>
      <div className="mx-auto max-w-[1160px] px-6 pb-12 pt-7 md:px-12">
        <p className="text-[11px] font-semibold text-[#7a8a9e]">
          Integrations / Spotify
        </p>

        <header className="mt-3 flex flex-col gap-5 sm:flex-row sm:items-start">
          <div className="flex size-[58px] shrink-0 items-center justify-center rounded-[14px] border border-[#1f242e] bg-[#0d3321] text-[22px] font-semibold text-[#59e594]">
            S
          </div>

          <div>
            <h1 className="text-[27px] font-semibold leading-tight text-[#e8f0fa]">
              Spotify
            </h1>
            <p className="mt-1 text-[11px] text-[#7a8a9e]">
              OAuth integration · owner account
            </p>
          </div>

          <div className="flex items-center gap-2 sm:ml-auto sm:pt-3">
            <span className="text-[11px] font-semibold text-[#59e594]">
              {spotify.enabled ? "Enabled" : "Disabled"}
            </span>

            <span className="size-[7px] rounded-full bg-[#59e594]" />

            <span className="text-[11px] font-semibold text-[#59e594]">
              {spotify.connected ? "Connected" : "Not connected"}
            </span>
          </div>
        </header>

        <section className="mt-6 rounded-[10px] border border-[#1f242e] bg-[#1b1309] px-[18px] py-3">
          <p className="text-[9px] font-semibold text-[#ebb252]">
            CONFIGURATION BOUNDARY
          </p>

          <p className="mt-2 text-[11px] text-[#d1b88c]">
            Provider credentials are deployment-managed and cannot be viewed
            or changed from this control plane.
          </p>
        </section>

        <section className="mt-9 grid gap-6 xl:grid-cols-2">
          <article className={`${cardClass} p-[18px]`}>
            <h2 className="text-[15px] font-semibold text-[#e8f0fa]">
              Connection
            </h2>

            <dl className="mt-5 space-y-3">
              <DetailRow label="OAuth status">
                <span className="font-semibold text-[#59e594]">
                  Connected
                </span>
              </DetailRow>

              <DetailRow label="Authorization">
                <span className="text-[#b2bfcf]">
                  {spotify.authorization}
                </span>
              </DetailRow>

              <DetailRow label="Account">
                <span className="text-[#b2bfcf]">{spotify.account}</span>
              </DetailRow>
            </dl>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                disabled
                title="Spotify authorization management is not implemented in Phase 1."
                className={`h-8 rounded-lg border border-[#1f242e] bg-[#131b24] px-6 text-[11px] font-semibold text-[#b2d6f7] ${disabledButtonClass}`}
              >
                Reauthorize
              </button>

              <button
                type="button"
                disabled
                title="Spotify authorization management is not implemented in Phase 1."
                className={`h-8 rounded-lg border border-[#1f242e] bg-[#180e0f] px-6 text-[11px] font-semibold text-[#f28c8c] ${disabledButtonClass}`}
              >
                Disconnect
              </button>
            </div>
          </article>

          <article className={`${cardClass} p-[18px]`}>
            <h2 className="text-[15px] font-semibold text-[#e8f0fa]">
              Health &amp; testing
            </h2>

            <dl className="mt-5 space-y-3">
              <DetailRow label="Last probe">
                <span className="font-semibold text-[#59e594]">
                  {spotify.health.lastProbe}
                </span>
              </DetailRow>

              <DetailRow label="Token refresh">
                <span className="font-semibold text-[#59e594]">
                  {spotify.health.tokenRefresh}
                </span>
              </DetailRow>

              <DetailRow label="Playback API">
                <span className="font-semibold text-[#59e594]">
                  {spotify.health.playbackApi}
                </span>
              </DetailRow>
            </dl>

            <button
              type="button"
              disabled
              title="Integration health testing is not implemented in Phase 1."
              className={`mt-5 h-8 rounded-lg border border-[#1f242e] bg-[#12181f] px-6 text-[11px] font-semibold text-[#b8d6f2] ${disabledButtonClass}`}
            >
              Run health test
            </button>
          </article>
        </section>

        <section className="mt-10">
          <h2 className="text-[17px] font-semibold text-[#e8f0fa]">
            Capabilities
          </h2>

          <p className="mt-1 text-[11px] text-[#7a8a9e]">
            Add or remove provider capabilities used by this integration.
          </p>

          <div className={`${cardClass} mt-4 p-[18px]`}>
            <div className="space-y-5">
              {spotify.capabilities.map((capability) => (
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
                Authorization may need refreshing after scope changes.
              </span>
            </div>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-[17px] font-semibold text-[#e8f0fa]">
            Endpoint
          </h2>

          <p className="mt-1 text-[11px] text-[#7a8a9e]">
            Configure the backend route used by the Spotify frontend.
          </p>

          <div className={`${cardClass} mt-4 p-[18px]`}>
            <label
              htmlFor="spotify-endpoint"
              className="text-[10px] font-semibold text-[#7a8a9e]"
            >
              Endpoint path
            </label>

            <div className="mt-3 flex flex-col gap-3 lg:flex-row">
              <input
                id="spotify-endpoint"
                type="text"
                readOnly
                value={spotify.endpoint}
                aria-describedby="spotify-endpoint-note"
                className="h-[42px] min-w-0 flex-1 rounded-[7px] border border-[#1f242e] bg-[#090b0e] px-[14px] text-[12px] text-[#c7d1e0] outline-none"
              />

              <button
                type="button"
                disabled
                className={`h-[42px] rounded-[7px] border border-[#1f242e] bg-[#131b24] px-10 text-[11px] font-semibold text-[#b2d6f7] ${disabledButtonClass}`}
              >
                Save
              </button>

              <button
                type="button"
                disabled
                className={`h-[42px] rounded-[7px] border border-[#1f242e] bg-[#121418] px-10 text-[11px] font-semibold text-[#adbacc] ${disabledButtonClass}`}
              >
                Reset
              </button>
            </div>

            <p id="spotify-endpoint-note" className="sr-only">
              Endpoint editing will be enabled when runtime configuration is
              implemented.
            </p>
          </div>
        </section>

        <section className="mt-8 flex flex-col gap-3 rounded-[9px] border border-[#1f242e] bg-[#0a0c0f] px-[18px] py-4 sm:flex-row sm:items-center">
          <span className="text-[11px] font-semibold text-[#e8f0fa]">
            Integration logs
          </span>

          <span className="text-[10px] text-[#7a8a9e] sm:ml-8">
            OAuth, health, capability and endpoint events
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