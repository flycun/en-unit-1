import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/layout/site-header";
import { ExerciseRunner } from "@/components/exercise/exercise-runner";
import { getExercisesByLesson, getLessonById } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function ExercisePage({
  params,
}: {
  params: { lessonId: string };
}) {
  const lesson = await getLessonById(params.lessonId);
  if (!lesson) notFound();

  const exercises = await getExercisesByLesson(params.lessonId);

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="container flex-1 py-8">
        {exercises.length === 0 ? (
          <div className="mx-auto max-w-md text-center text-muted-foreground py-20">
            <div className="text-5xl mb-3">📝</div>
            <p>本课暂无练习题</p>
          </div>
        ) : (
          <ExerciseRunner
            exercises={exercises}
            lessonId={lesson.id}
            lessonTitle={lesson.title}
            backHref={`/lesson/${lesson.id}`}
          />
        )}
      </main>
    </div>
  );
}
