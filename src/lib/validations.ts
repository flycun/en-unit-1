import { z } from "zod";

/** 进度保存请求校验 */
export const saveProgressSchema = z.object({
  lessonId: z.string().min(1),
  studentId: z.string().min(1).default("default-student"),
  lastPosition: z.number().min(0),
  completedDuration: z.number().min(0),
  percentage: z.number().min(0).max(100),
  completed: z.boolean(),
});

/** 练习提交请求校验 */
export const submitExerciseSchema = z.object({
  lessonId: z.string().min(1),
  studentId: z.string().min(1).default("default-student"),
  total: z.number().int().min(1),
  correct: z.number().int().min(0),
  detail: z.string().optional(),
});

export type SaveProgressInput = z.infer<typeof saveProgressSchema>;
export type SubmitExerciseInput = z.infer<typeof submitExerciseSchema>;
