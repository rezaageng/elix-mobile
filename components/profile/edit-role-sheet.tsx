import { forwardRef, useCallback, useMemo } from "react"
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet"
import { ChevronRight } from "lucide-react-native"
import { Text, TouchableOpacity, View } from "react-native"

import { useThemeColor } from "@/lib/use-theme-color"

export type EditRoleSheetReference = BottomSheetModal

type Option = {
  id: "details" | "main" | "side" | "recurring"
  label: string
  description: string
}

const options: Option[] = [
  {
    id: "details",
    label: "Role Details",
    description: "Edit name and description",
  },
  {
    id: "main",
    label: "Main Quests",
    description: "Edit main quest chain",
  },
  {
    id: "side",
    label: "Side Quests",
    description: "Edit side quests and prerequisites",
  },
  {
    id: "recurring",
    label: "Daily & Weekly",
    description: "Edit daily, weekly, and event quests",
  },
]

type EditRoleSheetProps = {
  onSelect: (optionId: Option["id"]) => void
}

export const EditRoleSheet = forwardRef<EditRoleSheetReference, EditRoleSheetProps>(
  function EditRoleSheet({ onSelect }, reference) {
    const mutedColor = useThemeColor("muted")
    const surfaceCardColor = useThemeColor("surface-card")

    const snapPoints = useMemo(() => ["45%"], [])

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

    const handleSelect = (optionId: Option["id"]) => {
      ;(reference as React.MutableRefObject<EditRoleSheetReference | null>).current?.dismiss()
      onSelect(optionId)
    }

    return (
      <BottomSheetModal
        ref={reference}
        index={0}
        snapPoints={snapPoints}
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
          className="flex-1 gap-sm px-xl pb-xl pt-lg"
          style={{ backgroundColor: surfaceCardColor }}
        >
          <Text className="mb-md font-body-medium text-title-sm text-ink dark:text-on-dark">
            Edit Role
          </Text>
          {options.map((option) => (
            <TouchableOpacity
              key={option.id}
              onPress={() => handleSelect(option.id)}
              activeOpacity={0.7}
              className="flex-row items-center justify-between rounded-lg bg-canvas p-md dark:bg-surface-dark"
            >
              <View className="gap-xs">
                <Text className="font-body-medium text-body-md text-ink dark:text-on-dark">
                  {option.label}
                </Text>
                <Text className="font-body text-body-sm text-muted dark:text-on-dark-soft">
                  {option.description}
                </Text>
              </View>
              <ChevronRight size={20} color={mutedColor} />
            </TouchableOpacity>
          ))}
        </BottomSheetView>
      </BottomSheetModal>
    )
  }
)
