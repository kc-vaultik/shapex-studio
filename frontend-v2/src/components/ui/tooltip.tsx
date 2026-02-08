import * as React from "react"
import { cn } from "@/lib/utils"

interface TooltipProps {
  content: React.ReactNode
  children: React.ReactNode
  side?: "top" | "right" | "bottom" | "left"
}

const Tooltip = ({ content, children, side = "top" }: TooltipProps) => {
  const [isVisible, setIsVisible] = React.useState(false)

  const sideClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
  }

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>
      {isVisible && (
        <div
          className={cn(
            "absolute z-50 px-3 py-1.5 text-sm text-white bg-dark-900 border border-dark-700 rounded-md shadow-lg whitespace-nowrap pointer-events-none",
            sideClasses[side]
          )}
        >
          {content}
          <div
            className={cn(
              "absolute w-2 h-2 bg-dark-900 border-dark-700 transform rotate-45",
              side === "top" && "bottom-[-5px] left-1/2 -translate-x-1/2 border-b border-r",
              side === "right" && "left-[-5px] top-1/2 -translate-y-1/2 border-l border-b",
              side === "bottom" && "top-[-5px] left-1/2 -translate-x-1/2 border-t border-l",
              side === "left" && "right-[-5px] top-1/2 -translate-y-1/2 border-r border-t"
            )}
          />
        </div>
      )}
    </div>
  )
}

export { Tooltip }
