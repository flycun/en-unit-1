"use client";

import { useEffect, useRef } from "react";
import { usePlayerStore } from "@/stores/player-store";

interface SavePayload {
  lessonId: string;
  lastPosition: number;
  completedDuration: number;
  percentage: number;
  completed: boolean;
}

/**
 * 进度自动保存 Hook
 * 每 5 秒 + 暂停时 + 播放结束时保存进度到后端
 */
export function useProgressSave(
  lessonId: string,
  duration: number,
  enabled = true
) {
  const { currentTime, isPlaying, duration: loadedDuration } = usePlayerStore();
  const lastSaveRef = useRef(0);
  const completedDurationRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    if (!enabled || !lessonId) return;

    // 累计已听时长（用时间点集合近似）
    if (isPlaying) {
      completedDurationRef.current.add(Math.floor(currentTime));
    }

    const finalDuration = duration || loadedDuration;
    const percentage =
      finalDuration > 0
        ? Math.min(100, (currentTime / finalDuration) * 100)
        : 0;
    const completed = percentage >= 90 || currentTime >= finalDuration - 0.5;

    const shouldSave =
      // 每 5 秒
      currentTime - lastSaveRef.current >= 5 ||
      // 暂停时
      !isPlaying ||
      // 播放结束时
      completed;

    if (!shouldSave) return;
    if (Math.abs(currentTime - lastSaveRef.current) < 0.5 && !completed) return;

    lastSaveRef.current = currentTime;

    const payload: SavePayload = {
      lessonId,
      lastPosition: currentTime,
      completedDuration: completedDurationRef.current.size,
      percentage,
      completed,
    };

    void fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => {
      // 保存失败静默处理，下次重试
    });
  }, [currentTime, isPlaying, lessonId, duration, loadedDuration, enabled]);
}
