"use client";

import { useEffect } from "react";
import {
  Play,
  Pause,
  Rewind,
  FastForward,
  Volume2,
  VolumeX,
  Repeat,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAudioPlayer } from "@/hooks/use-audio-player";
import { usePlayerStore } from "@/stores/player-store";
import { useProgressSave } from "@/hooks/use-progress-save";
import { formatTime, cn } from "@/lib/utils";

interface AudioPlayerProps {
  src: string;
  lessonId: string;
  duration: number;
  /** 句子列表（用于显示当前播放句） */
  sentences?: { text: string; translation?: string | null; startTime: number; endTime: number }[];
  /** 进度条交互区域渲染 */
  children?: React.ReactNode;
}

const RATES = [0.75, 1, 1.25, 1.5];

/**
 * 主音频播放器组件
 * 整合：音频元素 + 控制条 + 倍速/音量 + 单句复读
 * 通过自定义事件接受外部 seek/play 指令（来自 Transcript 点击）
 */
export function AudioPlayer({
  src,
  lessonId,
  duration,
  sentences,
  children,
}: AudioPlayerProps) {
  const controls = useAudioPlayer(src);
  const {
    isPlaying,
    currentTime,
    duration: loadedDuration,
    playbackRate,
    volume,
    repeatSentence,
    toggleRepeatSentence,
  } = usePlayerStore();

  // 进度自动保存
  useProgressSave(lessonId, duration, true);

  const total = duration || loadedDuration;
  const progress = total > 0 ? (currentTime / total) * 100 : 0;

  // 当前播放的句子（用于在控制区显示）
  const activeSentence = sentences?.find(
    (s) => currentTime >= s.startTime && currentTime < s.endTime
  );

  // 监听来自 Transcript 的自定义事件
  useEffect(() => {
    const onSeek = (e: Event) => {
      const detail = (e as CustomEvent<number>).detail;
      if (typeof detail === "number") controls.seek(detail);
    };
    const onPlay = () => controls.play();
    window.addEventListener("player:seek", onSeek as EventListener);
    window.addEventListener("player:play", onPlay);
    return () => {
      window.removeEventListener("player:seek", onSeek as EventListener);
      window.removeEventListener("player:play", onPlay);
    };
  }, [controls]);

  const cycleRate = () => {
    const idx = RATES.indexOf(playbackRate);
    controls.setRate(RATES[(idx + 1) % RATES.length]);
  };

  return (
    <div className="flex flex-col">
      {/* 隐藏的 audio 元素 */}
      <audio ref={controls.audioRef} />

      {/* 当前播放句子（实时显示） */}
      {sentences && activeSentence && (
        <div className="mx-4 mt-3 rounded-xl bg-primary/8 px-4 py-3 transition-all">
          <p className="text-base font-semibold leading-snug text-primary">
            {activeSentence.text}
          </p>
          {activeSentence.translation && (
            <p className="mt-0.5 text-sm text-primary/70">
              {activeSentence.translation}
            </p>
          )}
        </div>
      )}
      {sentences && !activeSentence && (
        <div className="mx-4 mt-3 rounded-xl bg-muted/50 px-4 py-3 text-center text-sm text-muted-foreground">
          ▶ 点击播放，开始跟读
        </div>
      )}

      {/* 进度条 */}
      <div className="px-4 pt-3">
        <div
          className="group relative h-2 w-full cursor-pointer rounded-full bg-muted"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const ratio = (e.clientX - rect.left) / rect.width;
            controls.seek(ratio * total);
          }}
        >
          <div
            className="absolute left-0 top-0 h-full rounded-full bg-primary transition-[width]"
            style={{ width: `${progress}%` }}
          />
          <div
            className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary shadow opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ left: `${progress}%` }}
          />
        </div>
        <div className="mt-1.5 flex justify-between text-xs text-muted-foreground tabular-nums">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(total)}</span>
        </div>
      </div>

      {/* 控制按钮 */}
      <div className="flex items-center justify-between gap-2 px-4 py-3">
        {/* 左：倍速 + 单句复读 */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={cycleRate}
            className="font-bold tabular-nums"
            title="点击切换倍速"
          >
            {playbackRate}x
          </Button>
          <Button
            variant={repeatSentence ? "default" : "ghost"}
            size="icon"
            onClick={toggleRepeatSentence}
            title="单句复读"
          >
            <Repeat className="h-4 w-4" />
          </Button>
        </div>

        {/* 中：播放控制 */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => controls.skip(-5)}
            title="后退 5 秒"
          >
            <Rewind className="h-5 w-5" />
          </Button>
          <Button
            size="icon-lg"
            onClick={controls.toggle}
            className="rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90"
            title={isPlaying ? "暂停" : "播放"}
          >
            {isPlaying ? (
              <Pause className="h-6 w-6" fill="currentColor" />
            ) : (
              <Play className="h-6 w-6 translate-x-0.5" fill="currentColor" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => controls.skip(5)}
            title="前进 5 秒"
          >
            <FastForward className="h-5 w-5" />
          </Button>
        </div>

        {/* 右：音量（小屏隐藏，移动端用系统音量） */}
        <div className="hidden items-center gap-2 w-[120px] justify-end sm:flex">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => controls.setVolume(volume > 0 ? 0 : 1)}
            title="静音"
          >
            {volume > 0 ? (
              <Volume2 className="h-5 w-5" />
            ) : (
              <VolumeX className="h-5 w-5" />
            )}
          </Button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={volume}
            onChange={(e) => controls.setVolume(Number(e.target.value))}
            className="h-1.5 w-16 cursor-pointer appearance-none rounded-full bg-muted accent-primary"
            title="音量"
          />
        </div>
      </div>

      {children}
    </div>
  );
}
