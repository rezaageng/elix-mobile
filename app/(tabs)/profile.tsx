import { useCallback, useRef, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import * as ImagePicker from "expo-image-picker"
import { useRouter } from "expo-router"
import { Pencil, Settings } from "lucide-react-native"
import {
  Alert,
  Animated,
  RefreshControl,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native"
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"

import {
  useChooseClass,
  useClassQuests,
  useClasses,
  useCurrentUser,
  useDeleteClass,
  useUploadAvatar,
  useUploadBanner,
  useUserStats,
} from "@/lib/api"
import type { Class, ClassQuest, UserStats } from "@/lib/api/schemas"
import { authClient } from "@/lib/auth-client"
import { useProfileSettings, type ProfileSettings } from "@/lib/settings-store"
import {
  ActivityTab,
  AvatarSection,
  CollectionsTab,
  EditProfileSheet,
  EditRoleSheet,
  ImagePickerSheet,
  ImageViewerModal,
  ProfileHeader,
  SettingsSheet,
  StatsSection,
  type EditProfileSheetReference,
  type EditRoleSheetReference,
  type ImagePickerSheetReference,
  type SettingsSheetReference,
} from "@/components/profile"

const BANNER_HEIGHT = 150
const HEADER_THRESHOLD = 100

type TabKey = "stats" | "activity" | "collections"
type ImageTarget = "avatar" | "banner"

export default function ProfileScreen() {
  const {
    data: user,
    isLoading: userLoading,
    refetch: refetchUser,
  } = useCurrentUser()
  const {
    data: stats,
    isLoading: statsLoading,
    refetch: refetchStats,
  } = useUserStats(user?.id ?? "")
  const { data: quests } = useClassQuests(user?.activeClass?.id ?? "")
  const { data: allClasses } = useClasses()
  const deleteClassMutation = useDeleteClass()
  const chooseClassMutation = useChooseClass()
  const [isSwitchingRole, setIsSwitchingRole] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const { data: settings } = useProfileSettings()
  const [activeTab, setActiveTab] = useState<TabKey>("stats")
  const settingsSheetReference = useRef<SettingsSheetReference>(null)
  const editProfileSheetReference = useRef<EditProfileSheetReference>(null)
  const editRoleSheetReference = useRef<EditRoleSheetReference>(null)
  const avatarPickerReference = useRef<ImagePickerSheetReference>(null)
  const bannerPickerReference = useRef<ImagePickerSheetReference>(null)
  const scrollY = useRef(new Animated.Value(0)).current
  const router = useRouter()
  const [selectedRoleId, setSelectedRoleId] = useState<string>()

  const [viewerImage, setViewerImage] = useState<string | undefined>()
  const [viewerVisible, setViewerVisible] = useState(false)
  const [viewerTarget, setViewerTarget] = useState<ImageTarget>("avatar")

  const [pendingAvatarUri, setPendingAvatarUri] = useState<string | undefined>()
  const [pendingBannerUri, setPendingBannerUri] = useState<string | undefined>()
  const imagePickMode = useRef<"immediate" | "deferred">("immediate")

  const uploadAvatar = useUploadAvatar()
  const uploadBanner = useUploadBanner()
  const queryClient = useQueryClient()
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)

  const handleAddRole = useCallback(() => {
    router.push("/roles/create?choose=false")
  }, [router])

  const handleBrowseRoles = useCallback(() => {
    router.push("/roles")
  }, [router])

  const handleEditRole = useCallback(
    (classId: string) => {
      setSelectedRoleId(classId)
      editRoleSheetReference.current?.present()
    },
    []
  )

  const handleDeleteRole = useCallback(
    (classId: string) => {
      Alert.alert("Delete Role", "Are you sure? This cannot be undone.", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteClassMutation.mutateAsync(classId)
              queryClient.invalidateQueries({ queryKey: ["user", "me"] })
            } catch {
              Alert.alert(
                "Delete Failed",
                "Failed to delete role. Please try again."
              )
            }
          },
        },
      ])
    },
    [deleteClassMutation, queryClient]
  )

  const handleEditRoleSelect = useCallback(
    (optionId: "details" | "main" | "side" | "recurring") => {
      if (!selectedRoleId) return
      switch (optionId) {
        case "details": {
          router.push(`/roles/create?classId=${selectedRoleId}`)
          break
        }
        case "main":
        case "side":
        case "recurring": {
          router.push({
            pathname: "/roles/quests/edit-list",
            params: { classId: selectedRoleId, type: optionId },
          })
          break
        }
      }
      setSelectedRoleId(undefined)
    },
    [router, selectedRoleId]
  )

  const handleSwitchRole = useCallback(
    async (classId: string) => {
      if (classId === user?.activeClass?.id) return
      setIsSwitchingRole(true)
      try {
        await chooseClassMutation.mutateAsync(classId)
        await queryClient.invalidateQueries({ queryKey: ["user", "me"] })
      } catch {
        Alert.alert("Switch Failed", "Failed to switch role. Please try again.")
      } finally {
        setIsSwitchingRole(false)
      }
    },
    [chooseClassMutation, queryClient, user?.activeClass?.id]
  )

  const onRefresh = async () => {
    setRefreshing(true)
    await Promise.all([refetchUser(), refetchStats()])
    setRefreshing(false)
  }

  const insets = useSafeAreaInsets()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === "dark"

  const headerBackground = scrollY.interpolate({
    inputRange: [0, HEADER_THRESHOLD],
    outputRange: isDark
      ? ["rgba(24, 23, 21, 0)", "rgba(24, 23, 21, 0.9)"]
      : ["rgba(250, 249, 245, 0)", "rgba(250, 249, 245, 0.9)"],
    extrapolate: "clamp",
  })

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_THRESHOLD],
    outputRange: [0, 1],
    extrapolate: "clamp",
  })

  const openImageViewer = useCallback(
    (target: ImageTarget, uri: string | undefined) => {
      if (!uri) return
      setViewerTarget(target)
      setViewerImage(uri)
      setViewerVisible(true)
    },
    []
  )

  const closeImageViewer = useCallback(() => {
    setViewerVisible(false)
    setViewerImage(undefined)
  }, [])

  const handleUploadImage = useCallback(
    async (target: ImageTarget, uri: string) => {
      const filename = uri.split("/").pop() ?? "photo.jpg"
      const match = /\.\w+$/.exec(filename)
      const type = match ? `image/${match[0].slice(1)}` : "image/jpeg"

      const formData = new FormData()
      formData.append("image", {
        uri,
        name: filename,
        type,
      } as unknown as Blob)

      try {
        const mutation = target === "avatar" ? uploadAvatar : uploadBanner
        await mutation.mutateAsync(formData)
      } catch {
        Alert.alert(
          "Upload Failed",
          `Failed to upload ${target}. Please try again.`
        )
      }
    },
    [uploadAvatar, uploadBanner]
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
              setPendingBannerUri(uri)
              bannerPickerReference.current?.dismiss()
            }
          } else {
            if (target === "avatar") avatarPickerReference.current?.dismiss()
            else bannerPickerReference.current?.dismiss()
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
              setPendingBannerUri(uri)
              bannerPickerReference.current?.dismiss()
            }
          } else {
            if (target === "avatar") avatarPickerReference.current?.dismiss()
            else bannerPickerReference.current?.dismiss()
            await handleUploadImage(target, uri)
          }
        }
      }
    },
    [handleUploadImage]
  )

  const handleEditProfile = useCallback(() => {
    imagePickMode.current = "deferred"
    editProfileSheetReference.current?.present()
  }, [])

  const handleSaveProfile = useCallback(
    async (data: {
      name: string
      username: string
      avatarUri?: string
      bannerUri?: string
    }) => {
      setIsUpdatingProfile(true)
      try {
        const body: { name?: string; username?: string } = {}
        if (data.name !== user?.name) body.name = data.name
        if (data.username !== (user?.username ?? ""))
          body.username = data.username || undefined

        if (Object.keys(body).length > 0) {
          const result = await authClient.updateUser(body)
          if (result.error) {
            Alert.alert(
              "Update Failed",
              result.error.message || "Failed to update profile."
            )
            return
          }
        }

        if (data.avatarUri) {
          await handleUploadImage("avatar", data.avatarUri)
        }
        if (data.bannerUri) {
          await handleUploadImage("banner", data.bannerUri)
        }

        await queryClient.invalidateQueries({ queryKey: ["user", "me"] })
        editProfileSheetReference.current?.dismiss()
      } catch {
        Alert.alert(
          "Update Failed",
          "Failed to update profile. Please try again."
        )
      } finally {
        setIsUpdatingProfile(false)
        setPendingAvatarUri(undefined)
        setPendingBannerUri(undefined)
      }
    },
    [user, queryClient, handleUploadImage]
  )

  const isLoading = userLoading || statsLoading

  if (isLoading && !user) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-canvas dark:bg-surface-dark">
        <Text className="font-body text-body-sm text-muted">
          Loading profile...
        </Text>
      </SafeAreaView>
    )
  }

  if (!user) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-canvas dark:bg-surface-dark">
        <Text className="font-body text-body-sm text-muted">
          Failed to load profile
        </Text>
      </SafeAreaView>
    )
  }

  return (
    <View className="flex-1 bg-canvas dark:bg-surface-dark">
      <Animated.ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#cc785c"
            colors={["#cc785c"]}
            progressViewOffset={insets.top + 24}
          />
        }
        className="flex-1"
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        <ProfileHeader
          user={user}
          bannerHeight={BANNER_HEIGHT}
          onBannerPress={() =>
            openImageViewer("banner", user.banner ?? undefined)
          }
          onAvatarPress={() =>
            openImageViewer("avatar", user.image ?? undefined)
          }
        />

        {/* Profile Info */}
        <AvatarSection
          user={user}
          totalQuests={stats?.allTime.questsCompleted ?? 0}
        />

        {/* Tabs */}
        <View className="px-4 pt-4">
          <View className="flex-row gap-2">
            <TabButton
              label="Stats"
              isActive={activeTab === "stats"}
              onPress={() => setActiveTab("stats")}
            />
            <TabButton
              label="Activity"
              isActive={activeTab === "activity"}
              onPress={() => setActiveTab("activity")}
            />
            <TabButton
              label="Collections"
              isActive={activeTab === "collections"}
              onPress={() => setActiveTab("collections")}
            />
          </View>
        </View>

        {/* Tab Content */}
        <View className="px-4 py-4">
          <TabContent
            activeTab={activeTab}
            stats={stats}
            quests={quests ?? []}
            settings={settings}
            classes={allClasses?.filter((c) => c.authorId === user.id) ?? []}
            activeClass={user.activeClass}
            userId={user.id}
            onAddRole={handleAddRole}
            onBrowseRoles={handleBrowseRoles}
            onEditRole={handleEditRole}
            onDeleteRole={handleDeleteRole}
            onSwitchRole={handleSwitchRole}
            isSwitchingRole={isSwitchingRole}
          />
        </View>

        {/* Bottom padding */}
        <View className="h-8" />
      </Animated.ScrollView>

      {/* Full-width header background + title - fades in on scroll */}
      <Animated.View
        className="absolute left-0 right-0 top-0"
        style={{
          paddingTop: insets.top,
          opacity: headerOpacity,
          backgroundColor: headerBackground,
          zIndex: 40,
        }}
      >
        <View className="flex-row items-center justify-between px-4 py-3">
          <Text className="font-display text-display-sm text-ink dark:text-on-dark">
            {user.displayUsername ?? user.username ?? user.name}
          </Text>
          <View className="w-24" />
        </View>
      </Animated.View>

      {/* Buttons - always visible, hug content on the right */}
      <View
        className="absolute right-0 top-0"
        style={{ paddingTop: insets.top, zIndex: 50 }}
      >
        <View className="flex-row items-center gap-2 px-4 py-3">
          <TouchableOpacity
            onPress={handleEditProfile}
            className="rounded-full bg-black/20 p-2"
            activeOpacity={0.7}
          >
            <Pencil size={20} color="#ffffff" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => settingsSheetReference.current?.present()}
            className="rounded-full bg-black/20 p-2"
            activeOpacity={0.7}
          >
            <Settings size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Settings Sheet */}
      <SettingsSheet ref={settingsSheetReference} />

      {/* Edit Role Sheet */}
      <EditRoleSheet
        ref={editRoleSheetReference}
        onSelect={handleEditRoleSelect}
      />

      {/* Edit Profile Sheet */}
      <EditProfileSheet
        ref={editProfileSheetReference}
        user={user}
        pendingAvatarUri={pendingAvatarUri}
        pendingBannerUri={pendingBannerUri}
        onSave={handleSaveProfile}
        onChangeAvatar={() => avatarPickerReference.current?.present()}
        onChangeBanner={() => bannerPickerReference.current?.present()}
        isLoading={isUpdatingProfile}
      />

      {/* Avatar Picker Sheet */}
      <ImagePickerSheet
        ref={avatarPickerReference}
        onTakePhoto={() => handleTakePhoto("avatar")}
        onPickFromGallery={() => handlePickFromGallery("avatar")}
      />

      {/* Banner Picker Sheet */}
      <ImagePickerSheet
        ref={bannerPickerReference}
        onTakePhoto={() => handleTakePhoto("banner")}
        onPickFromGallery={() => handlePickFromGallery("banner")}
      />

      {/* Image Viewer Modal */}
      <ImageViewerModal
        visible={viewerVisible}
        uri={viewerImage}
        onClose={closeImageViewer}
        onEdit={() => {
          closeImageViewer()
          imagePickMode.current = "immediate"
          if (viewerTarget === "avatar") {
            avatarPickerReference.current?.present()
          } else {
            bannerPickerReference.current?.present()
          }
        }}
      />
    </View>
  )
}

