import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Clock, CheckCircle2, Circle, BookOpen } from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { getUnit } from "@/lib/db-queries";
import { getLessonsByUnit } from "@/lib/db";
import { DEFAULT_STUDENT_ID, formatTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

const TYPE_LABELS: Record<string, string> = {
  dialogue: "对话",
  story: "故事",
  chant: "歌谣",
  song: "歌曲",
  words: "词汇",
};

export default async function UnitPage({
  params,
}: {
  params: { unitId: string };
}) {
  const unit = await getUnit(params.unitId);
  if (!unit) notFound();

  const lessons = await getLessonsByUnit(unit.id, DEFAULT_STUDENT_ID);

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="container flex-1 py-8">
        <Link
          href={`/grade/${unit.gradeId}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ChevronLeft className="h-4 w-4" /> 返回{unit.grade.name}
        </Link>

        <div className="mb-8">
          <div className="text-sm text-muted-foreground">
            Unit {unit.number}
          </div>
          <h1 className="text-2xl font-bold">
            {unit.icon} {unit.title}
          </h1>
          {unit.description && (
            <p className="mt-1 text-muted-foreground">{unit.description}</p>
          )}
        </div>

        <h2 className="mb-4 flex items-center gap-2 font-semibold">
          <BookOpen className="h-5 w-5" /> 课文列表
        </h2>

        <div className="grid gap-3 sm:grid-cols-2">
          {lessons.map((lesson) => (
            <Link
              key={lesson.id}
              href={`/lesson/${lesson.id}`}
              className="group rounded-2xl border bg-card p-5 shadow-sm transition-all hover:shadow-md hover:border-primary/40"
            >
              <div className="flex items-start gap-4">
                <div className="text-3xl">{lesson.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      Part {lesson.part}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {TYPE_LABELS[lesson.type] ?? lesson.type}
                    </span>
                  </div>
                  <h3 className="mt-1 font-bold group-hover:text-primary transition-colors">
                    {lesson.title}
                  </h3>
                  <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTime(lesson.duration)}
                    </span>
                    {lesson.completed ? (
                      <span className="flex items-center gap-1 text-accent">
                        <CheckCircle2 className="h-3 w-3" /> 已完成
                      </span>
                    ) : lesson.progressPercentage ? (
                      <span className="flex items-center gap-1 text-amber-500">
                        <Circle className="h-3 w-3" /> {Math.round(lesson.progressPercentage)}%
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Circle className="h-3 w-3" /> 未开始
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
