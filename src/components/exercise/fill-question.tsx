"use client";

import { cn } from "@/lib/utils";

interface FillQuestionProps {
  userAnswer: string;
  correctAnswer: string;
  revealed: boolean;
  onAnswer: (value: string) => void;
}

/**
 * 填空题
 * 单空填空，输入后失焦或回车提交
 */
export function FillQuestion({
  userAnswer,
  correctAnswer,
  revealed,
  onAnswer,
}: FillQuestionProps) {
  const isCorrect =
    userAnswer.trim().toLowerCase() ===
    correctAnswer.trim().toLowerCase();

  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        value={userAnswer}
        disabled={revealed}
        onChange={(e) => onAnswer(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") (e.target as HTMLInputElement).blur();
        }}
        placeholder="在此输入答案..."
        className={cn(
          "h-12 flex-1 rounded-xl border-2 px-4 text-base font-medium outline-none transition-all",
          revealed && isCorrect && "border-accent bg-accent/10",
          revealed && !isCorrect && userAnswer && "border-destructive bg-destructive/10",
          !revealed && "border-border focus:border-primary focus:bg-primary/5"
        )}
      />
      {revealed && !isCorrect && userAnswer && (
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          正确答案：
          <span className="font-bold text-accent">{correctAnswer}</span>
        </span>
      )}
    </div>
  );
}
