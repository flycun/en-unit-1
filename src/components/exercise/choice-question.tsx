"use client";

import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChoiceQuestionProps {
  options: string[];
  userAnswer: string | null;
  correctAnswer: string;
  revealed: boolean;
  onAnswer: (value: string) => void;
}

/**
 * 单项选择题
 * 选项格式：["A. Hello", "B. Hi", ...] 或 ["Hello", "Hi", ...]
 * 用户答案为选项字母（A/B/C/D）或索引
 */
export function ChoiceQuestion({
  options,
  userAnswer,
  correctAnswer,
  revealed,
  onAnswer,
}: ChoiceQuestionProps) {
  return (
    <div className="space-y-2">
      {options.map((opt, idx) => {
        const letter = String.fromCharCode(65 + idx);
        const isSelected = userAnswer === letter || userAnswer === String(idx);
        const isCorrect = letter === correctAnswer || String(idx) === correctAnswer;
        const showCorrect = revealed && isCorrect;
        const showWrong = revealed && isSelected && !isCorrect;

        return (
          <button
            key={idx}
            disabled={revealed}
            onClick={() => onAnswer(letter)}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl border-2 p-3 text-left transition-all",
              showCorrect && "border-accent bg-accent/10",
              showWrong && "border-destructive bg-destructive/10",
              !revealed && isSelected && "border-primary bg-primary/5",
              !revealed && !isSelected && "border-border hover:border-primary/40 hover:bg-muted/50",
              revealed && !showCorrect && !showWrong && "border-border opacity-60"
            )}
          >
            <span
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                showCorrect
                  ? "bg-accent text-accent-foreground"
                  : showWrong
                    ? "bg-destructive text-destructive-foreground"
                    : isSelected
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
              )}
            >
              {showCorrect ? (
                <Check className="h-4 w-4" />
              ) : showWrong ? (
                <X className="h-4 w-4" />
              ) : (
                letter
              )}
            </span>
            <span className="flex-1 text-sm">{opt.replace(/^[A-D]\.\s*/, "")}</span>
          </button>
        );
      })}
    </div>
  );
}
