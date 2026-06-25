import { describe, expect, it, vi } from "vitest";
import {
  findActiveSentenceIndex,
  formatTime,
  throttle,
  cn,
} from "./utils";

describe("findActiveSentenceIndex", () => {
  const sentences = [
    { startTime: 0, endTime: 2 },
    { startTime: 2, endTime: 5 },
    { startTime: 5, endTime: 8 },
    { startTime: 8, endTime: 12 },
  ];

  it("时间在某句区间内，返回该句索引", () => {
    expect(findActiveSentenceIndex(sentences, 0.5)).toBe(0);
    expect(findActiveSentenceIndex(sentences, 3)).toBe(1);
    expect(findActiveSentenceIndex(sentences, 6)).toBe(2);
    expect(findActiveSentenceIndex(sentences, 10)).toBe(3);
  });

  it("时间刚好到下一句 startTime，返回下一句（左闭右开）", () => {
    expect(findActiveSentenceIndex(sentences, 2)).toBe(1);
    expect(findActiveSentenceIndex(sentences, 5)).toBe(2);
  });

  it("时间落在真正的间隙，返回前一句", () => {
    const gapped = [
      { startTime: 0, endTime: 2 },
      { startTime: 4, endTime: 6 },
    ];
    expect(findActiveSentenceIndex(gapped, 3)).toBe(0);
  });

  it("空数组返回 -1", () => {
    expect(findActiveSentenceIndex([], 1)).toBe(-1);
  });

  it("时间在第一句之前，返回 -1", () => {
    // startTime=0 之前没有负数情况，构造一个延迟开始的场景
    const delayed = [{ startTime: 5, endTime: 10 }];
    expect(findActiveSentenceIndex(delayed, 2)).toBe(-1);
  });

  it("时间超过所有句子，返回最后一句", () => {
    expect(findActiveSentenceIndex(sentences, 100)).toBe(3);
  });
});

describe("formatTime", () => {
  it("格式化秒数为 mm:ss", () => {
    expect(formatTime(0)).toBe("00:00");
    expect(formatTime(5)).toBe("00:05");
    expect(formatTime(65)).toBe("01:05");
    expect(formatTime(125)).toBe("02:05");
  });

  it("负数或非数字返回 00:00", () => {
    expect(formatTime(-1)).toBe("00:00");
    expect(formatTime(NaN)).toBe("00:00");
    expect(formatTime(Infinity)).toBe("00:00");
  });
});

describe("throttle", () => {
  it("节流：短时间多次调用只执行一次", async () => {
    const mockFn = vi.fn();
    const throttled = throttle(mockFn as (x: number) => void, 50);

    throttled(1);
    throttled(2);
    throttled(3);

    // 同步周期内只执行第一次
    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledWith(1);
  });
});

describe("cn", () => {
  it("合并类名并处理 Tailwind 冲突", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
    expect(cn("text-red-500", false && "text-blue-500", "font-bold")).toBe(
      "text-red-500 font-bold"
    );
  });
});
