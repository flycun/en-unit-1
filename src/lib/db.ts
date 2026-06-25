/**
 * 数据访问层
 * 封装数据库查询，为 API Routes 提供数据
 * 所有函数返回 DTO（数据传输对象），与前端类型对齐
 */
import { prisma } from "./prisma";
import type { Exercise as PrismaExercise } from "@prisma/client";
import type {
  ExerciseDTO,
  ExerciseResultDTO,
  GradeDTO,
  LessonDTO,
  LessonListItemDTO,
  ProgressDTO,
  StudyStatsDTO,
  UnitDTO,
} from "@/types";

/** 解析 Exercise 的 JSON 字段为 DTO */
function parseExerciseOptions(ex: PrismaExercise): ExerciseDTO {
  let options: ExerciseDTO["options"] = null;
  if (ex.options) {
    try {
      options = JSON.parse(ex.options) as ExerciseDTO["options"];
    } catch {
      options = null;
    }
  }
  let answer: unknown = ex.answer;
  try {
    answer = JSON.parse(ex.answer);
  } catch {
    // answer 可能是 "A" 这样的纯字符串，保持原样
    answer = ex.answer;
  }
  return {
    id: ex.id,
    type: ex.type as ExerciseDTO["type"],
    question: ex.question,
    options,
    answer,
    explanation: ex.explanation,
    audioStartTime: ex.audioStartTime,
    sortOrder: ex.sortOrder,
  };
}

/** 获取所有年级列表 */
export async function getGrades(): Promise<GradeDTO[]> {
  const grades = await prisma.grade.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { units: true } } },
  });
  return grades.map((g) => ({
    id: g.id,
    level: g.level,
    name: g.name,
    semester: g.semester,
    color: g.color,
    icon: g.icon,
    unitCount: g._count.units,
  }));
}

/** 获取某年级下的所有单元（含学习进度） */
export async function getUnitsByGrade(
  gradeId: string,
  studentId: string
): Promise<UnitDTO[]> {
  const units = await prisma.unit.findMany({
    where: { gradeId },
    orderBy: { sortOrder: "asc" },
    include: {
      lessons: {
        select: {
          id: true,
          _count: { select: { progress: true } },
          progress: {
            where: { studentId },
            select: { percentage: true },
          },
        },
      },
      _count: { select: { lessons: true } },
    },
  });

  return units.map((u) => {
    // 单元进度 = 所有课文进度的平均
    const percentages = u.lessons.flatMap((l) =>
      l.progress.map((p) => p.percentage)
    );
    const progressPercentage =
      percentages.length > 0
        ? Math.round(
            percentages.reduce((a, b) => a + b, 0) / percentages.length
          )
        : null;

    return {
      id: u.id,
      number: u.number,
      title: u.title,
      description: u.description,
      icon: u.icon,
      gradeId: u.gradeId,
      lessonCount: u._count.lessons,
      progressPercentage,
    };
  });
}

/** 获取单元下的所有课文（含进度） */
export async function getLessonsByUnit(
  unitId: string,
  studentId: string
): Promise<LessonListItemDTO[]> {
  const lessons = await prisma.lesson.findMany({
    where: { unitId },
    orderBy: { sortOrder: "asc" },
    include: {
      progress: {
        where: { studentId },
        select: { percentage: true, completed: true },
      },
    },
  });

  return lessons.map((l) => {
    const p = l.progress[0];
    return {
      id: l.id,
      part: l.part,
      title: l.title,
      type: l.type as LessonListItemDTO["type"],
      icon: l.icon,
      duration: l.duration,
      progressPercentage: p?.percentage ?? null,
      completed: p?.completed ?? false,
    };
  });
}

/** 获取单篇课文详情（含所有句子） */
export async function getLessonById(id: string): Promise<LessonDTO | null> {
  const lesson = await prisma.lesson.findUnique({
    where: { id },
    include: {
      sentences: { orderBy: { sortOrder: "asc" } },
    },
  });
  if (!lesson) return null;

  return {
    id: lesson.id,
    part: lesson.part,
    title: lesson.title,
    type: lesson.type as LessonDTO["type"],
    audioUrl: lesson.audioUrl,
    duration: lesson.duration,
    icon: lesson.icon,
    unitId: lesson.unitId,
    sentences: lesson.sentences.map((s) => ({
      id: s.id,
      text: s.text,
      translation: s.translation,
      startTime: s.startTime,
      endTime: s.endTime,
      speaker: s.speaker,
      sortOrder: s.sortOrder,
    })),
  };
}

/** 获取某课文的练习题 */
export async function getExercisesByLesson(
  lessonId: string
): Promise<ExerciseDTO[]> {
  const exercises = await prisma.exercise.findMany({
    where: { lessonId },
    orderBy: { sortOrder: "asc" },
  });
  return exercises.map(parseExerciseOptions);
}

/** 获取某课文的学习进度 */
export async function getProgress(
  lessonId: string,
  studentId: string
): Promise<ProgressDTO | null> {
  const p = await prisma.progress.findUnique({
    where: { studentId_lessonId: { studentId, lessonId } },
  });
  if (!p) return null;
  return {
    id: p.id,
    lastPosition: p.lastPosition,
    completedDuration: p.completedDuration,
    percentage: p.percentage,
    completed: p.completed,
    playCount: p.playCount,
  };
}

/** 保存/更新学习进度（upsert） */
export async function saveProgress(
  lessonId: string,
  studentId: string,
  data: {
    lastPosition: number;
    completedDuration: number;
    percentage: number;
    completed: boolean;
  }
): Promise<ProgressDTO> {
  const p = await prisma.progress.upsert({
    where: { studentId_lessonId: { studentId, lessonId } },
    create: {
      studentId,
      lessonId,
      ...data,
    },
    update: {
      ...data,
      playCount: { increment: data.lastPosition === 0 ? 1 : 0 },
    },
  });
  return {
    id: p.id,
    lastPosition: p.lastPosition,
    completedDuration: p.completedDuration,
    percentage: p.percentage,
    completed: p.completed,
    playCount: p.playCount,
  };
}

/** 保存练习成绩 */
export async function saveExerciseResult(
  lessonId: string,
  studentId: string,
  data: { total: number; correct: number; score: number; detail?: string }
): Promise<ExerciseResultDTO> {
  const r = await prisma.exerciseResult.create({
    data: { studentId, lessonId, ...data },
  });
  return {
    id: r.id,
    total: r.total,
    correct: r.correct,
    score: r.score,
    createdAt: r.createdAt.toISOString(),
  };
}

/** 获取首页整体学习统计 */
export async function getStudyStats(
  studentId: string
): Promise<StudyStatsDTO> {
  const [totalLessons, progressAgg, playAgg] = await Promise.all([
    prisma.lesson.count(),
    prisma.progress.aggregate({
      where: { studentId },
      _sum: { completedDuration: true },
      _count: { _all: true },
    }),
    prisma.progress.aggregate({
      where: { studentId },
      _sum: { playCount: true },
    }),
  ]);

  const completedLessons = await prisma.progress.count({
    where: { studentId, completed: true },
  });

  return {
    totalLessons,
    completedLessons,
    totalPlayCount: playAgg._sum.playCount ?? 0,
    overallPercentage:
      totalLessons > 0
        ? Math.round((completedLessons / totalLessons) * 100)
        : 0,
  };
}
