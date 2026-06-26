import React, { forwardRef, useCallback } from "react"
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetTextInput,
} from "@gorhom/bottom-sheet"
import { useForm } from "@tanstack/react-form"
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native"
import { z } from "zod"

import type { PublicUser } from "@/lib/api/schemas"
import { getZodErrorMessage } from "@/lib/form-utils"
import { ProfileHeader } from "@/components/profile/profile-header"

export interface EditProfileSheetReference {
  present: () => void
  dismiss: () => void
}

interface EditProfileSheetProps {
  user: PublicUser
  pendingAvatarUri?: string
  pendingBannerUri?: string
  onSave: (data: {
    name: string
    username: string
    avatarUri?: string
    bannerUri?: string
  }) => void
  onChangeAvatar: () => void
  onChangeBanner: () => void
  isLoading: boolean
}

const BANNER_PREVIEW_HEIGHT = 100

const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be at most 30 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    ),
})

const nameSchema = z.string().min(1, "Name is required")
const usernameSchema = z
  .string()
  .min(3, "Username must be at least 3 characters")
  .max(30, "Username must be at most 30 characters")
  .regex(
    /^[a-zA-Z0-9_]+$/,
    "Username can only contain letters, numbers, and underscores"
  )

export const EditProfileSheet = forwardRef<
  EditProfileSheetReference,
  EditProfileSheetProps
>(function EditProfileSheet(
  {
    user,
    pendingAvatarUri,
    pendingBannerUri,
    onSave,
    onChangeAvatar,
    onChangeBanner,
    isLoading,
  },
  reference
) {
  const sheetReference = React.useRef<BottomSheetModal>(null)
  const colorScheme = useColorScheme()
  const isDark = colorScheme === "dark"

  const form = useForm({
    defaultValues: {
      name: user.name,
      username: user.username ?? "",
    },
    validators: {
      onSubmit: ({ value }) => {
        const result = profileSchema.safeParse(value)
        if (!result.success) {
          const errors: Record<string, string> = {}
          const issues = (
            result as {
              error?: {
                issues?: { message: string; path: (string | number)[] }[]
              }
            }
          ).error?.issues
          if (issues) {
            for (const issue of issues) {
              const field = String(issue.path[0] ?? "")
              if (field && !errors[field]) {
                errors[field] = issue.message
              }
            }
          }
          if (Object.keys(errors).length > 0) return errors
          return "Please fix the form errors"
        }
      },
    },
    onSubmit: async ({ value }) => {
      onSave({
        name: value.name.trim(),
        username: value.username.trim(),
        avatarUri: pendingAvatarUri,
        bannerUri: pendingBannerUri,
      })
    },
  })

  React.useImperativeHandle(reference, () => ({
    present: () => {
      form.reset({
        name: user.name,
        username: user.username ?? "",
      })
      sheetReference.current?.present()
    },
    dismiss: () => sheetReference.current?.dismiss(),
  }))

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
            Edit Profile
          </Text>
        </View>

        <View className="gap-4">
          <ProfileHeader
            user={user}
            bannerHeight={BANNER_PREVIEW_HEIGHT}
            bannerBorderRadius={12}
            onBannerPress={onChangeBanner}
            onAvatarPress={onChangeAvatar}
            showEditOverlays
            previewImageUri={pendingAvatarUri}
            previewBannerUri={pendingBannerUri}
          />

          <form.Field
            name="name"
            validators={{
              onChange: ({ value }) => {
                const result = nameSchema.safeParse(value)
                if (!result.success) {
                  return getZodErrorMessage(result.error) ?? "Invalid name"
                }
              },
            }}
          >
            {(field) => (
              <View>
                <Text className="font-body-medium text-body-sm text-ink dark:text-on-dark">
                  Name
                </Text>
                <BottomSheetTextInput
                  testID="ProfileNameInput"
                  className="text-md mt-2 rounded-md border border-hairline bg-canvas px-3 py-2 font-body text-ink dark:border-hairline dark:bg-surface-dark dark:text-on-dark"
                  value={field.state.value}
                  onChangeText={field.handleChange}
                  onBlur={field.handleBlur}
                  placeholder="Your name"
                  placeholderTextColor="#8e8b82"
                  autoCapitalize="words"
                  editable={!isLoading}
                />
                {field.state.meta.errors.length > 0 && (
                  <Text className="mt-1 font-body text-caption text-error">
                    {field.state.meta.errors.map(String).join(", ")}
                  </Text>
                )}
              </View>
            )}
          </form.Field>

          <form.Field
            name="username"
            validators={{
              onChange: ({ value }) => {
                const result = usernameSchema.safeParse(value)
                if (!result.success) {
                  return getZodErrorMessage(result.error) ?? "Invalid username"
                }
              },
            }}
          >
            {(field) => (
              <View>
                <Text className="font-body-medium text-body-sm text-ink dark:text-on-dark">
                  Username
                </Text>
                <BottomSheetTextInput
                  className="text-md mt-2 rounded-md border border-hairline bg-canvas px-3 py-2 font-body text-ink dark:border-hairline dark:bg-surface-dark dark:text-on-dark"
                  value={field.state.value}
                  onChangeText={field.handleChange}
                  onBlur={field.handleBlur}
                  placeholder="your_username"
                  placeholderTextColor="#8e8b82"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
                {field.state.meta.errors.length > 0 && (
                  <Text className="mt-1 font-body text-caption text-error">
                    {field.state.meta.errors.map(String).join(", ")}
                  </Text>
                )}
                <Text className="mt-1 font-body text-caption text-muted">
                  Letters, numbers, and underscores only
                </Text>
              </View>
            )}
          </form.Field>

          <form.Subscribe selector={(state) => state.isSubmitting}>
            {(isSubmitting) => (
              <TouchableOpacity
                onPress={form.handleSubmit}
                testID="SaveProfileButton"
                disabled={isLoading || isSubmitting}
                className="mt-2 items-center rounded-full bg-primary py-3"
              >
                {isLoading || isSubmitting ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text className="font-body-medium text-button text-primary-foreground">
                    Save Changes
                  </Text>
                )}
              </TouchableOpacity>
            )}
          </form.Subscribe>
        </View>
      </BottomSheetScrollView>
    </BottomSheetModal>
  )
})
