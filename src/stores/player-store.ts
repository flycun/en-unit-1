import { create } from "zustand";

interface PlayerState {
  /** 是否正在播放 */
  isPlaying: boolean;
  /** 当前播放时间（秒） */
  currentTime: number;
  /** 音频总时长（秒） */
  duration: number;
  /** 播放倍速 */
  playbackRate: number;
  /** 音量 0-1 */
  volume: number;
  /** 单句复读模式（重复当前句） */
  repeatSentence: boolean;
  /** 当前激活的句子索引 */
  activeSentenceIndex: number;

  setPlaying: (v: boolean) => void;
  setCurrentTime: (t: number) => void;
  setDuration: (d: number) => void;
  setPlaybackRate: (r: number) => void;
  setVolume: (v: number) => void;
  toggleRepeatSentence: () => void;
  setActiveSentenceIndex: (i: number) => void;
}

/**
 * 播放器全局状态（Zustand）
 * 由 useAudioPlayer 单一写入，组件订阅读取
 */
export const usePlayerStore = create<PlayerState>((set) => ({
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  playbackRate: 1,
  volume: 1,
  repeatSentence: false,
  activeSentenceIndex: -1,

  setPlaying: (v) => set({ isPlaying: v }),
  setCurrentTime: (t) => set({ currentTime: t }),
  setDuration: (d) => set({ duration: d }),
  setPlaybackRate: (r) => set({ playbackRate: r }),
  setVolume: (v) => set({ volume: v }),
  toggleRepeatSentence: () =>
    set((s) => ({ repeatSentence: !s.repeatSentence })),
  setActiveSentenceIndex: (i) => set({ activeSentenceIndex: i }),
}));
