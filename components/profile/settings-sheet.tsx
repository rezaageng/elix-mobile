import React, { forwardRef, useCallback } from "react"
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet"
import { Alert, Switch, Text, TouchableOpacity, useColorScheme, View } from "react-native"

import { authClient } from "@/lib/auth-client"
import {
  useProfileSettings,
  useUpdateProfileSettings,
  type ProfileSettings,
} from "@/lib/settings-store"

export interface SettingsSheetReference {
  present: () => void
  dismiss: () => void
}

  export const SettingsSheet = forwardRef<SettingsSheetReference>(
  function SettingsSheet(_, reference) {
    const sheetReference = React.useRef<BottomSheetModal>(null)
    const { data: settings } = useProfileSettings()
    const updateSettings = useUpdateProfileSettings()
    const colorScheme = useColorScheme()

    React.useImperativeHandle(reference, () => ({
      present: () => {
        sheetReference.current?.present()
      },
      dismiss: () => sheetReference.current?.dismiss(),
    }))

    const updateSetting = useCallback(
      async (key: keyof ProfileSettings, value: boolean) => {
        await updateSettings.mutateAsync({ [key]: value })
      },
      [updateSettings]
    )

    const handleLogout = useCallback(() => {
      Alert.alert("Log Out", "Are you sure you want to log out?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Log Out",
          style: "destructive",
          onPress: async () => {
            await authClient.signOut()
          },
        },
      ])
    }, [])

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
        />
      ),
      []
    )

    return (
      <BottomSheetModal
        ref={sheetReference}
        index={0}
        snapPoints={["55%"]}
        backdropComponent={renderBackdrop}
        enablePanDownToClose
        backgroundStyle={{
          backgroundColor: colorScheme === "dark" ? "#181715" : "#faf9f5",
        }}
        handleIndicatorStyle={{
          backgroundColor: colorScheme === "dark" ? "#a09d96" : "#8e8b82",
        }}
      >
        <BottomSheetView className="flex-1 bg-canvas px-4 py-2 dark:bg-surface-dark">
          <View className="mb-6 items-center">
            <Text className="font-display text-display-xs text-ink dark:text-on-dark">
              Settings
            </Text>
          </View>

          <View className="gap-1">
            {/* Privacy */}
            <View className="mb-3 px-2">
              <Text className="font-body-bold text-caption-uppercase text-muted">
                Privacy
              </Text>
            </View>

            <SettingRow
              label="Hide activity"
              description="Completely hide your activity"
              value={settings?.hideActivityCompletely ?? false}
              onValueChange={(v) => updateSetting("hideActivityCompletely", v)}
              disabled={updateSettings.isPending}
            />

            <SettingRow
              label="Hide quest names"
              description="Hide quest names in activity feed"
              value={!(settings?.showQuestNamesInActivity ?? true)}
              onValueChange={(v) => updateSetting("showQuestNamesInActivity", !v)}
              disabled={updateSettings.isPending || (settings?.hideActivityCompletely ?? false)}
            />

            {/* Account */}
            <View className="mb-3 mt-6 px-2">
              <Text className="font-body-bold text-caption-uppercase text-muted">
                Account
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleLogout}
              className="flex-row items-center rounded-lg bg-surface-card p-4 dark:bg-surface-dark"
            >
              <Text className="flex-1 font-body-medium text-body-sm text-error">
                Log Out
              </Text>
            </TouchableOpacity>
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    )
  }
)

function SettingRow({
  label,
  description,
  value,
  onValueChange,
  disabled,
}: {
  label: string
  description: string
  value: boolean
  onValueChange: (value: boolean) => void
  disabled?: boolean
}) {
  return (
    <View className="flex-row items-center gap-3 rounded-lg bg-surface-card p-4 dark:bg-surface-dark">
      <View className="flex-1 gap-0.5">
        <Text className="font-body-medium text-body-sm text-ink dark:text-on-dark">
          {label}
        </Text>
        <Text className="font-body text-caption text-muted">{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: "#e6dfd8", true: "#cc785c" }}
        thumbColor="#ffffff"
      />
    </View>
  )
}
