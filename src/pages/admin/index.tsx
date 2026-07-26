import AdminLayout from "@/components/admin/AdminLayout";

export default function Admin() {
  return (
    <AdminLayout>
      <div className="mx-auto max-w-[1192px] px-6 py-9 md:px-12">
        <header>
          <h1 className="text-[30px] font-semibold tracking-tight text-white">
            Dashboard
          </h1>

          <p className="mt-1 text-[13px] text-white/40">
            Control-plane summary · detailed configuration lives in each
            management page
          </p>
        </header>

        <div className="mt-12 rounded-lg border border-dashed border-white/10 px-6 py-16 text-center">
          <p className="text-sm text-white/35">
            Dashboard components will be added in the next checkpoint.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}