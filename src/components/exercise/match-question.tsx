"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface MatchQuestionProps {
  options: { left: string[]; right: string[] };
  /** 正确答案：{ left词: right词 } */
  correctAnswer: Record<string, string>;
  revealed: boolean;
  onAnswer: (matches: Record<string, string>) => void;
}

/**
 * 匹配题（连线题）
 * 左侧固定，右侧可选；点击左侧词选中，再点右侧词完成匹配
 */
export function MatchQuestion({
  options,
  correctAnswer,
  revealed,
  onAnswer,
}: MatchQuestionProps) {
  const [matches, setMatches] = useState<Record<string, string>>({});
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);

  const handleLeftClick = (word: string) => {
    if (revealed) return;
    setSelectedLeft(word === selectedLeft ? null : word);
  };

  const handleRightClick = (word: string) => {
    if (revealed || !selectedLeft) return;
    const next = { ...matches };
    // 移除已被其他左侧占用的右侧词
    for (const key of Object.keys(next)) {
      if (next[key] === word) delete next[key];
    }
    next[selectedLeft] = word;
    setMatches(next);
    setSelectedLeft(null);
    onAnswer(next);
  };

  const rightUsed = new Set(Object.values(matches));

  const renderRight = (word: string) => {
    const matchedBy = Object.entries(matches).find(
      ([, v]) => v === word
    )?.[0];
    const isCorrect = revealed && matchedBy && correctAnswer[matchedBy] === word;
    const isWrong =
      revealed && matchedBy && correctAnswer[matchedBy] !== word;

    return (
      <button
        key={word}
        disabled={revealed || (!selectedLeft && !matchedBy)}
        onClick={() =>
          matchedBy && !revealed
            ? setMatches((m) => {
                const next = { ...m };
                delete next[matchedBy];
                return next;
              })
            : handleRightClick(word)
        }
        className={cn(
          "flex h-12 w-full items-center justify-center rounded-xl border-2 px-3 text-sm font-medium transition-all",
          isCorrect && "border-accent bg-accent/10",
          isWrong && "border-destructive bg-destructive/10",
          !isCorrect && !isWrong && selectedLeft && !rightUsed.has(word) && !matchedBy && "border-primary/40 hover:border-primary hover:bg-primary/5",
          matchedBy && !revealed && "border-primary bg-primary/5",
          revealed && !matchedBy && "opacity-50"
        )}
      >
        {revealed && isCorrect && <Check className="h-4 w-4 text-accent mr-1" />}
        {revealed && isWrong && <X className="h-4 w-4 text-destructive mr-1" />}
        {word}
      </button>
    );
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        {options.left.map((word) => {
          const matched = matches[word];
          const isCorrect = revealed && matched && correctAnswer[word] === matched;
          const isWrong = revealed && matched && correctAnswer[word] !== matched;
          return (
            <button
              key={word}
              disabled={revealed}
              onClick={() => handleLeftClick(word)}
              className={cn(
                "flex h-12 w-full items-center justify-center rounded-xl border-2 px-3 text-sm font-medium transition-all",
                isCorrect && "border-accent bg-accent/10",
                isWrong && "border-destructive bg-destructive/10",
                !isCorrect && !isWrong && selectedLeft === word && "border-primary bg-primary/10 ring-2 ring-primary/20",
                !isCorrect && !isWrong && selectedLeft !== word && "border-border hover:border-primary/40",
                !isCorrect && !isWrong && matched && "border-primary/40"
              )}
            >
              {word}
            </button>
          );
        })}
      </div>
      <div className="space-y-2">
        {options.right.map(renderRight)}
      </div>
    </div>
  );
}
