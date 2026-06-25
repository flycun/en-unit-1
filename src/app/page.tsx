import Link from "next/link";
import { SiteHeader } from "@/components/layout/site-header";
import { StatsPanel } from "@/components/progress/stats-panel";
import { GradeCard } from "@/components/lesson/grade-card";
import { getGrades, getStudyStats, getUnitsByGrade } from "@/lib/db";
import { DEFAULT_STUDENT_ID } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [grades, stats] = await Promise.all([
    getGrades(),
    getStudyStats(DEFAULT_STUDENT_ID),
  ]);

  // 预取每个年级第一个单元用于卡片预览（简化：只显示数量）
  const gradesWithProgress = await Promise.all(
    grades.map(async (g) => {
      const units = await getUnitsByGrade(g.id, DEFAULT_STUDENT_ID);
      const avgProgress =
        units.length > 0
          ? Math.round(
              units.reduce(
                (sum, u) => sum + (u.progressPercentage ?? 0),
                0
              ) / units.length
            )
          : 0;
      return { ...g, avgProgress };
    })
  );

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="container flex-1 py-8">
        {/* 欢迎区 + 统计 */}
        <section className="mb-10">
          <div className="rounded-3xl bg-gradient-to-br from-primary/10 via-accent/5 to-background p-6 sm:p-8">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              👋 欢迎来到英语听力课堂
            </h1>
            <p className="mt-2 text-muted-foreground">
              跟着课文逐句听读，边听边学，轻松提高英语听力！
            </p>
            <div className="mt-6">
              <StatsPanel stats={stats} />
            </div>
          </div>
        </section>

        {/* 年级入口 */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">📚 选择年级</h2>
            <span className="text-sm text-muted-foreground">
              人教 PEP（三年级起点）
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {gradesWithProgress.map((grade) => (
              <GradeCard key={grade.id} grade={grade} />
            ))}
          </div>
        </section>
      </main>
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        英语听力课堂 · 小学英语同步学习应用
      </footer>
    </div>
  );
}
