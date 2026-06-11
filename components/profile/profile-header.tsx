import React from "react"
import { Image } from "expo-image"
import { Pencil } from "lucide-react-native"
import { Text, TouchableOpacity, View } from "react-native"

import type { PublicUser } from "@/lib/api/schemas"

interface ProfileHeaderProps {
  user: PublicUser
  bannerHeight: number
  bannerBorderRadius?: number
  onBannerPress?: () => void
  onAvatarPress?: () => void
  showEditOverlays?: boolean
  previewImageUri?: string
  previewBannerUri?: string
}

export function ProfileHeader({
  user,
  bannerHeight,
  bannerBorderRadius = 0,
  onBannerPress,
  onAvatarPress,
  showEditOverlays = false,
  previewImageUri,
  previewBannerUri,
}: ProfileHeaderProps) {
  const avatarSize = 80
  const avatarOffset = -40

  const imageUri = previewImageUri ?? user.image ?? undefined
  const bannerUri = previewBannerUri ?? user.banner ?? undefined

  return (
    <View>
      {/* Banner */}
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onBannerPress}
        style={{ height: bannerHeight }}
      >
        {bannerUri ? (
          <Image
            source={{ uri: bannerUri }}
            style={{
              width: "100%",
              height: bannerHeight,
              borderRadius: bannerBorderRadius,
            }}
            contentFit="cover"
            cachePolicy="none"
            transition={200}
          />
        ) : (
          <View
            className="h-full w-full bg-primary"
            style={{
              borderRadius: bannerBorderRadius,
            }}
          />
        )}

        {showEditOverlays && (
          <View
            className="absolute inset-0 items-center justify-center bg-black/30"
            style={{ borderRadius: bannerBorderRadius }}
          >
            <Pencil size={20} color="#ffffff" />
            <Text className="mt-1 font-body-medium text-caption text-white">
              Edit Banner
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Avatar overlapping banner */}
      <View className="px-4">
        <View className="relative" style={{ marginTop: avatarOffset }}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={onAvatarPress}
            className="relative overflow-hidden rounded-full border-4 border-canvas dark:border-surface-dark"
            style={{ width: avatarSize, height: avatarSize }}
          >
            {imageUri ? (
              <Image
                source={{ uri: imageUri }}
                style={{ width: "100%", height: "100%" }}
                contentFit="cover"
                contentPosition="center"
                cachePolicy="none"
                transition={200}
              />
            ) : (
              <View className="h-full w-full items-center justify-center bg-surface-card dark:bg-surface-dark">
                <Text className="font-display text-display-sm text-ink dark:text-on-dark">
                  {user.name.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}

            {showEditOverlays && (
              <View className="absolute inset-0 items-center justify-center rounded-full bg-black/30">
                <Pencil size={16} color="#ffffff" />
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}
