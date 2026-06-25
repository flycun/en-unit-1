import { NextResponse } from "next/server";
import { getStudyStats } from "@/lib/db";
import { DEFAULT_STUDENT_ID } from "@/lib/utils";

/** GET /api/stats —— 获取首页整体学习统计 */
export async function GET() {
  try {
    const stats = await getStudyStats(DEFAULT_STUDENT_ID);
    return NextResponse.json(stats);
  } catch (error) {
    console.error("[API] 获取统计失败:", error);
    return NextResponse.json({ error: "获取学习统计失败" }, { status: 500 });
  }
}
