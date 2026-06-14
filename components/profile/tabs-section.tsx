import { useCallback, useRef, useState } from "react"
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet"
import {
  ChevronRight,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react-native"
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View,
} from "react-native"

import type { Class, ClassQuest } from "@/lib/api/schemas"
import { useThemeColor } from "@/lib/use-theme-color"

function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "Recently"
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function formatTime(dateString: string | null | undefined): string {
  if (!dateString) return ""
  const date = new Date(dateString)
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

function getQuestStatus(quest: ClassQuest): string {
  return quest.progress?.[0]?.status ?? "not_started"
}

export function ActivityTab({
  quests,
  showQuestNames,
  hideActivity,
}: {
  quests: ClassQuest[]
  showQuestNames: boolean
  hideActivity: boolean
}) {
  if (hideActivity) {
    return (
      <View className="items-center py-12">
        <Text className="font-body text-body-sm text-muted">Activity hidden</Text>
      </View>
    )
  }

  const completed = quests
    .filter((q) => getQuestStatus(q) === "completed")
    .slice(0, 15)

  if (completed.length === 0) {
    return (
      <View className="items-center py-12">
        <Text className="font-body text-body-sm text-muted">No completed quests yet</Text>
      </View>
    )
  }

  return (
    <View className="gap-0">
      {completed.map((quest, index) => {
        const progress = quest.progress?.[0]
        const completedAt = progress?.completedAt
        const isLast = index === completed.length - 1

        return (
          <View key={quest.id} className="flex-row">
            {/* Timeline line */}
            <View className="items-center px-2">
              <View className="h-3 w-3 rounded-full bg-primary" />
              {!isLast && (
                <View className="w-px flex-1 bg-hairline" />
              )}
            </View>

            {/* Content */}
            <View className={`flex-1 pb-6 ${isLast ? "" : "border-b border-hairline"}`}>
              <View className="gap-1">
                <Text className="font-body-medium text-body-sm text-ink dark:text-on-dark">
                  {showQuestNames ? quest.name : "Quest completed"}
                </Text>
                <View className="flex-row gap-2">
                  <Text className="font-body text-caption text-muted">
                    {formatDate(completedAt)}
                  </Text>
                  <Text className="font-body text-caption text-muted">
                    {formatTime(completedAt)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )
      })}
    </View>
  )
}

export function CollectionsTab({
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
  const createdRoles = classes.filter((c) => c.authorId === userId)
  const primaryColor = useThemeColor("primary")
  const primaryForegroundColor = useThemeColor("primary-foreground")
  const mutedColor = useThemeColor("muted")
  const errorColor = useThemeColor("error")
  const surfaceCardColor = useThemeColor("surface-card")

  const [selectedRole, setSelectedRole] = useState<Class>()
  const sheetReference = useRef<BottomSheetModal>(null)

  const openRoleSheet = (role: Class) => {
    setSelectedRole(role)
    sheetReference.current?.present()
  }

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

  const addRoleCard = (
    <TouchableOpacity
      onPress={onAddRole}
      className="flex-row items-center gap-2 rounded-lg border border-dashed border-hairline bg-surface-card p-4 dark:bg-surface-dark"
      activeOpacity={0.7}
    >
      <Plus size={20} color={primaryColor} />
      <Text className="font-body-medium text-body-sm text-primary">
        Add new role
      </Text>
    </TouchableOpacity>
  )

  const browseRolesCard = (
    <TouchableOpacity
      onPress={onBrowseRoles}
      className="flex-row items-center justify-between rounded-lg border border-hairline bg-surface-card p-4 dark:bg-surface-dark"
      activeOpacity={0.7}
    >
      <Text className="font-body-medium text-body-sm text-ink dark:text-on-dark">
        Browse all roles
      </Text>
      <ChevronRight size={18} color={mutedColor} />
    </TouchableOpacity>
  )

  if (createdRoles.length === 0) {
    return (
      <View className="items-center py-12 gap-3">
        <Text className="font-body text-body-sm text-muted">
          No roles created
        </Text>
        {addRoleCard}
        {browseRolesCard}
      </View>
    )
  }

  return (
    <View className="gap-3">
      {addRoleCard}
      {browseRolesCard}

      {/* Created roles */}
      {createdRoles.map((cls) => {
        const isActive = activeClass?.id === cls.id
        return (
          <TouchableOpacity
            key={cls.id}
            onPress={() => openRoleSheet(cls)}
            activeOpacity={0.8}
            className={`gap-2 rounded-lg p-4 ${
              isActive
                ? "border border-primary bg-primary/5 dark:bg-primary/10"
                : "bg-surface-card dark:bg-surface-dark"
            }`}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2 flex-1">
                <Text
                  className={`font-body-medium text-body-sm ${
                    isActive ? "text-primary" : "text-ink dark:text-on-dark"
                  }`}
                >
                  {cls.name}
                </Text>
                {isActive && (
                  <View className="rounded-full bg-primary px-2 py-0.5">
                    <Text className="font-body-bold text-caption text-on-primary">
                      Active
                    </Text>
                  </View>
                )}
              </View>
              <View className="flex-row items-center gap-2">
                <TouchableOpacity
                  onPress={() => onEditRole(cls.id)}
                  className="rounded-full p-1.5"
                  activeOpacity={0.7}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Pencil size={16} color={mutedColor} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => onDeleteRole(cls.id)}
                  className="rounded-full p-1.5"
                  activeOpacity={0.7}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Trash2 size={16} color={errorColor} />
                </TouchableOpacity>
              </View>
            </View>
            <Text className="font-body text-caption text-muted">
              {cls.description}
            </Text>
          </TouchableOpacity>
        )
      })}

      <BottomSheetModal
        ref={sheetReference}
        index={0}
        snapPoints={["45%"]}
        onChange={() => {}}
        backdropComponent={renderBackdrop}
        enablePanDownToClose
        handleIndicatorStyle={{
          backgroundColor: mutedColor,
          width: 40,
          height: 4,
          borderRadius: 2,
        }}
        backgroundStyle={{
          backgroundColor: surfaceCardColor,
        }}
      >
        <BottomSheetView
          className="flex-1 px-xl pb-xl pt-lg"
          style={{ backgroundColor: surfaceCardColor }}
        >
          <Text className="mb-lg font-body-medium text-title-lg text-ink dark:text-on-dark">
            {selectedRole?.name}
          </Text>

          <View className="flex-1">
            <Text className="font-body text-body-md text-body dark:text-on-dark-soft">
              {selectedRole?.description}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => selectedRole && onSwitchRole(selectedRole.id)}
            disabled={isSwitchingRole}
            className={`mt-lg items-center rounded-md bg-primary py-3 active:bg-primary-active ${
              isSwitchingRole ? "opacity-50" : ""
            }`}
            activeOpacity={0.8}
          >
            {isSwitchingRole ? (
              <ActivityIndicator size="small" color={primaryForegroundColor} />
            ) : (
              <Text className="font-body-medium text-button text-primary-foreground">
                {activeClass?.id === selectedRole?.id
                  ? "Active Role"
                  : "Switch to this role"}
              </Text>
            )}
          </TouchableOpacity>
        </BottomSheetView>
      </BottomSheetModal>
    </View>
  )
}
