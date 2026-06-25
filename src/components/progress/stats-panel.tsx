import { BookOpen, CheckCircle2, Headphones, TrendingUp } from "lucide-react";
import type { StudyStatsDTO } from "@/types";

/** 首页学习统计面板 */
export function StatsPanel({ stats }: { stats: StudyStatsDTO }) {
  const items = [
    {
      label: "总课文数",
      value: stats.totalLessons,
      icon: BookOpen,
      color: "text-blue-500",
    },
    {
      label: "已完成",
      value: stats.completedLessons,
      icon: CheckCircle2,
      color: "text-accent",
    },
    {
      label: "完成率",
      value: `${stats.overallPercentage}%`,
      icon: TrendingUp,
      color: "text-amber-500",
    },
    {
      label: "播放次数",
      value: stats.totalPlayCount,
      icon: Headphones,
      color: "text-purple-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex items-center gap-3 rounded-2xl bg-background/80 p-4 shadow-sm"
        >
          <item.icon className={`h-8 w-8 ${item.color}`} />
          <div>
            <div className="text-2xl font-bold tabular-nums">{item.value}</div>
            <div className="text-xs text-muted-foreground">{item.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
