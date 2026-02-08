import { cn } from "@/lib/utils"

interface SpotlightProps {
  className?: string
  fill?: string
}

export function Spotlight({ className, fill = "rgba(0, 241, 239, 0.5)" }: SpotlightProps) {
  return (
    <svg
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full animate-pulse-slow",
        className
      )}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="spotlight-gradient" cx="50%" cy="50%">
          <stop offset="0%" stopColor={fill} stopOpacity="0.8" />
          <stop offset="50%" stopColor={fill} stopOpacity="0.3" />
          <stop offset="100%" stopColor={fill} stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse
        cx="50%"
        cy="20%"
        rx="50%"
        ry="30%"
        fill="url(#spotlight-gradient)"
        className="animate-float"
      />
    </svg>
  )
}
