import { Card } from "@/components/layout/Card";

interface StatCardProps {
  label: string;
  value: string;
}

export function StatCard({ label, value }: StatCardProps) {
  return (
    <Card className="bg-dark-700 text-center">
      <div className="mb-1 text-4xl font-bold text-white">{value}</div>
      <div className="text-sm text-white/50">{label}</div>
    </Card>
  );
}
