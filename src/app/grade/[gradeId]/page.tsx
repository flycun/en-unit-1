import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, BookMarked } from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { ProgressRing } from "@/components/ui/progress-ring";
import { getGrade } from "@/lib/db-queries";
import { getUnitsByGrade } from "@/lib/db";
import { DEFAULT_STUDENT_ID } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function GradePage({
  params,
}: {
  params: { gradeId: string };
}) {
  const grade = await getGrade(params.gradeId);
  if (!grade) notFound();

  const units = await getUnitsByGrade(grade.id, DEFAULT_STUDENT_ID);

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="container flex-1 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ChevronLeft className="h-4 w-4" /> 返回首页
        </Link>

        <div className="mb-8 flex items-center gap-4">
          <div className="text-5xl">{grade.icon}</div>
          <div>
            <h1 className="text-2xl font-bold">{grade.name}</h1>
            <p className="text-muted-foreground">
              人教 PEP · {grade.semester} · 共 {units.length} 个单元
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {units.map((unit) => (
            <Link
              key={unit.id}
              href={`/unit/${unit.id}`}
              className="group flex items-center gap-4 rounded-2xl border bg-card p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
            >
              <ProgressRing
                value={unit.progressPercentage ?? 0}
                size={56}
                color={grade.color}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <BookMarked className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Unit {unit.number}
                  </span>
                </div>
                <h3 className="text-lg font-bold truncate group-hover:text-primary transition-colors">
                  {unit.icon} {unit.title}
                </h3>
                <p className="text-xs text-muted-foreground truncate">
                  {unit.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
