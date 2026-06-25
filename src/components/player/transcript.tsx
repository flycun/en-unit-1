"use client";

import { cn } from "@/lib/utils";
import { useTranscriptSync } from "@/hooks/use-transcript-sync";
import { usePlayerStore } from "@/stores/player-store";
import type { SentenceDTO } from "@/types";
import { Repeat2 } from "lucide-react";

interface TranscriptProps {
  sentences: SentenceDTO[];
}

/**
 * 课文同步显示组件
 * - 播放时当前句自动高亮、自动滚动到视野中央
 * - 点击任意句子可跳转播放
 * - 显示说话人标签（如有）
 */
export function Transcript({ sentences }: TranscriptProps) {
  const { containerRef, activeSentenceIndex } = useTranscriptSync(sentences);
  const repeatSentence = usePlayerStore((s) => s.repeatSentence);
  const toggleRepeat = usePlayerStore((s) => s.toggleRepeatSentence);

  // 监听自定义 seek 事件（单句复读用）
  // 这里仅做展示，实际 seek 在播放器组件处理

  const handleSentenceClick = (startTime: number) => {
    window.dispatchEvent(
      new CustomEvent("player:seek", { detail: startTime })
    );
    // 同时触发播放
    window.dispatchEvent(new CustomEvent("player:play"));
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h3 className="font-semibold text-foreground">📖 课文</h3>
        <button
          onClick={toggleRepeat}
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
            repeatSentence
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/70"
          )}
          title="单句复读：重复播放当前句子"
        >
          <Repeat2 className="h-3.5 w-3.5" />
          单句复读
        </button>
      </div>

      <div
        ref={containerRef}
        className="scrollbar-thin flex-1 overflow-y-auto px-4 py-4 space-y-3"
      >
        {sentences.map((s, idx) => {
          const active = idx === activeSentenceIndex;
          return (
            <div
              key={s.id}
              data-sentence-idx={idx}
              onClick={() => handleSentenceClick(s.startTime)}
              className={cn(
                "cursor-pointer rounded-xl p-3 transition-all duration-200",
                active
                  ? "bg-primary/12 scale-[1.01] shadow-sm"
                  : "hover:bg-muted/60"
              )}
            >
              {s.speaker && (
                <span
                  className={cn(
                    "mb-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-medium",
                    active
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {s.speaker}
                </span>
              )}
              <p
                className={cn(
                  "text-base leading-relaxed transition-colors",
                  active ? "text-primary font-semibold" : "text-foreground"
                )}
              >
                {s.text}
              </p>
              {s.translation && (
                <p
                  className={cn(
                    "mt-1 text-sm transition-colors",
                    active ? "text-primary/80" : "text-muted-foreground"
                  )}
                >
                  {s.translation}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
