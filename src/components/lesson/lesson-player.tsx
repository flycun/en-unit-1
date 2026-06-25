"use client";

import { AudioPlayer } from "@/components/player/audio-player";
import { Transcript } from "@/components/player/transcript";
import type { LessonDTO } from "@/types";

interface LessonPlayerProps {
  lesson: LessonDTO;
}

/**
 * 听力学习客户端容器
 * 布局：左侧课文同步 + 右侧播放器控制
 * 移动端：课文在上，播放器固定底部
 */
export function LessonPlayer({ lesson }: LessonPlayerProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
      {/* 课文同步区 */}
      <div className="order-2 lg:order-1 h-[60vh] lg:h-[calc(100vh-280px)] min-h-[400px] rounded-2xl border bg-card overflow-hidden">
        <Transcript sentences={lesson.sentences} />
      </div>

      {/* 播放器控制区 */}
      <div className="order-1 lg:order-2 lg:sticky lg:top-20 self-start rounded-2xl border bg-card overflow-hidden">
        <div className="bg-gradient-to-br from-primary/10 to-accent/5 p-6 text-center">
          <div className="text-6xl mb-2">{lesson.icon}</div>
          <h2 className="font-bold text-lg">{lesson.title}</h2>
          <p className="text-sm text-muted-foreground">
            Part {lesson.part} · 边听边读
          </p>
        </div>
        <AudioPlayer
          src={lesson.audioUrl}
          lessonId={lesson.id}
          duration={lesson.duration}
          sentences={lesson.sentences}
        />
        <div className="px-4 pb-4 text-center text-xs text-muted-foreground">
          💡 点击左侧课文任意句子可跳转播放
        </div>
      </div>
    </div>
  );
}
