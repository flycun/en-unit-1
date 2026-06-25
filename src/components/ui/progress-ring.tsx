import { cn } from "@/lib/utils";

interface ProgressRingProps {
  /** 进度 0-100 */
  value: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  /** 中心显示内容（默认显示百分比） */
  showLabel?: boolean;
  color?: string;
}

/** 环形进度条（SVG） */
export function ProgressRing({
  value,
  size = 48,
  strokeWidth = 4,
  className,
  showLabel = true,
  color = "hsl(var(--primary))",
}: ProgressRingProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      {showLabel && (
        <span className="absolute text-[10px] font-bold text-foreground">
          {Math.round(clamped)}%
        </span>
      )}
    </div>
  );
}
