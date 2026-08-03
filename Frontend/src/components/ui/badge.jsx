import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-lg border px-2.5 py-0.5 text-[10px] font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow-xs hover:bg-primary/80",
        // Todo: Soft Gray (#F3F4F6 background, #4B5563 text)
        secondary:
          "bg-[#F3F4F6] text-[#4B5563] border-[#E5E7EB] font-semibold",
        // In Progress: Soft Blue (#DBEAFE background, #2563EB text)
        info:
          "bg-[#DBEAFE] text-[#2563EB] border-[#BFDBFE] font-semibold",
        // Completed: Soft Green (#DCFCE7 background, #15803D text)
        success:
          "bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0] font-semibold",
        // High Priority: Muted Red (#FEE2E2 background, #B91C1C text)
        destructive:
          "bg-[#FEE2E2] text-[#B91C1C] border-[#FCA5A5] font-semibold",
        // Medium Priority: Soft Amber (#FEF3C7 background, #B45309 text)
        warning:
          "bg-[#FEF3C7] text-[#B45309] border-[#FDE68A] font-semibold",
        // Low Priority: Soft Slate (#E2E8F0 background, #475569 text)
        outline:
          "bg-[#E2E8F0] text-[#475569] border-[#CBD5E1] font-semibold",
        // Updated: Light Violet (#EDE9FE background, #6D28D9 text)
        updated:
          "bg-[#EDE9FE] text-[#6D28D9] border-[#DDD6FE] font-semibold",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({ className, variant, ...props }) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
