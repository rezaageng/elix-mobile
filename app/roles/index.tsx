import { useCallback, useRef, useState } from "react"
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet"
import { Stack, useRouter } from "expo-router"
import { Plus } from "lucide-react-native"
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { useChooseClass, useClasses } from "@/lib/api"
import type { Class } from "@/lib/api/schemas"
import { useSession } from "@/lib/auth-client"
import { useHeaderOptions } from "@/lib/header-options"
import { useThemeColor } from "@/lib/use-theme-color"
import { Button } from "@/components/button"

export default function RolesScreen() {
  const { data: classes, isPending, refetch } = useClasses()
  const chooseClassMutation = useChooseClass()
  const { data: session, refetch: refetchSession } = useSession()
  const router = useRouter()
  const [refreshing, setRefreshing] = useState(false)
  const [selectingId, setSelectingId] = useState<string>()
  const [selectedRole, setSelectedRole] = useState<Class>()

  const mutedColor = useThemeColor("foregroundMuted")
  const surfaceCardColor = useThemeColor("surface-card")
  const sheetReference = useRef<BottomSheetModal>(null)

  const onRefresh = async () => {
    setRefreshing(true)
    await refetch()
    setRefreshing(false)
  }

  const handleSelect = async (classId: string) => {
    setSelectingId(classId)
    try {
      await chooseClassMutation.mutateAsync(classId)
      await refetchSession()
      router.replace(`/roles/quests/create-recurring?classId=${classId}`)
    } catch {
      setSelectingId(undefined)
    }
  }

  const openRoleSheet = (role: Class) => {
    setSelectedRole(role)
    sheetReference.current?.present()
  }

  const handleSheetChanges = useCallback(() => {
    // Sheet state changed
  }, [])

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

  const renderRoleCard = (role: Class) => (
    <TouchableOpacity
      key={role.id}
      onPress={() => openRoleSheet(role)}
      activeOpacity={0.8}
      className="mb-md w-[48%] rounded-lg bg-surface-card p-md dark:bg-surface-dark-elevated"
      testID={`ClassCard:${role.name}`}
    >
      <View className="items-center justify-center">
        <Text
          className="text-center font-body-medium text-title-sm text-ink dark:text-on-dark"
          numberOfLines={4}
        >
          {role.name}
        </Text>
      </View>
    </TouchableOpacity>
  )

  const renderCreateCard = () => (
    <TouchableOpacity
      onPress={() => router.push("/roles/create")}
      activeOpacity={0.8}
      className="mb-md w-[48%] justify-center rounded-lg border border-dashed border-hairline bg-canvas p-md dark:border-hairline dark:bg-surface-dark"
      testID="CreateCustomRole"
    >
      <View className="flex-row items-center justify-center gap-2">
        <Plus size={20} color={mutedColor} strokeWidth={1.5} />
        <Text className="text-center font-body-medium text-body-sm text-muted dark:text-on-dark-soft">
          Custom Role
        </Text>
      </View>
    </TouchableOpacity>
  )

  return (
    <SafeAreaView
      edges={["bottom", "left", "right"]}
      className="w-full flex-1 bg-canvas dark:bg-surface-dark"
    >
      <Stack.Screen
        options={{
          ...useHeaderOptions("Choose Your Role"),
          headerLeft: session?.user.activeClassId
            ? undefined
            : // eslint-disable-next-line unicorn/no-null
              () => null,
        }}
      />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 16,
          paddingTop: 24,
          paddingBottom: 48,
        }}
        refreshControl={
          <RefreshControl
            refreshing={isPending || refreshing}
            onRefresh={onRefresh}
          />
        }
      >
        {isPending ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#cc785c" />
          </View>
        ) : (
          <View className="flex-row flex-wrap justify-between">
            {renderCreateCard()}
            {classes?.map((role) => renderRoleCard(role))}
            {(!classes || classes.length === 0) && (
              <View className="w-full items-center justify-center py-xl">
                <Text className="font-body text-body-md text-muted dark:text-on-dark-soft">
                  No roles available yet.
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Role Detail Bottom Sheet */}
      <BottomSheetModal
        ref={sheetReference}
        index={0}
        snapPoints={["45%"]}
        onChange={handleSheetChanges}
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
          {/* Sheet Header */}
          <Text className="mb-lg font-body-medium text-title-lg text-ink dark:text-on-dark">
            {selectedRole?.name}
          </Text>

          {/* Sheet Body */}
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            <Text className="font-body text-body-md text-body dark:text-on-dark-soft">
              {selectedRole?.description}
            </Text>
          </ScrollView>

          {/* Sheet Actions */}
          <Button
            className="mt-lg"
            onPress={() => selectedRole && handleSelect(selectedRole.id)}
            disabled={chooseClassMutation.isPending}
            testID="SelectClass"
          >
            {selectedRole &&
            selectingId === selectedRole.id &&
            chooseClassMutation.isPending ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text className="font-body-medium text-button text-primary-foreground">
                Select
              </Text>
            )}
          </Button>
        </BottomSheetView>
      </BottomSheetModal>
    </SafeAreaView>
  )
}
