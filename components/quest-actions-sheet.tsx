import { forwardRef, useCallback, useImperativeHandle, useRef, useState } from "react"
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet"
import { Pencil, Trash2 } from "lucide-react-native"
import { Text, TouchableOpacity } from "react-native"

import { useThemeColor } from "@/lib/use-theme-color"

export interface QuestActionsSheetReference {
  open: (questId: string, questType: string, questName: string) => void
  close: () => void
}

interface QuestActionsSheetProps {
  onEdit: (questId: string, questType: string) => void
  onDelete: (questId: string) => void
}

export const QuestActionsSheet = forwardRef<
  QuestActionsSheetReference,
  QuestActionsSheetProps
>(function QuestActionsSheet({ onEdit, onDelete }, reference) {
  const sheetReference = useRef<BottomSheetModal>(null)
  const [questId, setQuestId] = useState<string>("")
  const [questType, setQuestType] = useState<string>("")
  const [questName, setQuestName] = useState<string>("")

  const mutedColor = useThemeColor("foregroundMuted")
  const errorColor = useThemeColor("error")
  const surfaceCardColor = useThemeColor("surface-card")

  useImperativeHandle(reference, () => ({
    open: (id: string, type: string, name: string) => {
      setQuestId(id)
      setQuestType(type)
      setQuestName(name)
      sheetReference.current?.present()
    },
    close: () => {
      sheetReference.current?.dismiss()
    },
  }))

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

  const handleEdit = () => {
    sheetReference.current?.dismiss()
    onEdit(questId, questType)
  }

  const handleDelete = () => {
    sheetReference.current?.dismiss()
    onDelete(questId)
  }

  return (
    <BottomSheetModal
      ref={sheetReference}
      snapPoints={["25%"]}
      index={0}
      backdropComponent={renderBackdrop}
      enablePanDownToClose
      backgroundStyle={{ backgroundColor: surfaceCardColor }}
      handleIndicatorStyle={{
        backgroundColor: mutedColor,
        width: 40,
        height: 4,
        borderRadius: 2,
      }}
    >
      <BottomSheetView
        className="flex-1 px-lg pb-xl"
        style={{ backgroundColor: surfaceCardColor }}
      >
        <Text className="mb-md font-body-semibold text-body-lg text-ink dark:text-on-dark">
          {questName}
        </Text>

        <TouchableOpacity
          onPress={handleEdit}
          className="flex-row items-center gap-sm rounded-md py-md active:bg-surface-soft dark:active:bg-surface-dark-soft"
        >
          <Pencil size={20} color={mutedColor} />
          <Text className="font-body-medium text-body-md text-ink dark:text-on-dark">
            Edit Quest
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleDelete}
          className="flex-row items-center gap-sm rounded-md py-md active:bg-surface-soft dark:active:bg-surface-dark-soft"
        >
          <Trash2 size={20} color={errorColor} />
          <Text className="font-body-medium text-body-md text-error">
            Delete Quest
          </Text>
        </TouchableOpacity>
      </BottomSheetView>
    </BottomSheetModal>
  )
})
