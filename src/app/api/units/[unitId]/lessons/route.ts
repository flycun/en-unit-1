import { NextRequest, NextResponse } from "next/server";
import { getLessonsByUnit } from "@/lib/db";
import { DEFAULT_STUDENT_ID } from "@/lib/utils";

/** GET /api/units/[unitId]/lessons —— 获取单元下的课文列表（含进度） */
export async function GET(
  _req: NextRequest,
  { params }: { params: { unitId: string } }
) {
  try {
    const studentId = DEFAULT_STUDENT_ID;
    const lessons = await getLessonsByUnit(params.unitId, studentId);
    return NextResponse.json(lessons);
  } catch (error) {
    console.error("[API] 获取课文列表失败:", error);
    return NextResponse.json({ error: "获取课文列表失败" }, { status: 500 });
  }
}
