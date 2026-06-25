import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, PenLine } from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { LessonPlayer } from "@/components/lesson/lesson-player";
import { Button } from "@/components/ui/button";
import { getLessonById } from "@/lib/db";
import { getUnit } from "@/lib/db-queries";
import { formatTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function LessonPage({
  params,
}: {
  params: { lessonId: string };
}) {
  const lesson = await getLessonById(params.lessonId);
  if (!lesson) notFound();

  const unit = await getUnit(lesson.unitId);

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="container flex-1 py-6">
        <div className="flex items-center justify-between mb-4">
          <Link
            href={`/unit/${lesson.unitId}`}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
            {unit ? `返回 Unit ${unit.number}` : "返回单元"}
          </Link>
          <Button asChild variant="outline" size="sm">
            <Link href={`/lesson/${lesson.id}/exercise`}>
              <PenLine className="h-4 w-4" /> 课后练习
            </Link>
          </Button>
        </div>

        {/* 标题 */}
        <div className="mb-4">
          <h1 className="text-xl font-bold">
            {lesson.icon} {lesson.title}
          </h1>
          <p className="text-sm text-muted-foreground">
            Part {lesson.part} · 时长 {formatTime(lesson.duration)}
          </p>
        </div>

        {/* 播放器 + 课文（客户端组件） */}
        <LessonPlayer lesson={lesson} />
      </main>
    </div>
  );
}
