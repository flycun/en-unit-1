import { NextResponse } from "next/server";
import { getGrades } from "@/lib/db";

/** GET /api/grades —— 获取所有年级 */
export async function GET() {
  try {
    const grades = await getGrades();
    return NextResponse.json(grades);
  } catch (error) {
    console.error("[API] 获取年级失败:", error);
    return NextResponse.json(
      { error: "获取年级列表失败" },
      { status: 500 }
    );
  }
}