function TabContent({
  activeTab,
  stats,
  quests,
  settings,
  classes,
  activeClass,
  userId,
  onAddRole,
  onBrowseRoles,
  onEditRole,
  onDeleteRole,
  onSwitchRole,
  isSwitchingRole,
}: {
  activeTab: TabKey
  stats: UserStats | undefined
  quests: ClassQuest[]
  settings: ProfileSettings | undefined
  classes: Class[]
  activeClass: Class | null
  userId: string
  onAddRole: () => void
  onBrowseRoles: () => void
  onEditRole: (classId: string) => void
  onDeleteRole: (classId: string) => void
  onSwitchRole: (classId: string) => void
  isSwitchingRole: boolean
}) {
  if (activeTab === "stats") {
    if (stats) {
      return <StatsSection stats={stats} />
    }
    return (
      <View className="items-center py-8">
        <Text className="font-body text-body-sm text-muted">
          No stats available
        </Text>
      </View>
    )
  }

  if (activeTab === "activity") {
    return (
      <ActivityTab quests={quests} showQuestNames={true} hideActivity={false} />
    )
  }

  return (
    <CollectionsTab
      classes={classes}
      activeClass={activeClass}
      userId={userId}
      onAddRole={onAddRole}
      onBrowseRoles={onBrowseRoles}
      onEditRole={onEditRole}
      onDeleteRole={onDeleteRole}
      onSwitchRole={onSwitchRole}
      isSwitchingRole={isSwitchingRole}
    />
  )
}

function TabButton({
  label,
  isActive,
  onPress,
}: {
  label: string
  isActive: boolean
  onPress: () => void
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`flex-1 items-center rounded-full px-4 py-2 ${
        isActive
          ? "bg-primary"
          : "bg-surface-card dark:bg-surface-dark-elevated"
      }`}
    >
      <Text
        className={`font-body-medium text-body-sm ${
          isActive ? "text-primary-foreground" : "text-ink dark:text-on-dark"
        }`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  )
}
