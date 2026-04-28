import type { ReactNode } from "react"
import type { TouchableOpacityProps } from "react-native"
import { Text, TouchableOpacity } from "react-native"

import { cn } from "@/lib/utils"

interface ButtonProps extends TouchableOpacityProps {
  children?: ReactNode
  title?: string
  variant?: "primary" | "secondary" | "outline" | "destructive" | "ghost"
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
        "flex-row items-center justify-center gap-2 rounded-full px-4 py-2.5",
        {
          "bg-primary active:bg-primary/90": variant === "primary",
          "bg-zinc-100 active:bg-zinc-200 dark:bg-zinc-900 dark:active:bg-zinc-800":
            variant === "secondary",
          "border border-primary bg-primary/10 active:bg-primary/20":
            variant === "outline",
          "bg-red-500 active:bg-red-600": variant === "destructive",
          "active:bg-zinc-100 dark:active:bg-zinc-900": variant === "ghost",

          "opacity-50": props.disabled,
        },
        className
      )}
      disabled={props.disabled}
      {...props}
    >
      {children || (
        <Text
          className={cn("text-center font-medium", {
            "text-white": variant === "primary" || variant === "destructive",
            "text-black dark:text-white":
              variant === "secondary" || variant === "ghost",
            "text-primary": variant === "outline",
          })}
        >
          {props.title}
        </Text>
      )}
    </TouchableOpacity>
  )
}
