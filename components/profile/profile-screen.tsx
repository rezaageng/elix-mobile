import { useCallback, useRef, useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import * as ImagePicker from "expo-image-picker"
import { useRouter } from "expo-router"
import { ChevronLeft, Pencil, Settings } from "lucide-react-native"
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
  getCurrentUser,
  getUser,
  useChooseClass,
  useClasses,
  useDeleteClass,
  useUploadAvatar,
  useUploadBanner,
  useUserActivity,
  useUserStats,
} from "@/lib/api"
import type { Class, UserActivityItem, UserStats } from "@/lib/api/schemas"
import { authClient } from "@/lib/auth-client"
import { useSession } from "@/lib/auth-client"
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

function useProfileUser(userId?: string) {
  const { data: session } = useSession()
  const isOwnProfile = !userId || userId === session?.user?.id

  return useQuery({
    queryKey: isOwnProfile ? ["user", "me"] : ["users", userId],
    queryFn: isOwnProfile ? getCurrentUser : () => getUser(userId!),
    enabled: isOwnProfile ? true : !!userId,
    staleTime: 0,
  })
}

interface ProfileScreenProps {
  userId?: string
}

export function ProfileScreen({ userId }: ProfileScreenProps) {
  const { data: session } = useSession()
  const isOwnProfile = !userId || userId === session?.user?.id
  const effectiveUserId = userId ?? session?.user?.id ?? ""

  const {
    data: user,
    isLoading: userLoading,
    refetch: refetchUser,
  } = useProfileUser(userId)
  const {
    data: stats,
    isLoading: statsLoading,
    refetch: refetchStats,
  } = useUserStats(effectiveUserId)
  const { data: activity } = useUserActivity(effectiveUserId)
  const { data: allClasses } = useClasses()
  const deleteClassMutation = useDeleteClass()
  const chooseClassMutation = useChooseClass()
  const [isSwitchingRole, setIsSwitchingRole] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
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
    if (!isOwnProfile) return
    router.push("/roles/create?choose=false")
  }, [isOwnProfile, router])

  const handleBrowseRoles = useCallback(() => {
    if (!isOwnProfile) return
    router.push("/roles")
  }, [isOwnProfile, router])

  const handleEditRole = useCallback(
    (classId: string) => {
      if (!isOwnProfile) return
      setSelectedRoleId(classId)
      editRoleSheetReference.current?.present()
    },
    [isOwnProfile]
  )

  const handleDeleteRole = useCallback(
    (classId: string) => {
      if (!isOwnProfile) return
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
    [deleteClassMutation, isOwnProfile, queryClient]
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
      if (!isOwnProfile || classId === user?.activeClass?.id) return
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
    [chooseClassMutation, isOwnProfile, queryClient, user?.activeClass?.id]
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
      if (!isOwnProfile) return
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
    [isOwnProfile, uploadAvatar, uploadBanner]
  )

  const handlePickFromGallery = useCallback(
    async (target: ImageTarget) => {
      if (!isOwnProfile) return
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
    [handleUploadImage, isOwnProfile]
  )

  const handleTakePhoto = useCallback(
    async (target: ImageTarget) => {
      if (!isOwnProfile) return
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
    [handleUploadImage, isOwnProfile]
  )

  const handleEditProfile = useCallback(() => {
    if (!isOwnProfile) return
    imagePickMode.current = "deferred"
    editProfileSheetReference.current?.present()
  }, [isOwnProfile])

  const handleSaveProfile = useCallback(
    async (data: {
      name: string
      username: string
      avatarUri?: string
      bannerUri?: string
    }) => {
      if (!isOwnProfile || !user) return
      setIsUpdatingProfile(true)
      try {
        const body: { name?: string; username?: string } = {}
        if (data.name !== user.name) body.name = data.name
        if (data.username !== (user.username ?? ""))
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
    [handleUploadImage, isOwnProfile, queryClient, user]
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

  const visibleTabs: { key: TabKey; label: string }[] = [
    { key: "stats", label: "Stats" },
    { key: "activity", label: "Activity" },
    { key: "collections", label: "Collections" },
  ]

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
            {visibleTabs.map((tab) => (
              <TabButton
                key={tab.key}
                label={tab.label}
                isActive={activeTab === tab.key}
                onPress={() => setActiveTab(tab.key)}
              />
            ))}
          </View>
        </View>

        {/* Tab Content */}
        <View className="px-4 py-4">
          <TabContent
            activeTab={activeTab}
            stats={stats}
            activity={activity ?? []}
            classes={allClasses?.filter((c) => c.authorId === user.id) ?? []}
            activeClass={user.activeClass}
            userId={user.id}
            isOwnProfile={isOwnProfile}
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

      {/* Back button - always visible on other users' profiles */}
      {!isOwnProfile && (
        <View
          className="absolute left-0 top-0"
          style={{ paddingTop: insets.top, zIndex: 50 }}
        >
          <View className="px-4 py-3">
            <TouchableOpacity
              onPress={() => router.back()}
              className="rounded-full bg-black/20 p-2"
              activeOpacity={0.7}
            >
              <ChevronLeft size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>
      )}

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
        <View
          className={`flex-row items-center justify-between px-4 py-3 ${
            isOwnProfile ? "" : "pl-20"
          }`}
        >
          <Text className="font-display text-display-sm text-ink dark:text-on-dark">
            {user.displayUsername ?? user.username ?? user.name}
          </Text>
          <View className="w-24" />
        </View>
      </Animated.View>

      {/* Buttons - always visible, hug content on the right */}
      {isOwnProfile && (
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
      )}

      {/* Settings Sheet */}
      {isOwnProfile && <SettingsSheet ref={settingsSheetReference} />}

      {/* Edit Role Sheet */}
      {isOwnProfile && (
        <EditRoleSheet
          ref={editRoleSheetReference}
          onSelect={handleEditRoleSelect}
        />
      )}

      {/* Edit Profile Sheet */}
      {isOwnProfile && (
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
      )}

      {/* Avatar Picker Sheet */}
      {isOwnProfile && (
        <ImagePickerSheet
          ref={avatarPickerReference}
          onTakePhoto={() => handleTakePhoto("avatar")}
          onPickFromGallery={() => handlePickFromGallery("avatar")}
        />
      )}

      {/* Banner Picker Sheet */}
      {isOwnProfile && (
        <ImagePickerSheet
          ref={bannerPickerReference}
          onTakePhoto={() => handleTakePhoto("banner")}
          onPickFromGallery={() => handlePickFromGallery("banner")}
        />
      )}

      {/* Image Viewer Modal */}
      <ImageViewerModal
        visible={viewerVisible}
        uri={viewerImage}
        onClose={closeImageViewer}
        onEdit={
          isOwnProfile
            ? () => {
                closeImageViewer()
                imagePickMode.current = "immediate"
                if (viewerTarget === "avatar") {
                  avatarPickerReference.current?.present()
                } else {
                  bannerPickerReference.current?.present()
                }
              }
            : undefined
        }
      />
    </View>
  )
}

function TabContent({
  activeTab,
  stats,
  activity,
  classes,
  activeClass,
  userId,
  isOwnProfile,
  onAddRole,
  onBrowseRoles,
  onEditRole,
  onDeleteRole,
  onSwitchRole,
  isSwitchingRole,
}: {
  activeTab: TabKey
  stats: UserStats | undefined
  activity: UserActivityItem[]
  classes: Class[]
  activeClass: Class | null
  userId: string
  isOwnProfile: boolean
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
    return <ActivityTab activity={activity} />
  }

  return (
    <CollectionsTab
      classes={classes}
      activeClass={activeClass}
      userId={userId}
      isOwnProfile={isOwnProfile}
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
