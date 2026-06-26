import React, { forwardRef, useCallback, useMemo, useRef, useState } from "react"
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetTextInput,
} from "@gorhom/bottom-sheet"
import { ActivityIndicator, Text, TouchableOpacity, useColorScheme, View } from "react-native"

import { useCreateGuild } from "@/lib/api/guilds"
import { useThemeColor } from "@/lib/use-theme-color"

export type CreateGuildSheetReference = BottomSheetModal

interface CreateGuildSheetProps {
  onCreated: () => void
}

export const CreateGuildSheet = forwardRef<
  CreateGuildSheetReference,
  CreateGuildSheetProps
>(function CreateGuildSheet({ onCreated }, reference) {
  const sheetReference = useRef<BottomSheetModal>(null)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [error, setError] = useState<string>()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === "dark"
  const mutedColor = useThemeColor("muted")

  const createGuild = useCreateGuild()

  const snapPoints = useMemo(() => ["55%"], [])

  React.useImperativeHandle(reference, () => sheetReference.current as BottomSheetModal)

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        pressBehavior="close"
      />
    ),
    []
  )

  const handleSubmit = () => {
    const trimmed = name.trim()
    if (trimmed.length < 2) {
      setError("Guild name must be at least 2 characters")
      return
    }
    setError(undefined)
    createGuild.mutate(
      { name: trimmed, description: description.trim() || undefined },
      {
        onSuccess: () => {
          setName("")
          setDescription("")
          setError(undefined)
          sheetReference.current?.dismiss()
          onCreated()
        },
        onError: (error_) => {
          setError(error_.message)
        },
      }
    )
  }

  const isValid = name.trim().length >= 2

  return (
    <BottomSheetModal
      ref={sheetReference}
      index={0}
      snapPoints={snapPoints}
      backdropComponent={renderBackdrop}
      enablePanDownToClose
      keyboardBehavior="extend"
      keyboardBlurBehavior="restore"
      backgroundStyle={{
        backgroundColor: isDark ? "#181715" : "#faf9f5",
      }}
      handleIndicatorStyle={{
        backgroundColor: mutedColor,
        width: 40,
        height: 4,
        borderRadius: 2,
      }}
    >
      <BottomSheetScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingVertical: 8,
          paddingBottom: 200,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <Text className="font-display text-display-sm text-ink dark:text-on-dark">
          Create Guild
        </Text>

        <View className="mt-md gap-sm">
          <Text className="font-body-medium text-body-sm text-ink dark:text-on-dark">
            Guild Name
          </Text>
          <BottomSheetTextInput
            className="rounded-md border border-hairline bg-canvas px-3 py-2 font-body text-body-md text-ink dark:border-hairline dark:bg-surface-dark dark:text-on-dark"
            value={name}
            onChangeText={(text) => {
              setName(text)
              setError(undefined)
            }}
            placeholder="e.g., Dragon Slayers"
            placeholderTextColor="#8e8b82"
            autoCapitalize="words"
            accessibilityLabel="Guild name"
            testID="GuildNameInput"
          />
        </View>

        <View className="mt-md gap-sm">
          <Text className="font-body-medium text-body-sm text-ink dark:text-on-dark">
            Description (optional)
          </Text>
          <BottomSheetTextInput
            className="rounded-md border border-hairline bg-canvas px-3 py-2 font-body text-body-md text-ink dark:border-hairline dark:bg-surface-dark dark:text-on-dark"
            value={description}
            onChangeText={setDescription}
            placeholder="What is your guild about?"
            placeholderTextColor="#8e8b82"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            style={{ minHeight: 80 }}
            accessibilityLabel="Guild description"
            testID="GuildDescriptionInput"
          />
        </View>

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={!isValid || createGuild.isPending}
          className="mt-lg items-center rounded-full bg-primary py-3 active:bg-primary-active"
          testID="CreateGuildSubmit"
        >
          {createGuild.isPending ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text className="font-body-medium text-button text-primary-foreground">
              Create Guild
            </Text>
          )}
        </TouchableOpacity>

        {error && (
          <Text className="mt-sm text-center font-body text-body-sm text-error">
            {error}
          </Text>
        )}
      </BottomSheetScrollView>
    </BottomSheetModal>
  )
})
