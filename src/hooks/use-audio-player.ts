"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePlayerStore } from "@/stores/player-store";

export interface AudioPlayerControls {
  audioRef: React.RefObject<HTMLAudioElement>;
  isReady: boolean;
  /** 播放/暂停切换 */
  toggle: () => void;
  play: () => void;
  pause: () => void;
  /** 跳转到指定时间（秒） */
  seek: (time: number) => void;
  /** 设置倍速 */
  setRate: (rate: number) => void;
  /** 设置音量 */
  setVolume: (v: number) => void;
  /** 倒退 / 前进 N 秒 */
  skip: (seconds: number) => void;
}

/**
 * 音频播放器核心 Hook
 * 封装 HTML5 Audio API，与 Zustand 状态同步
 * 单一数据源：所有状态写入由此 Hook 完成
 */
export function useAudioPlayer(src: string): AudioPlayerControls {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isReady, setIsReady] = useState(false);

  const {
    setPlaying,
    setCurrentTime,
    setDuration,
    setPlaybackRate,
    setVolume,
    playbackRate,
    volume,
  } = usePlayerStore();

  // 创建/绑定 audio 元素
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.preload = "metadata";
    audio.src = src;
    audio.playbackRate = playbackRate;
    audio.volume = volume;
    setIsReady(false);

    const onLoadedMetadata = () => {
      if (Number.isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
      setIsReady(true);
    };
    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnded = () => setPlaying(false);
    const onRateChange = () => setPlaybackRate(audio.playbackRate);
    const onVolumeChange = () => setVolume(audio.volume);

    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("ratechange", onRateChange);
    audio.addEventListener("volumechange", onVolumeChange);

    return () => {
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("ratechange", onRateChange);
      audio.removeEventListener("volumechange", onVolumeChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  const play = useCallback(async () => {
    await audioRef.current?.play().catch(() => {
      // 自动播放策略可能阻止，忽略错误
    });
  }, []);

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      void play();
    } else {
      pause();
    }
  }, [play, pause]);

  const seek = useCallback(
    (time: number) => {
      const audio = audioRef.current;
      if (!audio) return;
      audio.currentTime = Math.max(0, Math.min(time, audio.duration || 0));
      setCurrentTime(audio.currentTime);
    },
    [setCurrentTime]
  );

  const setRate = useCallback(
    (rate: number) => {
      if (audioRef.current) audioRef.current.playbackRate = rate;
      setPlaybackRate(rate);
    },
    [setPlaybackRate]
  );

  const setVolumeCallback = useCallback(
    (v: number) => {
      const clamped = Math.max(0, Math.min(1, v));
      if (audioRef.current) audioRef.current.volume = clamped;
      setVolume(clamped);
    },
    [setVolume]
  );

  const skip = useCallback(
    (seconds: number) => {
      const audio = audioRef.current;
      if (!audio) return;
      seek(audio.currentTime + seconds);
    },
    [seek]
  );

  return {
    audioRef,
    isReady,
    toggle,
    play,
    pause,
    seek,
    setRate,
    setVolume: setVolumeCallback,
    skip,
  };
}
