import { useForm } from "@tanstack/react-form"
import { useRouter } from "expo-router"
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Text,
  TextInput,
  View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { z } from "zod"

import { useChooseClass, useCreateClass } from "@/lib/api"
import { Button } from "@/components/button"
import Header from "@/components/header"

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
  const createClassMutation = useCreateClass()
  const chooseClassMutation = useChooseClass()

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
      const newClass = await createClassMutation.mutateAsync(value)
      await chooseClassMutation.mutateAsync(newClass.id)
      router.replace(`/roles/quests/create-main?classId=${newClass.id}`)
    },
  })

  const isPending =
    createClassMutation.isPending || chooseClassMutation.isPending

  return (
    <SafeAreaView className="w-full flex-1 bg-canvas dark:bg-surface-dark">
      <Header title="Create Role" />
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
                  className="rounded-md border border-hairline bg-canvas px-sm py-xs font-body text-body-md leading-tight text-ink dark:border-hairline dark:bg-surface-dark dark:text-on-dark"
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
                  className="h-24 rounded-md border border-hairline bg-canvas p-sm font-body text-body-md leading-tight text-ink dark:border-hairline dark:bg-surface-dark dark:text-on-dark"
                  value={field.state.value}
                  onChangeText={field.handleChange}
                  onBlur={field.handleBlur}
                  placeholder="Describe the role"
                  placeholderTextColor="#8e8b82"
                  placeholderClassName="text-body-md"
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

          {createClassMutation.error && (
            <Text className="font-body text-body-sm text-error">
              {createClassMutation.error.message}
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
                    Create Role
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
