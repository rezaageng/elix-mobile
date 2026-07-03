import React, { forwardRef, useCallback, useMemo, useRef } from "react"
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet"
import { Image } from "expo-image"
import { Calendar, Users } from "lucide-react-native"
import { Alert, Text, useColorScheme, View } from "react-native"

import { useJoinGuild } from "@/lib/api/guilds"
import type { Guild } from "@/lib/api/schemas"
import { useThemeColor } from "@/lib/use-theme-color"
import { Button } from "@/components/button"

export type GuildDetailSheetReference = BottomSheetModal

interface GuildDetailSheetProps {
  guild: Guild
  onJoined: () => void
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export const GuildDetailSheet = forwardRef<
  GuildDetailSheetReference,
  GuildDetailSheetProps
>(function GuildDetailSheet({ guild, onJoined }, reference) {
  const sheetReference = useRef<BottomSheetModal>(null)
  const colorScheme = useColorScheme()
  const isDark = colorScheme === "dark"
  const mutedColor = useThemeColor("muted")

  const joinGuild = useJoinGuild()

  const snapPoints = useMemo(() => ["50%"], [])

  React.useImperativeHandle(reference, () => sheetReference.current!)

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

  const handleJoin = () => {
    joinGuild.mutate(guild.id, {
      onSuccess: (record) => {
        sheetReference.current?.dismiss()
        if (record.status === "pending") {
          Alert.alert(
            "Request Sent",
            "Your join request has been sent to the guild admins."
          )
        } else {
          Alert.alert("Welcome!", "You have joined the guild.")
        }
        onJoined()
      },
      onError: (error_) => {
        Alert.alert("Join Failed", error_.message)
      },
    })
  }

  return (
    <BottomSheetModal
      ref={sheetReference}
      index={0}
      snapPoints={snapPoints}
      backdropComponent={renderBackdrop}
      enablePanDownToClose
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
          paddingBottom: 32,
        }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header image */}
        {guild.headerUrl ? (
          <Image
            source={{ uri: guild.headerUrl }}
            style={{ borderRadius: 12, width: "100%", height: 128 }}
            contentFit="cover"
            transition={200}
            accessibilityLabel={`${guild.name} guild header`}
          />
        ) : (
          <View className="h-32 w-full items-center justify-center rounded-lg bg-primary/20">
            <Users size={40} color="#cc785c" />
          </View>
        )}

        {/* Avatar */}
        <View className="items-center" style={{ marginTop: -40 }}>
          <View
            className="overflow-hidden rounded-lg border-4 border-canvas bg-surface-card dark:border-surface-dark dark:bg-surface-dark-elevated"
            style={{ width: 80, height: 80 }}
          >
            {guild.imageUrl ? (
              <Image
                source={{ uri: guild.imageUrl }}
                style={{ width: "100%", height: "100%" }}
                contentFit="cover"
                transition={200}
              />
            ) : (
              <View className="h-full w-full items-center justify-center bg-surface-card dark:bg-surface-dark">
                <Text className="font-display text-display-sm text-ink dark:text-on-dark">
                  {guild.name.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>
        </View>

        <Text className="mt-md text-center font-display text-display-sm text-ink dark:text-on-dark">
          {guild.name}
        </Text>

        {guild.description && (
          <Text className="mt-sm px-md text-center font-body text-body-md text-body dark:text-on-dark-soft">
            {guild.description}
          </Text>
        )}

        <View className="mt-sm flex-row justify-center gap-lg">
          <View className="flex-row items-center gap-1">
            <Users size={14} color={mutedColor} />
            <Text className="font-body-medium text-body-sm text-ink dark:text-on-dark">
              Guild
            </Text>
          </View>
          <View className="flex-row items-center gap-1">
            <Calendar size={14} color={mutedColor} />
            <Text className="font-body text-caption text-muted">
              Created {formatDate(guild.createdAt)}
            </Text>
          </View>
        </View>

        <View className="mt-lg">
          <Button
            variant="primary"
            title="Join Guild"
            onPress={handleJoin}
            disabled={joinGuild.isPending}
          />
        </View>
      </BottomSheetScrollView>
    </BottomSheetModal>
  )
})
