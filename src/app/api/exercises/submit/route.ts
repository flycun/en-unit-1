import { NextRequest, NextResponse } from "next/server";
import { saveExerciseResult } from "@/lib/db";
import { submitExerciseSchema } from "@/lib/validations";
import { DEFAULT_STUDENT_ID } from "@/lib/utils";

/** POST /api/exercises/submit —— 提交练习答案，返回得分 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = submitExerciseSchema.safeParse({
      ...body,
      studentId: DEFAULT_STUDENT_ID,
    });
    if (!parsed.success) {
      return NextResponse.json(
        { error: "参数校验失败", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { lessonId, studentId, total, correct, detail } = parsed.data;
    const score = Math.round((correct / total) * 100);

    const result = await saveExerciseResult(
      lessonId,
      studentId,
      { total, correct, score, detail }
    );
    return NextResponse.json(result);
  } catch (error) {
    console.error("[API] 提交练习失败:", error);
    return NextResponse.json({ error: "提交练习失败" }, { status: 500 });
  }
}
