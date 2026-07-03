import React, { forwardRef, useCallback, useRef, useState } from "react"
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetTextInput,
} from "@gorhom/bottom-sheet"
import { Image } from "expo-image"
import { Pencil } from "lucide-react-native"
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native"

import type { Guild } from "@/lib/api/schemas"

export interface EditGuildSheetReference {
  present: () => void
  dismiss: () => void
}

interface EditGuildSheetProps {
  guild: Guild & { members: { id: string; role: string; status: string }[] }
  pendingAvatarUri?: string
  pendingHeaderUri?: string
  onSave: (data: {
    name: string
    description: string
    avatarUri?: string
    headerUri?: string
  }) => void
  onChangeAvatar: () => void
  onChangeHeader: () => void
  isLoading: boolean
}

const BANNER_PREVIEW_HEIGHT = 100
const AVATAR_SIZE = 80
const AVATAR_OFFSET = -40
const AVATAR_BORDER_RADIUS = 16

export const EditGuildSheet = forwardRef<
  EditGuildSheetReference,
  EditGuildSheetProps
>(function EditGuildSheet(
  {
    guild,
    pendingAvatarUri,
    pendingHeaderUri,
    onSave,
    onChangeAvatar,
    onChangeHeader,
    isLoading,
  },
  reference
) {
  const sheetReference = useRef<BottomSheetModal>(null)
  const colorScheme = useColorScheme()
  const isDark = colorScheme === "dark"
  const [name, setName] = useState(guild.name)
  const [description, setDescription] = useState(guild.description ?? "")

  const imageUri = pendingAvatarUri ?? guild.imageUrl ?? undefined
  const bannerUri = pendingHeaderUri ?? guild.headerUrl ?? undefined

  const hasChanges =
    name !== guild.name ||
    description !== (guild.description ?? "") ||
    !!pendingAvatarUri ||
    !!pendingHeaderUri

  React.useImperativeHandle(reference, () => ({
    present: () => {
      setName(guild.name)
      setDescription(guild.description ?? "")
      sheetReference.current?.present()
    },
    dismiss: () => sheetReference.current?.dismiss(),
  }))

  const handleSave = () => {
    onSave({
      name: name.trim(),
      description: description.trim(),
      avatarUri: pendingAvatarUri,
      headerUri: pendingHeaderUri,
    })
  }

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior="close"
      />
    ),
    []
  )

  return (
    <BottomSheetModal
      ref={sheetReference}
      index={0}
      snapPoints={["65%"]}
      backdropComponent={renderBackdrop}
      enablePanDownToClose
      stackBehavior="push"
      keyboardBehavior="extend"
      keyboardBlurBehavior="restore"
      backgroundStyle={{
        backgroundColor: isDark ? "#181715" : "#faf9f5",
      }}
      handleIndicatorStyle={{
        backgroundColor: isDark ? "#a09d96" : "#8e8b82",
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
        <View className="mb-6 items-center">
          <Text className="text-display-xs font-display text-ink dark:text-on-dark">
            Edit Guild
          </Text>
        </View>

        <View className="gap-4">
          {/* Header preview */}
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={onChangeHeader}
            style={{ height: BANNER_PREVIEW_HEIGHT }}
          >
            {bannerUri ? (
              <Image
                source={{ uri: bannerUri }}
                style={{ width: "100%", height: "100%", borderRadius: 12 }}
                contentFit="cover"
                cachePolicy="none"
                transition={200}
              />
            ) : (
              <View className="h-full w-full rounded-xl bg-primary" />
            )}
            <View
              className="absolute inset-0 items-center justify-center bg-black/30"
              style={{ borderRadius: 12 }}
            >
              <Pencil size={20} color="#ffffff" />
              <Text className="mt-1 font-body-medium text-caption text-white">
                Edit Banner
              </Text>
            </View>
          </TouchableOpacity>

          {/* Avatar overlapping header */}
          <View className="px-4">
            <View className="relative" style={{ marginTop: AVATAR_OFFSET }}>
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={onChangeAvatar}
                className="relative overflow-hidden border-4 border-canvas dark:border-surface-dark"
                style={{
                  width: AVATAR_SIZE,
                  height: AVATAR_SIZE,
                  borderRadius: AVATAR_BORDER_RADIUS,
                }}
              >
                {imageUri ? (
                  <Image
                    source={{ uri: imageUri }}
                    style={{ width: "100%", height: "100%", borderRadius: 12 }}
                    contentFit="cover"
                    contentPosition="center"
                    cachePolicy="none"
                    transition={200}
                  />
                ) : (
                  <View className="h-full w-full items-center justify-center bg-surface-card dark:bg-surface-dark">
                    <Text className="font-display text-display-sm text-ink dark:text-on-dark">
                      {guild.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
                <View
                  className="absolute inset-0 items-center justify-center bg-black/30"
                  style={{ borderRadius: AVATAR_BORDER_RADIUS }}
                >
                  <Pencil size={16} color="#ffffff" />
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Name input */}
          <View className="gap-sm">
            <Text className="font-body-medium text-body-sm text-ink dark:text-on-dark">
              Guild Name
            </Text>
            <BottomSheetTextInput
              className="text-md mt-2 rounded-md border border-hairline bg-canvas px-3 py-2 font-body text-ink dark:border-hairline dark:bg-surface-dark dark:text-on-dark"
              value={name}
              onChangeText={setName}
              placeholder="Enter guild name"
              placeholderTextColor="#8e8b82"
              autoCapitalize="words"
              editable={!isLoading}
            />
          </View>

          {/* Description input */}
          <View className="gap-sm">
            <Text className="font-body-medium text-body-sm text-ink dark:text-on-dark">
              Description
            </Text>
            <BottomSheetTextInput
              className="text-md mt-2 rounded-md border border-hairline bg-canvas px-3 py-2 font-body text-ink dark:border-hairline dark:bg-surface-dark dark:text-on-dark"
              value={description}
              onChangeText={setDescription}
              placeholder="Enter guild description"
              placeholderTextColor="#8e8b82"
              multiline
              editable={!isLoading}
            />
          </View>

          {/* Save button */}
          <TouchableOpacity
            onPress={handleSave}
            disabled={isLoading || !hasChanges}
            className="mt-2 items-center rounded-full bg-primary py-3"
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text className="font-body-medium text-button text-primary-foreground">
                Save Changes
              </Text>
            )}
          </TouchableOpacity>

        </View>
      </BottomSheetScrollView>
    </BottomSheetModal>
  )
})
