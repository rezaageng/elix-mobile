import { useCallback, useMemo, useRef, useState } from "react"
import { useForm } from "@tanstack/react-form"
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet"
import { Image } from "expo-image"
import * as ImagePicker from "expo-image-picker"
import {
  Stack,
  useLocalSearchParams,
  useRouter,
} from "expo-router"
import {
  Camera as CameraIcon,
  CheckCircle2,
  ChevronLeft,
  Image as ImageIcon,
  RefreshCw,
  Send,
  XCircle,
} from "lucide-react-native"
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { z } from "zod"

import {
  useClassQuests,
  useCurrentUser,
  useSubmitVerification,
  useUpdateQuestProgress,
} from "@/lib/api"
import type { LevelUpInfo, VerificationResult } from "@/lib/api/schemas"
import { getZodErrorMessage } from "@/lib/form-utils"
import { getMimeTypeFromFilename } from "@/lib/file-utils"
import { useHeaderOptions } from "@/lib/header-options"
import { useThemeColor } from "@/lib/use-theme-color"
import { cn } from "@/lib/utils"
import { Button } from "@/components/button"

const textSubmissionSchema = z.string().min(1, "Please enter your submission text.")
const imageSubmissionSchema = z.string().min(1, "Please take or select a photo.")

export default function VerifySubmissionScreen() {
  const { questId, classId } = useLocalSearchParams<{
    questId: string
    classId: string
  }>()
  const router = useRouter()
  const { data: user } = useCurrentUser()
  const effectiveClassId = classId ?? user?.activeClass?.id ?? ""
  const { data: quests } = useClassQuests(effectiveClassId)
  const quest = quests?.find((q) => q.id === questId)

  const submitVerification = useSubmitVerification()
  const updateProgress = useUpdateQuestProgress()

  const [verificationResult, setVerificationResult] = useState<
    VerificationResult | undefined
  >()
  const [levelUpInfo, setLevelUpInfo] = useState<LevelUpInfo | undefined>()
  const [earnedRewards, setEarnedRewards] = useState<{
    xp: number | null | undefined
    gold: number | null | undefined
  } | undefined>()

  const sheetReference = useRef<BottomSheetModal>(null)
  const mutedColor = useThemeColor("foregroundMuted")
  const surfaceCardColor = useThemeColor("surface-card")

  const baseOptions = useHeaderOptions("Verify Submission")
  const headerOptions = {
    ...baseOptions,
    headerLeft: () => (
      <TouchableOpacity onPress={() => router.back()} className="mr-2">
        <ChevronLeft size={28} color={baseOptions.headerTintColor} />
      </TouchableOpacity>
    ),
  }

  const effectiveQuest = useMemo(
    () =>
      quest
        ? {
            name: quest.overrides?.at(-1)?.name ?? quest.name,
            description:
              quest.overrides?.at(-1)?.description ?? quest.description,
            submissionType: quest.submissionType as "text" | "image",
          }
        : undefined,
    [quest]
  )

  const form = useForm({
    defaultValues: {
      textContent: "",
      capturedImage: undefined as string | undefined,
    },
    validators: {
      onSubmit: ({ value }) => {
        if (effectiveQuest?.submissionType === "text") {
          const result = textSubmissionSchema.safeParse(value.textContent)
          if (!result.success) {
            return {
              textContent:
                getZodErrorMessage(result.error) ??
                "Please enter your submission text.",
            }
          }
        } else {
          const result = imageSubmissionSchema.safeParse(value.capturedImage)
          if (!result.success) {
            return {
              capturedImage:
                getZodErrorMessage(result.error) ??
                "Please take or select a photo.",
            }
          }
        }
      },
    },
    onSubmit: async ({ value }) => {
      if (!effectiveQuest) return

      const formData = new FormData()
      formData.append("task", effectiveQuest.name)
      formData.append("description", effectiveQuest.description)
      formData.append("type", effectiveQuest.submissionType)

      if (effectiveQuest.submissionType === "text") {
        formData.append("text", value.textContent!.trim())
      } else {
        const capturedImg = value.capturedImage!
        const filename = capturedImg.split("/").pop() ?? "photo.jpg"
        const type = getMimeTypeFromFilename(filename)
        formData.append("image", {
          uri: capturedImg,
          name: filename,
          type,
        } as unknown as Blob)
      }

      try {
        const result = await submitVerification.mutateAsync(formData)
        setVerificationResult(result)

        if (result.isValid && effectiveClassId && questId) {
          const progressResult = await updateProgress.mutateAsync({
            classId: effectiveClassId,
            questId,
            body: { status: "completed" },
          })
          setEarnedRewards({
            xp: progressResult.data.xpEarned,
            gold: progressResult.data.goldEarned,
          })
          if (progressResult.levelUp) {
            setLevelUpInfo(progressResult.levelUp)
          }
        }
      } catch {
        Alert.alert(
          "Verification Failed",
          "Unable to verify your submission. Please try again."
        )
      }
    },
  })

  const openImageSourceSheet = useCallback(() => {
    sheetReference.current?.present()
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

  const handleTakePhoto = useCallback(async () => {
    sheetReference.current?.dismiss()
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
      aspect: [4, 3],
      quality: 0.8,
    })
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uri = result.assets[0]?.uri
      if (uri) {
        form.setFieldValue("capturedImage", uri)
      }
    }
  }, [form])

  const handlePickFromGallery = useCallback(async () => {
    sheetReference.current?.dismiss()
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    })
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uri = result.assets[0]?.uri
      if (uri) {
        form.setFieldValue("capturedImage", uri)
      }
    }
  }, [form])

  const handleRetake = useCallback(() => {
    form.setFieldValue("capturedImage", undefined)
    setVerificationResult(undefined)
  }, [form])

  const handleReset = useCallback(() => {
    setVerificationResult(undefined)
    setLevelUpInfo(undefined)
    form.reset()
  }, [form])

  if (!quest || !effectiveQuest) {
    return (
      <SafeAreaView
        edges={["bottom", "left", "right"]}
        className="w-full flex-1 bg-canvas px-md dark:bg-surface-dark"
      >
        <Stack.Screen options={headerOptions} />
        <View className="flex-1 items-center justify-center">
          <Text className="font-body text-body-md text-muted">
            Quest not found.
          </Text>
        </View>
      </SafeAreaView>
    )
  }

  const isSubmitting = submitVerification.isPending || updateProgress.isPending

  return (
    <SafeAreaView
      edges={["bottom", "left", "right"]}
      className="w-full flex-1 bg-canvas px-md dark:bg-surface-dark"
    >
      <Stack.Screen options={headerOptions} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="mt-4 gap-4">
            {/* Quest Info Card */}
            <View className="rounded-xl bg-surface-card p-4 dark:bg-surface-dark-elevated">
              <Text className="font-display text-title-md text-ink dark:text-on-dark">
                {effectiveQuest.name}
              </Text>
              <Text className="mt-1 font-body text-body-sm text-muted dark:text-on-dark-soft">
                {effectiveQuest.description}
              </Text>
              <View className="mt-3 flex-row items-center gap-2">
                <View className="rounded-full bg-canvas px-3 py-1 dark:bg-surface-dark">
                  <Text className="font-body-medium text-caption text-ink dark:text-on-dark">
                    {effectiveQuest.submissionType === "text"
                      ? "Text Submission"
                      : "Image Submission"}
                  </Text>
                </View>
              </View>
            </View>

            {/* Verification Result */}
            {verificationResult && (
              <View
                className={cn(
                  "rounded-xl p-4",
                  verificationResult.isValid ? "bg-success/10" : "bg-error/10"
                )}
              >
                <View className="flex-row items-center gap-2">
                  {verificationResult.isValid ? (
                    <CheckCircle2 size={20} color="#5db872" />
                  ) : (
                    <XCircle size={20} color="#c64545" />
                  )}
                  <Text
                    className={cn(
                      "font-body-semibold text-body-md",
                      verificationResult.isValid
                        ? "text-success"
                        : "text-error"
                    )}
                  >
                    {verificationResult.isValid
                      ? "Submission Approved"
                      : "Submission Rejected"}
                  </Text>
                </View>
                <Text className="mt-2 font-body text-body-sm text-body dark:text-on-dark-soft">
                  {verificationResult.reasoning}
                </Text>
                <Text className="mt-1 font-body text-body-sm text-muted dark:text-on-dark-soft">
                  {verificationResult.feedback}
                </Text>
                {verificationResult.isValid && (
                  <View className="mt-3 rounded-lg bg-success/10 p-3">
                    <Text className="font-body-semibold text-body-md text-success">
                      Rewards Earned
                    </Text>
                    <View className="mt-2 flex-row gap-6">
                      <View>
                        <Text className="font-body text-caption text-muted dark:text-on-dark-soft">
                          XP
                        </Text>
                        <Text className="font-body-semibold text-body-md text-primary">
                          +{earnedRewards?.xp ?? quest?.xpReward ?? 0}
                        </Text>
                      </View>
                      <View>
                        <Text className="font-body text-caption text-muted dark:text-on-dark-soft">
                          Gold
                        </Text>
                        <Text className="font-body-semibold text-body-md text-primary">
                          +{earnedRewards?.gold ?? quest?.goldReward ?? 0}
                        </Text>
                      </View>
                      {levelUpInfo && (
                        <View>
                          <Text className="font-body text-caption text-muted dark:text-on-dark-soft">
                            Level Up
                          </Text>
                          <Text className="font-body-semibold text-body-md text-accent-amber">
                            {levelUpInfo.from} → {levelUpInfo.to}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                )}
                {verificationResult.isValid ? (
                  <Button
                    variant="primary"
                    className="mt-3"
                    onPress={() => {
                      if (router.dismissAll) {
                        router.dismissAll()
                      }
                      router.replace("/(tabs)")
                    }}
                  >
                    <CheckCircle2 size={16} color="#ffffff" />
                    <Text className="font-body-medium text-button text-primary-foreground">
                      Back to Home
                    </Text>
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    className="mt-3"
                    onPress={handleReset}
                  >
                    <RefreshCw size={16} color="#6c6a64" />
                    <Text className="font-body-medium text-button text-ink dark:text-on-dark">
                      Try Again
                    </Text>
                  </Button>
                )}
              </View>
            )}

            {/* Input Area */}
            {verificationResult === undefined && (
              <>
                {effectiveQuest.submissionType === "text" ? (
                  <form.Field
                    name="textContent"
                    validators={{
                      onChange: ({ value }) => {
                        if (effectiveQuest?.submissionType === "text") {
                          const result = textSubmissionSchema.safeParse(value)
                          if (!result.success) {
                            return (
                              getZodErrorMessage(result.error) ??
                              "Please enter your submission text."
                            )
                          }
                        }
                      },
                    }}
                  >
                    {(field) => (
                      <View className="rounded-xl bg-surface-card p-4 dark:bg-surface-dark-elevated">
                        <Text className="font-body-semibold text-body-md text-ink dark:text-on-dark">
                          Your Submission
                        </Text>
                        <Text className="mt-1 font-body text-caption text-muted dark:text-on-dark-soft">
                          Markdown formatting is supported.
                        </Text>
                        <TextInput
                          testID="VerificationTextInput"
                          className="mt-3 rounded-md border border-hairline bg-canvas px-sm py-2 font-body text-md text-ink dark:border-hairline dark:bg-surface-dark dark:text-on-dark"
                          multiline
                          textAlignVertical="top"
                          placeholder="Describe your quest completion..."
                          placeholderTextColor="#8e8b82"
                          value={field.state.value}
                          onChangeText={field.handleChange}
                          editable={!isSubmitting}
                        />
                        {field.state.meta.errors.length > 0 && (
                          <Text className="mt-1 font-body text-body-sm text-error">
                            {field.state.meta.errors.map(String).join(", ")}
                          </Text>
                        )}
                      </View>
                    )}
                  </form.Field>
                ) : (
                  <form.Field name="capturedImage">
                    {(field) => (
                      <View className="overflow-hidden rounded-xl bg-surface-card dark:bg-surface-dark-elevated">
                        {field.state.value ? (
                          <View className="relative aspect-[4/3] w-full">
                            <Image
                              source={{ uri: field.state.value }}
                              style={{ width: "100%", height: "100%" }}
                              contentFit="cover"
                            />
                            <View className="absolute bottom-0 left-0 right-0 flex-row gap-2 bg-surface-dark/70 p-3">
                              <Button
                                variant="secondary"
                                className="flex-1"
                                onPress={handleRetake}
                              >
                                <RefreshCw size={16} color="#6c6a64" />
                                <Text className="font-body-medium text-button text-ink dark:text-on-dark">
                                  Retake
                                </Text>
                              </Button>
                            </View>
                          </View>
                        ) : (
                          <TouchableOpacity
                            onPress={openImageSourceSheet}
                            activeOpacity={0.7}
                            className="aspect-[4/3] w-full items-center justify-center bg-surface-soft p-6 dark:bg-surface-dark-soft"
                          >
                            <View className="rounded-full bg-canvas p-4 dark:bg-surface-dark">
                              <CameraIcon size={32} color={mutedColor} />
                            </View>
                            <Text className="mt-3 text-center font-body text-body-md text-muted dark:text-on-dark-soft">
                              Tap to add image proof
                            </Text>
                            <Text className="mt-1 text-center font-body text-caption text-muted-soft">
                              Take a photo or choose from gallery
                            </Text>
                          </TouchableOpacity>
                        )}
                        {field.state.meta.errors.length > 0 && (
                          <Text className="px-3 pb-2 font-body text-body-sm text-error">
                            {field.state.meta.errors.map(String).join(", ")}
                          </Text>
                        )}
                      </View>
                    )}
                  </form.Field>
                )}

                {/* Submit Button */}
                <Button
                  testID="VerificationSubmitButton"
                  onPress={form.handleSubmit}
                  disabled={isSubmitting}
                  className="mt-2"
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Send size={16} color="#ffffff" />
                  )}
                  <Text className="font-body-medium text-button text-primary-foreground">
                    {isSubmitting ? "Verifying..." : "Verify Submission"}
                  </Text>
                </Button>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Image Source Bottom Sheet */}
      <BottomSheetModal
        ref={sheetReference}
        snapPoints={["28%"]}
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
          <Text className="text-body-lg mb-md font-body-semibold text-ink dark:text-on-dark">
            Add Image
          </Text>

          <TouchableOpacity
            onPress={handleTakePhoto}
            className="flex-row items-center gap-sm rounded-md py-md active:bg-surface-soft dark:active:bg-surface-dark-soft"
          >
            <CameraIcon size={20} color={mutedColor} />
            <Text className="font-body-medium text-body-md text-ink dark:text-on-dark">
              Take Photo
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handlePickFromGallery}
            className="flex-row items-center gap-sm rounded-md py-md active:bg-surface-soft dark:active:bg-surface-dark-soft"
          >
            <ImageIcon size={20} color={mutedColor} />
            <Text className="font-body-medium text-body-md text-ink dark:text-on-dark">
              Choose from Gallery
            </Text>
          </TouchableOpacity>
        </BottomSheetView>
      </BottomSheetModal>
    </SafeAreaView>
  )
}
