import { BookOpen, Trophy, ChartLine } from "lucide-react";

type StatCardProps = {
  title: string;
  icon: number; // number indicates which icon to use
  content: string;
};

export default function StatCard({ title, icon, content }: StatCardProps) {
  return (
    <div className="h-30 w-100 bg-white rounded-sm bg-card text-card-foreground shadow-sm px-4 py-5">
      {/*Card Header*/}
      <div className="flex flex-row items-center justify-between space-y-0 pb-2">
        <span className="text-sm font-bold">{title}</span>
        {/*<BookOpen className="h-4 w-4 text-muted-foreground" />*/}
        {icon === 1 ? (
          <BookOpen className="h-4 w-4 text-muted-foreground" />
        ) : icon === 2 ? (
          <Trophy className="h-4 w-4 text-muted-foreground" />
        ) : icon === 3 ? (
          <ChartLine className="h-4 w-4 text-muted-foreground" />
        ) : (
          ""
        )}
      </div>

      {/*Card Content*/}
      <div className="pt-3">
        <span className="text-2xl font-bold">{content}</span>
      </div>
    </div>
  );
}
