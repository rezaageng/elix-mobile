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
        "flex-row items-center justify-center gap-2 rounded-md px-5 py-3",
        {
          "bg-primary active:bg-primary-active": variant === "primary",
          "rounded-md bg-canvas active:bg-surface-card dark:bg-surface-dark-elevated dark:active:bg-surface-dark":
            variant === "secondary",
          "border border-hairline bg-canvas active:bg-surface-card dark:border-hairline dark:bg-surface-dark-elevated dark:active:bg-surface-dark":
            variant === "outline",
          "bg-error active:bg-red-700": variant === "destructive",
          "active:bg-surface-card dark:active:bg-surface-dark-elevated":
            variant === "ghost",

          "opacity-50": props.disabled,
        },
        className
      )}
      disabled={props.disabled}
      {...props}
    >
      {children || (
        <Text
          className={cn("font-body-medium text-button", {
            "text-primary-foreground":
              variant === "primary" || variant === "destructive",
            "text-ink dark:text-on-dark":
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
