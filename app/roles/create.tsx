import { useEffect } from "react"
import { useForm } from "@tanstack/react-form"
import { Stack, useLocalSearchParams, useRouter } from "expo-router"
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Text,
  TextInput,
  View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { z } from "zod"

import {
  useChooseClass,
  useClass,
  useCreateClass,
  useUpdateClass,
} from "@/lib/api"
import { useHeaderOptions } from "@/lib/header-options"
import { useThemeColor } from "@/lib/use-theme-color"
import { Button } from "@/components/button"

const roleSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
})

const nameSchema = z.string().min(1, "Name is required")
const descriptionSchema = z.string().min(1, "Description is required")

function getZodErrorMessage(error: unknown): string | undefined {
  if (!error) return
  if (Array.isArray(error)) {
    return (error[0] as { message?: string })?.message
  }
  const zodError = error as {
    issues?: { message: string }[]
  }
  return zodError.issues?.[0]?.message
}

export default function CreateRoleScreen() {
  const router = useRouter()
  const { classId, choose } = useLocalSearchParams<{
    classId?: string
    choose?: string
  }>()
  const isEditing = !!classId
  const shouldChooseClass = choose !== "false"

  const createClassMutation = useCreateClass()
  const chooseClassMutation = useChooseClass()
  const updateClassMutation = useUpdateClass()
  const { data: existingClass, isLoading: classLoading } = useClass(
    classId ?? ""
  )
  const primaryColor = useThemeColor("primary")
  const headerOptions = useHeaderOptions(isEditing ? "Edit Role" : "Create Role")

  const form = useForm({
    defaultValues: { name: "", description: "" },
    validators: {
      onSubmit: ({ value }) => {
        const result = roleSchema.safeParse(value)
        if (!result.success) {
          const errors: Record<string, string> = {}
          const issues = (
            result as {
              error?: {
                issues?: { message: string; path: (string | number)[] }[]
              }
            }
          ).error?.issues
          if (issues) {
            for (const issue of issues) {
              const field = String(issue.path[0] ?? "")
              if (field && !errors[field]) {
                errors[field] = issue.message
              }
            }
          }
          if (Object.keys(errors).length > 0) return errors
          return "Please fix the form errors"
        }
      },
    },
    onSubmit: async ({ value }) => {
      if (isEditing) {
        await updateClassMutation.mutateAsync({
          classId: classId!,
          body: value,
        })
        router.back()
      } else if (shouldChooseClass) {
        const newClass = await createClassMutation.mutateAsync(value)
        await chooseClassMutation.mutateAsync(newClass.id)
        router.replace(`/roles/quests/create-main?classId=${newClass.id}`)
      } else {
        const newClass = await createClassMutation.mutateAsync(value)
        router.replace(`/roles/quests/create-main?classId=${newClass.id}&returnTo=profile`)
      }
    },
  })

  useEffect(() => {
    if (existingClass) {
      form.setFieldValue("name", existingClass.name)
      form.setFieldValue("description", existingClass.description)
    }
  }, [existingClass, form])

  const isPending =
    createClassMutation.isPending ||
    chooseClassMutation.isPending ||
    updateClassMutation.isPending ||
    classLoading

  if (classLoading) {
    return (
      <SafeAreaView
        edges={["bottom", "left", "right"]}
        className="w-full flex-1 items-center justify-center bg-canvas dark:bg-surface-dark"
      >
        <ActivityIndicator size="large" color={primaryColor} />
      </SafeAreaView>
    )
  }

  const mutationError =
    createClassMutation.error ?? updateClassMutation.error

  return (
    <SafeAreaView
      edges={["bottom", "left", "right"]}
      className="w-full flex-1 bg-canvas dark:bg-surface-dark"
    >
      <Stack.Screen
        options={{
          ...headerOptions,
          gestureEnabled: false,
        }}
      />
      <KeyboardAvoidingView className="flex-1" behavior="padding">
        <View className="mt-lg gap-lg px-md">
          <form.Field
            name="name"
            validators={{
              onChange: ({ value }) => {
                const result = nameSchema.safeParse(value)
                if (!result.success) {
                  return getZodErrorMessage(result.error) ?? "Invalid name"
                }
              },
            }}
          >
            {(field) => (
              <View className="gap-xs">
                <Text className="font-body-medium text-title-sm text-ink dark:text-on-dark">
                  Name
                </Text>
                <TextInput
                  className="rounded-md border border-hairline bg-canvas px-sm py-1.5 font-body text-md text-ink dark:border-hairline dark:bg-surface-dark dark:text-on-dark"
                  value={field.state.value}
                  onChangeText={field.handleChange}
                  onBlur={field.handleBlur}
                  placeholder="Enter role name"
                  placeholderTextColor="#8e8b82"
                  autoCapitalize="words"
                  textAlignVertical="center"
                />
                {field.state.meta.errors.length > 0 && (
                  <Text className="font-body text-body-sm text-error">
                    {field.state.meta.errors.map(String).join(", ")}
                  </Text>
                )}
              </View>
            )}
          </form.Field>

          <form.Field
            name="description"
            validators={{
              onChange: ({ value }) => {
                const result = descriptionSchema.safeParse(value)
                if (!result.success) {
                  return (
                    getZodErrorMessage(result.error) ?? "Invalid description"
                  )
                }
              },
            }}
          >
            {(field) => (
              <View className="gap-xs">
                <Text className="font-body-medium text-title-sm text-ink dark:text-on-dark">
                  Description
                </Text>
                <TextInput
                  className="rounded-md border border-hairline bg-canvas px-sm py-2 font-body text-md text-ink dark:border-hairline dark:bg-surface-dark dark:text-on-dark"
                  value={field.state.value}
                  onChangeText={field.handleChange}
                  onBlur={field.handleBlur}
                  placeholder="Describe the role"
                  placeholderTextColor="#8e8b82"
                  placeholderClassName="text-md"
                  multiline
                  textAlignVertical="top"
                />
                {field.state.meta.errors.length > 0 && (
                  <Text className="font-body text-body-sm text-error">
                    {field.state.meta.errors.map(String).join(", ")}
                  </Text>
                )}
              </View>
            )}
          </form.Field>

          {mutationError && (
            <Text className="font-body text-body-sm text-error">
              {mutationError.message}
            </Text>
          )}

          <form.Subscribe selector={(state) => state.isSubmitting}>
            {() => (
              <Button
                onPress={form.handleSubmit}
                disabled={isPending}
                className="mt-lg"
              >
                {isPending ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text className="font-body-medium text-button text-primary-foreground">
                    {isEditing ? "Save Changes" : "Create Role"}
                  </Text>
                )}
              </Button>
            )}
          </form.Subscribe>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
