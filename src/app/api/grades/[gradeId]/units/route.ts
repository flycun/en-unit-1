import { NextRequest, NextResponse } from "next/server";
import { getUnitsByGrade } from "@/lib/db";
import { DEFAULT_STUDENT_ID } from "@/lib/utils";

/** GET /api/grades/[gradeId]/units —— 获取某年级下的单元列表 */
export async function GET(
  _req: NextRequest,
  { params }: { params: { gradeId: string } }
) {
  try {
    const studentId = DEFAULT_STUDENT_ID;
    const units = await getUnitsByGrade(params.gradeId, studentId);
    return NextResponse.json(units);
  } catch (error) {
    console.error("[API] 获取单元失败:", error);
    return NextResponse.json({ error: "获取单元列表失败" }, { status: 500 });
  }
}
