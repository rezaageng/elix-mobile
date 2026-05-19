import { useState } from "react"
import { RefreshControl, ScrollView, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { useCurrentUser } from "@/lib/api"
import { Button } from "@/components/button"
import Header from "@/components/header"

export default function QuestScreen() {
  const { data, isPending, refetch } = useCurrentUser()
  const [refreshing, setRefreshing] = useState(false)

  const onRefresh = async () => {
    setRefreshing(true)
    await refetch()
    setRefreshing(false)
  }

  return (
    <SafeAreaView className="w-full flex-1 bg-canvas px-md dark:bg-surface-dark">
      <Header title="Elix" canGoBack={false} />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={isPending || refreshing}
            onRefresh={onRefresh}
          />
        }
      >
        {data?.activeClass ? (
          <Text className="font-body text-body-md text-ink dark:text-on-dark">
            ok
          </Text>
        ) : (
          <View className="flex-1 items-center justify-center gap-md">
            <Text className="font-body text-body-md text-muted dark:text-on-dark-soft">
              You haven't chosen a role yet.
            </Text>
            <Button>
              <Text className="font-body-medium text-button text-primary-foreground">
                Choose a Role
              </Text>
            </Button>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}
