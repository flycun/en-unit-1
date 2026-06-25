"use client";

import { useEffect, useRef } from "react";
import { findActiveSentenceIndex } from "@/lib/utils";
import { usePlayerStore } from "@/stores/player-store";
import type { SentenceDTO } from "@/types";

export interface TranscriptSyncOptions {
  /** 是否自动滚动到当前句子 */
  autoScroll?: boolean;
}

/**
 * 课文同步高亮 Hook
 * 监听播放器当前时间，计算激活的句子索引并写入 store
 * 支持单句复读：到句末自动跳回句首
 */
export function useTranscriptSync(
  sentences: SentenceDTO[],
  options: TranscriptSyncOptions = {}
) {
  const { autoScroll = true } = options;
  const {
    currentTime,
    isPlaying,
    repeatSentence,
    activeSentenceIndex,
    setActiveSentenceIndex,
  } = usePlayerStore();

  const containerRef = useRef<HTMLDivElement>(null);
  // 记录上次激活索引，避免重复写 store
  const lastIndexRef = useRef(-1);

  // 计算激活句子
  useEffect(() => {
    if (sentences.length === 0) return;
    const idx = findActiveSentenceIndex(
      sentences.map((s) => ({ startTime: s.startTime, endTime: s.endTime })),
      currentTime
    );
    if (idx !== lastIndexRef.current) {
      lastIndexRef.current = idx;
      setActiveSentenceIndex(idx);
    }
  }, [currentTime, sentences, setActiveSentenceIndex]);

  // 单句复读：检测到句末时，通过自定义事件通知播放器 seek
  useEffect(() => {
    if (!repeatSentence || !isPlaying || activeSentenceIndex < 0) return;
    const current = sentences[activeSentenceIndex];
    if (!current) return;
    // 当时间越过当前句的结束时间，回到该句开头
    if (currentTime >= current.endTime) {
      window.dispatchEvent(
        new CustomEvent("player:seek", { detail: current.startTime })
      );
    }
  }, [currentTime, repeatSentence, isPlaying, activeSentenceIndex, sentences]);

  // 自动滚动到激活句子
  useEffect(() => {
    if (!autoScroll || activeSentenceIndex < 0) return;
    const container = containerRef.current;
    if (!container) return;
    const el = container.querySelector<HTMLDivElement>(
      `[data-sentence-idx="${activeSentenceIndex}"]`
    );
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [activeSentenceIndex, autoScroll]);

  return { containerRef, activeSentenceIndex };
}
