import { BookOpen, Trophy, ChartLine } from "lucide-react";

type StatCardProps = {
  title: string;
  icon: number; // number indicates which icon to use
  content: string;
};

export default function StatCard({ title, icon, content }: StatCardProps) {
  return (
    <div className="h-30 w-100 rounded-xl border border-border bg-surface-raised px-4 py-5 text-primary">
      <div className="flex flex-row items-center justify-between space-y-0 pb-2">
        <span className="text-label text-sm">{title}</span>
        {icon === 1 ? (
          <BookOpen className="h-4 w-4 text-muted" />
        ) : icon === 2 ? (
          <Trophy className="h-4 w-4 text-muted" />
        ) : icon === 3 ? (
          <ChartLine className="h-4 w-4 text-muted" />
        ) : (
          ""
        )}
      </div>

      <div className="pt-3">
        <span className="text-numeral text-2xl font-bold">{content}</span>
      </div>
    </div>
  );
}
