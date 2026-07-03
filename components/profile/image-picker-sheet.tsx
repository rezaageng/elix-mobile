import React, { forwardRef, useCallback } from "react"
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet"
import { Camera as CameraIcon, Image as ImageIcon } from "lucide-react-native"
import { Text, TouchableOpacity, useColorScheme, View } from "react-native"

export interface ImagePickerSheetReference {
  present: () => void
  dismiss: () => void
}

interface ImagePickerSheetProps {
  onTakePhoto: () => void
  onPickFromGallery: () => void
}

export const ImagePickerSheet = forwardRef<ImagePickerSheetReference, ImagePickerSheetProps>(
  function ImagePickerSheet({ onTakePhoto, onPickFromGallery }, reference) {
    const sheetReference = React.useRef<BottomSheetModal>(null)
    const colorScheme = useColorScheme()
    const isDark = colorScheme === "dark"

    React.useImperativeHandle(reference, () => ({
      present: () => sheetReference.current?.present(),
      dismiss: () => sheetReference.current?.dismiss(),
    }))

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          pressBehavior="close"
        />
      ),
      []
    )

    const handleTakePhoto = useCallback(() => {
      onTakePhoto()
    }, [onTakePhoto])

    const handlePickFromGallery = useCallback(() => {
      onPickFromGallery()
    }, [onPickFromGallery])

    return (
      <BottomSheetModal
        ref={sheetReference}
        index={0}
        snapPoints={["28%"]}
        backdropComponent={renderBackdrop}
        enablePanDownToClose
        stackBehavior="push"
        backgroundStyle={{
          backgroundColor: isDark ? "#181715" : "#faf9f5",
        }}
        handleIndicatorStyle={{
          backgroundColor: isDark ? "#a09d96" : "#8e8b82",
        }}
      >
        <BottomSheetView className="flex-1 px-4 pb-6">
          <View className="mb-4 items-center">
            <Text className="font-display text-display-xs text-ink dark:text-on-dark">
              Change Image
            </Text>
          </View>

          <View className="gap-2">
            <TouchableOpacity
              onPress={handleTakePhoto}
              className="flex-row items-center gap-3 rounded-lg bg-surface-card p-4 dark:bg-surface-dark"
            >
              <CameraIcon size={20} color={isDark ? "#faf9f5" : "#181715"} />
              <Text className="font-body-medium text-body-sm text-ink dark:text-on-dark">
                Take Photo
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handlePickFromGallery}
              className="flex-row items-center gap-3 rounded-lg bg-surface-card p-4 dark:bg-surface-dark"
            >
              <ImageIcon size={20} color={isDark ? "#faf9f5" : "#181715"} />
              <Text className="font-body-medium text-body-sm text-ink dark:text-on-dark">
                Choose from Gallery
              </Text>
            </TouchableOpacity>
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    )
  }
)
