/**
 * 共享类型定义（前后端通用）
 * 用于 API 响应与前端状态
 */

export type LessonType = "dialogue" | "story" | "chant" | "song" | "words";
export type ExerciseType = "choice" | "fill" | "match";

export interface GradeDTO {
  id: string;
  level: number;
  name: string;
  semester: string;
  color: string;
  icon: string;
  unitCount: number;
}

export interface UnitDTO {
  id: string;
  number: number;
  title: string;
  description: string | null;
  icon: string;
  gradeId: string;
  lessonCount: number;
  /** 学习进度（0-100），无进度为 null */
  progressPercentage: number | null;
}

export interface SentenceDTO {
  id: string;
  text: string;
  translation: string | null;
  startTime: number;
  endTime: number;
  speaker: string | null;
  sortOrder: number;
}

export interface LessonDTO {
  id: string;
  part: string;
  title: string;
  type: LessonType;
  audioUrl: string;
  duration: number;
  icon: string;
  unitId: string;
  sentences: SentenceDTO[];
}

export interface LessonListItemDTO {
  id: string;
  part: string;
  title: string;
  type: LessonType;
  icon: string;
  duration: number;
  progressPercentage: number | null;
  completed: boolean;
}

export interface ExerciseDTO {
  id: string;
  type: ExerciseType;
  question: string;
  /** 选择题/匹配题的选项（已解析） */
  options: string[] | { left: string[]; right: string[] } | null;
  /** 正确答案（已解析） */
  answer: unknown;
  explanation: string | null;
  audioStartTime: number | null;
  sortOrder: number;
}

export interface ProgressDTO {
  id: string;
  lastPosition: number;
  completedDuration: number;
  percentage: number;
  completed: boolean;
  playCount: number;
}

export interface ExerciseResultDTO {
  id: string;
  total: number;
  correct: number;
  score: number;
  createdAt: string;
}

/** 首页整体学习统计 */
export interface StudyStatsDTO {
  totalLessons: number;
  completedLessons: number;
  totalPlayCount: number;
  /** 整体完成百分比 */
  overallPercentage: number;
}
