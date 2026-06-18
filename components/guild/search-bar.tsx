import { Search, X } from "lucide-react-native"
import { useRef, useState } from "react"
import { TextInput, TouchableOpacity, View } from "react-native"

import { useThemeColor } from "@/lib/use-theme-color"
import { cn } from "@/lib/utils"

interface SearchBarProps {
  value: string
  onChangeText: (text: string) => void
  placeholder?: string
}

export default function SearchBar({
  value,
  onChangeText,
  placeholder = "Search guilds...",
}: SearchBarProps) {
  const [focused, setFocused] = useState(false)
  const inputReference = useRef<TextInput>(null)
  const mutedColor = useThemeColor("muted")

  return (
    <View
      className={cn(
        "flex-row items-center gap-sm rounded-md border bg-canvas px-md py-sm dark:bg-surface-dark",
        focused ? "border-primary" : "border-hairline dark:border-hairline"
      )}
    >
      <Search size={18} color={mutedColor} />
      <TextInput
        ref={inputReference}
        className="flex-1 font-body text-body-md text-ink dark:text-on-dark"
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#8e8b82"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        returnKeyType="search"
        accessibilityLabel="Search guilds"
      />
      {value.length > 0 && (
        <TouchableOpacity
          onPress={() => {
            onChangeText("")
            inputReference.current?.focus()
          }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel="Clear search"
        >
          <X size={18} color={mutedColor} />
        </TouchableOpacity>
      )}
    </View>
  )
}
