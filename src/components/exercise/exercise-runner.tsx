"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, RotateCcw, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChoiceQuestion } from "@/components/exercise/choice-question";
import { FillQuestion } from "@/components/exercise/fill-question";
import { MatchQuestion } from "@/components/exercise/match-question";
import { cn } from "@/lib/utils";
import type { ExerciseDTO } from "@/types";

interface ExerciseRunnerProps {
  exercises: ExerciseDTO[];
  lessonId: string;
  lessonTitle: string;
  backHref: string;
}

export function ExerciseRunner({
  exercises,
  lessonId,
  lessonTitle,
  backHref,
}: ExerciseRunnerProps) {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, unknown>>({});
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});
  const [finished, setFinished] = useState(false);

  const ex = exercises[current];
  const isRevealed = revealed[current] ?? false;

  const setAnswer = (v: unknown) =>
    setAnswers((a) => ({ ...a, [current]: v }));

  const checkAnswer = (answer: unknown, correct: unknown): boolean => {
    if (typeof correct === "string" && typeof answer === "string") {
      return answer.trim().toLowerCase() === correct.trim().toLowerCase();
    }
    if (
      typeof correct === "object" &&
      correct !== null &&
      typeof answer === "object" &&
      answer !== null
    ) {
      const c = correct as Record<string, string>;
      const a = answer as Record<string, string>;
      return Object.keys(c).every((k) => c[k] === a[k]);
    }
    return answer === correct;
  };

  const handleReveal = () => {
    setRevealed((r) => ({ ...r, [current]: true }));
  };

  const handleNext = () => {
    if (current < exercises.length - 1) {
      setCurrent((c) => c + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    let correct = 0;
    exercises.forEach((e, idx) => {
      if (checkAnswer(answers[idx], e.answer)) correct++;
    });
    const total = exercises.length;
    try {
      await fetch("/api/exercises/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId,
          total,
          correct,
          detail: JSON.stringify(answers),
        }),
      });
    } catch {
      // 提交失败不阻塞结果展示
    }
    setFinished(true);
  };

  const handleRetry = () => {
    setAnswers({});
    setRevealed({});
    setFinished(false);
    setCurrent(0);
  };

  // 结果页
  if (finished) {
    let correct = 0;
    exercises.forEach((e, idx) => {
      if (checkAnswer(answers[idx], e.answer)) correct++;
    });
    const score = Math.round((correct / exercises.length) * 100);
    const isPass = score >= 60;

    return (
      <div className="mx-auto max-w-md text-center">
        <div className="rounded-3xl border bg-card p-8 shadow-sm">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-amber-100">
            <Trophy className="h-10 w-10 text-amber-500" />
          </div>
          <h2 className="text-2xl font-bold">
            {isPass ? "🎉 太棒了！" : "💪 继续加油！"}
          </h2>
          <p className="mt-1 text-muted-foreground">{lessonTitle}</p>

          <div className="my-6">
            <div className="text-5xl font-bold tabular-nums text-primary">
              {score}
              <span className="text-2xl text-muted-foreground">分</span>
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              答对 {correct} / {exercises.length} 题
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button onClick={handleRetry} variant="outline" size="lg">
              <RotateCcw className="h-4 w-4" /> 再做一次
            </Button>
            <Button asChild size="lg">
              <Link href={backHref}>返回听力学习</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href={backHref}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ChevronLeft className="h-4 w-4" /> 返回听力
      </Link>

      {/* 进度指示 */}
      <div className="mb-6">
        <div className="mb-2 flex justify-between text-sm text-muted-foreground">
          <span>
            第 {current + 1} / {exercises.length} 题
          </span>
          <span>{lessonTitle}</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${((current + 1) / exercises.length) * 100}%` }}
          />
        </div>
      </div>

      {/* 题目卡片 */}
      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        <div className="mb-4">
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
            {ex.type === "choice" ? "单选题" : ex.type === "fill" ? "填空题" : "匹配题"}
          </span>
        </div>
        <h2 className="mb-4 text-lg font-semibold leading-relaxed">
          {ex.question}
        </h2>

        {/* 各题型渲染 */}
        {ex.type === "choice" && Array.isArray(ex.options) && (
          <ChoiceQuestion
            options={ex.options as string[]}
            userAnswer={(answers[current] as string) ?? null}
            correctAnswer={ex.answer as string}
            revealed={isRevealed}
            onAnswer={setAnswer}
          />
        )}
        {ex.type === "fill" && (
          <FillQuestion
            userAnswer={(answers[current] as string) ?? ""}
            correctAnswer={ex.answer as string}
            revealed={isRevealed}
            onAnswer={setAnswer}
          />
        )}
        {ex.type === "match" &&
          ex.options &&
          typeof ex.options === "object" &&
          "left" in ex.options && (
            <MatchQuestion
              options={ex.options as { left: string[]; right: string[] }}
              correctAnswer={ex.answer as Record<string, string>}
              revealed={isRevealed}
              onAnswer={(m) => setAnswer(m)}
            />
          )}

        {/* 答案反馈 */}
        {isRevealed && ex.explanation && (
          <div
            className={cn(
              "mt-4 rounded-xl p-3 text-sm",
              checkAnswer(answers[current], ex.answer)
                ? "bg-accent/10 text-accent-foreground"
                : "bg-amber-50 text-amber-900"
            )}
          >
            <span className="font-semibold">
              {checkAnswer(answers[current], ex.answer) ? "✅ 答对了！ " : "💡 解析："}
            </span>
            {ex.explanation}
          </div>
        )}

        {/* 操作按钮 */}
        <div className="mt-6 flex justify-between gap-2">
          <Button
            variant="ghost"
            onClick={() => setCurrent((c) => Math.max(0, c - 1))}
            disabled={current === 0}
          >
            上一题
          </Button>
          {!isRevealed ? (
            <Button
              onClick={handleReveal}
              disabled={answers[current] === undefined || answers[current] === ""}
            >
              确认答案
            </Button>
          ) : (
            <Button onClick={handleNext}>
              {current === exercises.length - 1 ? "查看结果" : "下一题"}
            </Button>
          )}
        </div>
      </div>

      {/* 题目导航点 */}
      <div className="mt-4 flex justify-center gap-1.5">
        {exercises.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={cn(
              "h-2 rounded-full transition-all",
              idx === current ? "w-6 bg-primary" : "w-2 bg-muted hover:bg-muted-foreground/50",
              revealed[idx] &&
                (checkAnswer(answers[idx], exercises[idx].answer)
                  ? "bg-accent"
                  : "bg-destructive")
            )}
          />
        ))}
      </div>
    </div>
  );
}
