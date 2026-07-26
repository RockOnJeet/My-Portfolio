import AdminLayout from "@/components/admin/AdminLayout";

interface SectionPlaceholderProps {
  title: string;
  description: string;
}

export default function SectionPlaceholder({
  title,
  description,
}: SectionPlaceholderProps) {
  return (
    <AdminLayout>
      <div className="mx-auto max-w-[1160px] px-6 pb-12 pt-9 md:px-12">
        <header>
          <h1 className="text-[28px] font-semibold leading-tight text-[#e8f0fa]">
            {title}
          </h1>

          <p className="mt-1 text-[13px] text-[#7a8a9e]">
            {description}
          </p>
        </header>

        <div className="mt-10 rounded-xl border border-dashed border-[#1f242e] bg-[#0d1013] px-6 py-16 text-center">
          <p className="text-[12px] text-[#617082]">
            Management interface will be added in the next implementation
            checkpoint.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}