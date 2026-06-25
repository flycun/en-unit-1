import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** 合并 Tailwind 类名（shadcn/ui 标配） */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** 默认学生 ID（MVP 阶段单一学生） */
export const DEFAULT_STUDENT_ID = "default-student";

/**
 * 在句子数组中用二分查找定位当前播放时间对应的句子索引
 * @returns 命中的索引；找不到返回 -1
 */
export function findActiveSentenceIndex(
  sentences: { startTime: number; endTime: number }[],
  currentTime: number
): number {
  if (sentences.length === 0) return -1;

  let low = 0;
  let high = sentences.length - 1;
  let result = -1;

  while (low <= high) {
    const mid = (low + high) >> 1;
    const s = sentences[mid];
    if (currentTime < s.startTime) {
      high = mid - 1;
    } else if (currentTime >= s.endTime) {
      low = mid + 1;
    } else {
      result = mid;
      break;
    }
  }

  // 时间落在两句之间的间隙：取上一句（若存在）
  if (result === -1 && low > 0) {
    result = low - 1;
  }
  return result;
}

/** 将秒数格式化为 mm:ss */
export function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "00:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/** 节流函数 */
export function throttle<T extends (...args: never[]) => void>(
  fn: T,
  interval: number
): (...args: Parameters<T>) => void {
  let last = 0;
  let timer: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    const now = Date.now();
    const remaining = interval - (now - last);
    if (remaining <= 0) {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      last = now;
      fn(...args);
    } else if (!timer) {
      timer = setTimeout(() => {
        last = Date.now();
        timer = null;
        fn(...args);
      }, remaining);
    }
  };
}
