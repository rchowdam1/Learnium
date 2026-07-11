import { BookOpen, CheckCircle2, TrendingUp } from "lucide-react";

type StatCardProps = {
  title: string;
  icon: number; // number indicates which icon to use
  content: string;
};

export default function StatCard({ title, icon, content }: StatCardProps) {
  const Icon = icon === 1 ? BookOpen : icon === 2 ? CheckCircle2 : TrendingUp;

  return (
    <div className="group rounded-xl border border-border bg-surface-raised p-5 text-primary transition-colors duration-150 hover:border-border-strong">
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="text-label text-sm text-muted">{title}</span>
          <div className="mt-3 text-numeral text-3xl leading-none tracking-tight">
            {content}
          </div>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface text-brand">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
