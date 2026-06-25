import { NextRequest, NextResponse } from "next/server";
import { getExercisesByLesson } from "@/lib/db";

/** GET /api/lessons/[lessonId]/exercises —— 获取课文练习题 */
export async function GET(
  _req: NextRequest,
  { params }: { params: { lessonId: string } }
) {
  try {
    const exercises = await getExercisesByLesson(params.lessonId);
    return NextResponse.json(exercises);
  } catch (error) {
    console.error("[API] 获取练习题失败:", error);
    return NextResponse.json({ error: "获取练习题失败" }, { status: 500 });
  }
}
