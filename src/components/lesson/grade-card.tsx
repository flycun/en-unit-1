import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { GradeDTO } from "@/types";

interface GradeCardProps {
  grade: GradeDTO & { avgProgress: number };
}

/** 年级入口卡片 */
export function GradeCard({ grade }: GradeCardProps) {
  return (
    <Link
      href={`/grade/${grade.id}`}
      className="group relative overflow-hidden rounded-3xl border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
    >
      {/* 背景色块 */}
      <div
        className="absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-15 transition-transform group-hover:scale-110"
        style={{ backgroundColor: grade.color }}
      />
      <div className="relative">
        <div className="text-4xl mb-3">{grade.icon}</div>
        <h3 className="text-lg font-bold">{grade.name}</h3>
        <p className="text-sm text-muted-foreground">{grade.semester}</p>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {grade.unitCount} 个单元 · {grade.avgProgress}%
          </span>
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
            <ChevronRight className="h-4 w-4" />
          </span>
        </div>

        {/* 进度条 */}
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${grade.avgProgress}%`,
              backgroundColor: grade.color,
            }}
          />
        </div>
      </div>
    </Link>
  );
}
