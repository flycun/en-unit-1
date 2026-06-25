import { NextRequest, NextResponse } from "next/server";
import { getLessonById } from "@/lib/db";

/** GET /api/lessons/[lessonId] —— 获取课文详情（含句子和时间戳） */
export async function GET(
  _req: NextRequest,
  { params }: { params: { lessonId: string } }
) {
  try {
    const lesson = await getLessonById(params.lessonId);
    if (!lesson) {
      return NextResponse.json({ error: "课文不存在" }, { status: 404 });
    }
    return NextResponse.json(lesson);
  } catch (error) {
    console.error("[API] 获取课文详情失败:", error);
    return NextResponse.json({ error: "获取课文详情失败" }, { status: 500 });
  }
}
