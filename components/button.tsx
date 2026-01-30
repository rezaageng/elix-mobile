import type { ReactNode } from "react"
import type { TouchableOpacityProps } from "react-native"
import { Text, TouchableOpacity } from "react-native"

import { cn } from "@/lib/utils"

interface ButtonProps extends TouchableOpacityProps {
  children?: ReactNode
  title?: string
  variant?: "primary" | "secondary" | "outline"
}

export function Button({
  children,

  variant = "primary",
  className,
  ...props
}: ButtonProps) {
  return (
    <TouchableOpacity
      className={cn(
        "flex-row items-center justify-center gap-2 rounded-full p-2.5",
        {
          "bg-teal-700": variant === "primary",
          "bg-zinc-100 dark:bg-zinc-900": variant === "secondary",
          "border border-teal-700 bg-teal-700/30": variant === "outline",
        },
        className
      )}
      {...props}
    >
      {children || (
        <Text
          className={cn("text-center font-medium", {
            "text-white": variant === "primary",
            "text-black dark:text-white": variant === "secondary",
            "text-teal-700": variant === "outline",
          })}
        >
          {props.title}
        </Text>
      )}
    </TouchableOpacity>
  )
}
