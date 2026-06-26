import { useCallback, useRef, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Image } from "expo-image"
import * as ImagePicker from "expo-image-picker"
import { useRouter } from "expo-router"
import {
  ChevronRight,
  LogOut,
  MessageSquare,
  Pencil,
  Trash2,
  Trophy,
  Users,
} from "lucide-react-native"
import {
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import {
  useDeleteGuild,
  useGuild,
  useLeaveGuild,
  useUpdateGuild,
  useUploadGuildImage,
} from "@/lib/api/guilds"
import type { Guild as GuildType } from "@/lib/api/schemas"
import { getMimeTypeFromFilename } from "@/lib/file-utils"
import { useThemeColor } from "@/lib/use-theme-color"
import { Button } from "@/components/button"
import {
  EditGuildSheet,
  type EditGuildSheetReference,
} from "@/components/guild/edit-guild-sheet"
import {
  ImagePickerSheet,
  type ImagePickerSheetReference,
} from "@/components/profile/image-picker-sheet"

interface GuildHomeProps {
  guild: GuildType & { role: string; status: string }
  currentUserId?: string
  onLeftGuild: () => void
}

const BASE_MENU_ITEMS = [
  {
    id: "chat",
    label: "Chat",
    icon: MessageSquare,
    route: "/guild/chat" as const,
  },
  {
    id: "leaderboard",
    label: "Leaderboard",
    icon: Trophy,
    route: "/guild/leaderboard" as const,
  },
  {
    id: "members",
    label: "Members",
    icon: Users,
    route: "/guild/members" as const,
  },
]

type ImageTarget = "avatar" | "header"

export default function GuildHome({
  guild,
  currentUserId,
  onLeftGuild,
}: GuildHomeProps) {
  const router = useRouter()
  const mutedColor = useThemeColor("muted")
  const queryClient = useQueryClient()
  const { data: guildDetail, refetch: refetchGuild } = useGuild(guild.id)
  const leaveGuild = useLeaveGuild()
  const updateGuild = useUpdateGuild()
  const uploadGuildImage = useUploadGuildImage()
  const deleteGuild = useDeleteGuild()
  const insets = useSafeAreaInsets()
  const [refreshing, setRefreshing] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [pendingAvatarUri, setPendingAvatarUri] = useState<string | undefined>()
  const [pendingHeaderUri, setPendingHeaderUri] = useState<string | undefined>()
  const imagePickMode = useRef<"immediate" | "deferred">("immediate")
  const editSheetReference = useRef<EditGuildSheetReference>(null)
  const avatarPickerReference = useRef<ImagePickerSheetReference>(null)
  const headerPickerReference = useRef<ImagePickerSheetReference>(null)

  const currentUserMember = guildDetail?.members?.find(
    (m) => m.id === currentUserId
  )
  const currentUserRole = currentUserMember?.role ?? guild.role
  const isAdmin = currentUserRole === "admin" || currentUserRole === "owner"
  const canLeave = currentUserRole !== "owner"

  const approvedMembers =
    guildDetail?.members?.filter((m) => m.status === "approved") ?? []
  const memberCount = approvedMembers.length

  const navigateTo = (route: string) => {
    router.push({ pathname: route as never, params: { guildId: guild.id } })
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await Promise.all([
      refetchGuild(),
      queryClient.invalidateQueries({ queryKey: ["guilds", "me"] }),
    ])
    setRefreshing(false)
  }

  const handleEditPress = () => {
    imagePickMode.current = "deferred"
    editSheetReference.current?.present()
  }

  const handleUploadImage = useCallback(
    async (target: ImageTarget, uri: string) => {
      const filename = uri.split("/").pop() ?? "photo.jpg"
      const type = getMimeTypeFromFilename(filename)

      const formData = new FormData()
      formData.append("file", {
        uri,
        name: filename,
        type,
      } as unknown as Blob)

      await uploadGuildImage.mutateAsync({
        guildId: guild.id,
        type: target,
        formData,
      })
    },
    [guild.id, uploadGuildImage]
  )

  const handlePickFromGallery = useCallback(
    async (target: ImageTarget) => {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: target === "avatar" ? [1, 1] : [16, 9],
        quality: 0.8,
      })
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0]?.uri
        if (uri) {
          if (imagePickMode.current === "deferred") {
            if (target === "avatar") {
              setPendingAvatarUri(uri)
              avatarPickerReference.current?.dismiss()
            } else {
              setPendingHeaderUri(uri)
              headerPickerReference.current?.dismiss()
            }
          } else {
            if (target === "avatar") avatarPickerReference.current?.dismiss()
            else headerPickerReference.current?.dismiss()
            await handleUploadImage(target, uri)
          }
        }
      }
    },
    [handleUploadImage]
  )

  const handleTakePhoto = useCallback(
    async (target: ImageTarget) => {
      const permission = await ImagePicker.requestCameraPermissionsAsync()
      if (!permission.granted) {
        Alert.alert(
          "Camera Permission",
          "Camera permission is required to take photos."
        )
        return
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: target === "avatar" ? [1, 1] : [16, 9],
        quality: 0.8,
      })
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0]?.uri
        if (uri) {
          if (imagePickMode.current === "deferred") {
            if (target === "avatar") {
              setPendingAvatarUri(uri)
              avatarPickerReference.current?.dismiss()
            } else {
              setPendingHeaderUri(uri)
              headerPickerReference.current?.dismiss()
            }
          } else {
            if (target === "avatar") avatarPickerReference.current?.dismiss()
            else headerPickerReference.current?.dismiss()
            await handleUploadImage(target, uri)
          }
        }
      }
    },
    [handleUploadImage]
  )

  const handleSaveGuild = useCallback(
    async (data: {
      name: string
      description: string
      avatarUri?: string
      headerUri?: string
    }) => {
      setIsUpdating(true)
      try {
        const body: { name?: string; description?: string } = {}
        if (data.name !== guild.name) body.name = data.name
        if (data.description !== (guild.description ?? ""))
          body.description = data.description

        if (Object.keys(body).length > 0) {
          await updateGuild.mutateAsync({ guildId: guild.id, body })
        }

        if (data.avatarUri) {
          await handleUploadImage("avatar", data.avatarUri)
        }
        if (data.headerUri) {
          await handleUploadImage("header", data.headerUri)
        }

        await queryClient.invalidateQueries({ queryKey: ["guilds"] })
        editSheetReference.current?.dismiss()
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Failed to update guild"
        Alert.alert("Error", message)
      } finally {
        setIsUpdating(false)
        setPendingAvatarUri(undefined)
        setPendingHeaderUri(undefined)
      }
    },
    [guild, queryClient, updateGuild, handleUploadImage]
  )

  const handleLeave = () => {
    Alert.alert("Leave Guild", "Are you sure you want to leave this guild?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Leave",
        style: "destructive",
        onPress: () => {
          leaveGuild.mutate(guild.id, {
            onSuccess: () => {
              onLeftGuild()
            },
            onError: (error_) => {
              Alert.alert("Error", error_.message)
            },
          })
        },
      },
    ])
  }

  const handleDeleteGuild = useCallback(() => {
    deleteGuild.mutate(guild.id, {
      onSuccess: () => {
        onLeftGuild()
      },
      onError: (error) => {
        Alert.alert("Error", error.message)
      },
    })
  }, [deleteGuild, guild.id, onLeftGuild])

  const headerUri = guildDetail?.headerUrl ?? guild.headerUrl ?? undefined
  const imageUri = guildDetail?.imageUrl ?? guild.imageUrl ?? undefined

  const guildWithMembers = {
    ...(guildDetail ?? guild),
    name: guild.name,
    description: guild.description,
    imageUrl: guild.imageUrl,
    headerUrl: guild.headerUrl,
    members: guildDetail?.members ?? [],
  }

  return (
    <View className="flex-1 bg-canvas dark:bg-surface-dark">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 64 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#cc785c"
            colors={["#cc785c"]}
            progressViewOffset={insets.top + 96}
          />
        }
      >
        {/* Banner - at y=0, under status bar */}
        <View className="relative h-[150px] w-full overflow-hidden">
          {headerUri ? (
            <Image
              source={{ uri: headerUri }}
              style={{ width: "100%", height: "100%" }}
              contentFit="cover"
              cachePolicy="none"
              transition={200}
            />
          ) : (
            <View className="h-full w-full bg-primary" />
          )}

          {/* Edit button - top right, admin/owner only */}
          {isAdmin && (
            <TouchableOpacity
              onPress={handleEditPress}
              className="absolute right-4 z-50 rounded-full bg-black/20 p-2"
              style={{ top: insets.top + 16 }}
              activeOpacity={0.7}
              testID="EditGuildButton"
            >
              <Pencil size={20} color="#ffffff" />
            </TouchableOpacity>
          )}
        </View>

        {/* Content below banner */}
        <View style={{ gap: 24 }}>
          {/* Avatar overlapping banner */}
          <View className="items-center" style={{ marginTop: -40 }}>
            <View
              className="overflow-hidden border-4 border-canvas bg-surface-card dark:border-surface-dark dark:bg-surface-dark-elevated"
              style={{ width: 80, height: 80, borderRadius: 16 }}
            >
              {imageUri ? (
                <Image
                  source={{ uri: imageUri }}
                  style={{ width: "100%", height: "100%" }}
                  contentFit="cover"
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
            </View>
          </View>

          {/* Name and meta */}
          <View className="items-center gap-sm px-md">
            <Text className="font-display text-display-sm text-ink dark:text-on-dark">
              {guild.name}
            </Text>

            {guild.description ? (
              <Text className="text-center font-body text-body-md text-muted dark:text-on-dark-soft">
                {guild.description}
              </Text>
            ) : undefined}

            <View className="flex-row items-center gap-sm">
              <Text className="font-body text-caption text-muted">
                {memberCount} members
              </Text>
              <View className="h-1 w-1 rounded-full bg-muted" />
              <Text className="font-body text-caption text-primary">
                {guild.role.charAt(0).toUpperCase() + guild.role.slice(1)}
              </Text>
            </View>
          </View>

          {/* Menu items */}
          <View className="gap-sm px-md">
            {BASE_MENU_ITEMS.map((item) => {
              const Icon = item.icon
              return (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.8}
                  onPress={() => navigateTo(item.route)}
                  className="flex-row items-center gap-sm rounded-lg bg-surface-card p-md dark:bg-surface-dark-elevated"
                  testID={`Guild${item.label}Button`}
                >
                  <Icon size={20} color={mutedColor} />
                  <Text className="flex-1 font-body-medium text-body-md text-ink dark:text-on-dark">
                    {item.label}
                  </Text>
                  <ChevronRight size={20} color={mutedColor} />
                </TouchableOpacity>
              )
            })}
          </View>

          {/* Delete Guild - owner only */}
          {guild.role === "owner" && (
            <View className="px-md">
              <Button
                variant="outline"
                title="Delete Guild"
                className="border-error"
                onPress={() =>
                  Alert.alert(
                    "Delete Guild",
                    "Are you sure? This cannot be undone.",
                    [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: "Delete",
                        style: "destructive",
                        onPress: handleDeleteGuild,
                      },
                    ]
                  )
                }
                disabled={deleteGuild.isPending}
                testID="DeleteGuildButton"
              >
                <Trash2 size={18} color="#c64545" />
                <Text className="font-body-medium text-button text-error">
                  Delete Guild
                </Text>
              </Button>
            </View>
          )}

          {/* Leave Guild */}
          {canLeave && (
            <View className="px-md">
              <Button
                variant="outline"
                title="Leave Guild"
                className="border-error"
                onPress={handleLeave}
                disabled={leaveGuild.isPending}
                testID="LeaveGuildButton"
              >
                <LogOut size={18} color="#c64545" />
                <Text className="font-body-medium text-button text-error">
                  Leave Guild
                </Text>
              </Button>
            </View>
          )}
        </View>

        <View className="h-4" />
      </ScrollView>

      {/* Edit Guild Sheet */}
      <EditGuildSheet
        ref={editSheetReference}
        guild={guildWithMembers}
        pendingAvatarUri={pendingAvatarUri}
        pendingHeaderUri={pendingHeaderUri}
        onSave={handleSaveGuild}
        onChangeAvatar={() => avatarPickerReference.current?.present()}
        onChangeHeader={() => headerPickerReference.current?.present()}
        isLoading={isUpdating}
      />

      {/* Avatar Picker Sheet */}
      <ImagePickerSheet
        ref={avatarPickerReference}
        onTakePhoto={() => handleTakePhoto("avatar")}
        onPickFromGallery={() => handlePickFromGallery("avatar")}
      />

      {/* Header Picker Sheet */}
      <ImagePickerSheet
        ref={headerPickerReference}
        onTakePhoto={() => handleTakePhoto("header")}
        onPickFromGallery={() => handlePickFromGallery("header")}
      />
    </View>
  )
}
