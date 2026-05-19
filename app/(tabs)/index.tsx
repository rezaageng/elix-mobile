import { useState } from "react"
import { RefreshControl, ScrollView, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { useCurrentUser } from "@/lib/api"
import { Button } from "@/components/button"
import Header from "@/components/header"

export default function Index() {
  const { data, isPending, refetch } = useCurrentUser()
  const [refreshing, setRefreshing] = useState(false)

  const onRefresh = async () => {
    setRefreshing(true)
    await refetch()
    setRefreshing(false)
  }

  return (
    <SafeAreaView className="w-full flex-1 bg-white px-4 dark:bg-black">
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
          <Text>ok</Text>
        ) : (
          <View className="flex-1 items-center justify-center">
            <Text className="text-black dark:text-white">
              You haven't chosen a role yet.
            </Text>
            <Button>
              <Text className="text-primary-foreground">Choose a Role</Text>
            </Button>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}
