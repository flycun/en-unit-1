import { NextRequest, NextResponse } from "next/server";
import { getProgress, saveProgress } from "@/lib/db";
import { saveProgressSchema } from "@/lib/validations";
import { DEFAULT_STUDENT_ID } from "@/lib/utils";

/**
 * GET /api/progress?lessonId=xxx —— 获取某课文的学习进度
 * POST /api/progress —— 保存/更新学习进度
 */

export async function GET(req: NextRequest) {
  try {
    const lessonId = req.nextUrl.searchParams.get("lessonId");
    if (!lessonId) {
      return NextResponse.json(
        { error: "缺少 lessonId 参数" },
        { status: 400 }
      );
    }
    const progress = await getProgress(lessonId, DEFAULT_STUDENT_ID);
    return NextResponse.json(progress ?? { lastPosition: 0, completed: false });
  } catch (error) {
    console.error("[API] 获取进度失败:", error);
    return NextResponse.json({ error: "获取进度失败" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = saveProgressSchema.safeParse({
      ...body,
      studentId: DEFAULT_STUDENT_ID,
    });
    if (!parsed.success) {
      return NextResponse.json(
        { error: "参数校验失败", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const result = await saveProgress(
      parsed.data.lessonId,
      parsed.data.studentId,
      {
        lastPosition: parsed.data.lastPosition,
        completedDuration: parsed.data.completedDuration,
        percentage: parsed.data.percentage,
        completed: parsed.data.completed,
      }
    );
    return NextResponse.json(result);
  } catch (error) {
    console.error("[API] 保存进度失败:", error);
    return NextResponse.json({ error: "保存进度失败" }, { status: 500 });
  }
}
