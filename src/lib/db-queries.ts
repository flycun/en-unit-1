/**
 * 额外的数据查询函数（补充 db.ts）
 */
import { prisma } from "./prisma";
import type { GradeDTO } from "@/types";

/** 获取单个年级基础信息 */
export async function getGrade(id: string): Promise<
  | (Pick<GradeDTO, "id" | "level" | "name" | "semester" | "color" | "icon">)
  | null
> {
  const g = await prisma.grade.findUnique({ where: { id } });
  if (!g) return null;
  return {
    id: g.id,
    level: g.level,
    name: g.name,
    semester: g.semester,
    color: g.color,
    icon: g.icon,
  };
}

/** 获取单元基础信息（含所属年级） */
export async function getUnit(id: string) {
  return prisma.unit.findUnique({
    where: { id },
    include: { grade: true },
  });
}
