import { cn } from "@/lib/utils"

interface AnimatedGridPatternProps {
  className?: string
  width?: number
  height?: number
  cellSize?: number
  strokeDasharray?: string
  opacity?: number
}

export function AnimatedGridPattern({
  className,
  width = 100,
  height = 100,
  cellSize = 50,
  strokeDasharray = "0",
  opacity = 0.1,
}: AnimatedGridPatternProps) {
  return (
    <div className={cn("absolute inset-0 overflow-hidden", className)}>
      <svg
        className="h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="grid-pattern"
            width={cellSize}
            height={cellSize}
            patternUnits="userSpaceOnUse"
          >
            <path
              d={`M ${cellSize} 0 L 0 0 0 ${cellSize}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              strokeDasharray={strokeDasharray}
              opacity={opacity}
            />
          </pattern>
          <linearGradient id="grid-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgb(0, 241, 239)" stopOpacity="0.3" />
            <stop offset="50%" stopColor="rgb(0, 255, 0)" stopOpacity="0.2" />
            <stop offset="100%" stopColor="rgb(0, 241, 239)" stopOpacity="0.1" />
          </linearGradient>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="url(#grid-pattern)"
          className="text-primary-500"
        />
        <rect
          width="100%"
          height="100%"
          fill="url(#grid-gradient)"
          opacity="0.3"
          className="animate-pulse-slow"
        />
      </svg>
    </div>
  )
}
