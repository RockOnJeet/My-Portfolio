import AdminLayout from "@/components/admin/AdminLayout";

const site = {
  status: "Healthy",
  runtimeOverrides: 0,
  mutableProperties: 0,
  deployment: "Production",
} as const;

export default function AdminSite() {
  return (
    <AdminLayout>
      <div className="mx-auto max-w-[1160px] px-6 pb-12 pt-9 md:px-12">
        <header>
          <h1 className="text-[28px] font-semibold leading-tight text-[#e8f0fa]">
            Site
          </h1>

          <p className="mt-1 text-[13px] text-[#7a8a9e]">
            Runtime-manageable portfolio configuration.
          </p>
        </header>

        <section className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard label="STATUS" value={site.status} healthy />
          <SummaryCard
            label="RUNTIME OVERRIDES"
            value={String(site.runtimeOverrides)}
          />
          <SummaryCard
            label="MUTABLE PROPERTIES"
            value={String(site.mutableProperties)}
          />
          <SummaryCard label="DEPLOYMENT" value={site.deployment} />
        </section>

        <section className="mt-10 rounded-xl border border-[#1f242e] bg-[#0d1013] p-5">
          <h2 className="text-[15px] font-semibold text-[#e8f0fa]">
            Runtime properties
          </h2>

          <p className="mt-2 max-w-2xl text-[11px] leading-5 text-[#7a8a9e]">
            No site properties are currently exposed as runtime-manageable
            configuration.
          </p>

          <div className="mt-6 rounded-lg border border-dashed border-[#252c36] bg-[#090b0e] px-6 py-12 text-center">
            <p className="text-[12px] font-semibold text-[#a7b4c4]">
              No mutable properties
            </p>

            <p className="mx-auto mt-2 max-w-lg text-[10px] leading-5 text-[#667587]">
              Properties should only appear here after a concrete runtime
              configuration requirement is identified.
            </p>
          </div>
        </section>

        <section className="mt-6 rounded-[10px] border border-[#1f242e] bg-[#1b1309] px-[18px] py-3">
          <p className="text-[9px] font-semibold text-[#ebb252]">
            CONFIGURATION BOUNDARY
          </p>

          <p className="mt-2 text-[11px] leading-5 text-[#d1b88c]">
            Deployment-managed credentials, build-time configuration and
            secrets are not site runtime properties and must not be exposed
            through this control plane.
          </p>
        </section>
      </div>
    </AdminLayout>
  );
}

function SummaryCard({
  label,
  value,
  healthy = false,
}: {
  label: string;
  value: string;
  healthy?: boolean;
}) {
  return (
    <div className="min-h-[92px] rounded-xl border border-[#1f242e] bg-[#0d1013] p-4">
      <p className="text-[9px] font-semibold tracking-wide text-[#5c6b7d]">
        {label}
      </p>

      <p
        className={[
          "mt-3 text-lg font-semibold",
          healthy ? "text-[#59e594]" : "text-[#e8f0fa]",
        ].join(" ")}
      >
        {value}
      </p>
    </div>
  );
}