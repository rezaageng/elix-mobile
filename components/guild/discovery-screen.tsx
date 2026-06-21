import { Plus, SearchX, Users } from "lucide-react-native"
import { useCallback, useRef, useState } from "react"
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { Button } from "@/components/button"
import { CreateGuildSheet } from "@/components/guild/create-guild-sheet"
import GuildCard from "@/components/guild/guild-card"
import { GuildDetailSheet } from "@/components/guild/guild-detail-sheet"
import SearchBar from "@/components/guild/search-bar"
import { useGuilds, useMyGuilds } from "@/lib/api/guilds"
import type { Guild } from "@/lib/api/schemas"
import { useThemeColor } from "@/lib/use-theme-color"

interface DiscoveryScreenProps {
  onGuildJoined: () => void
}

export default function DiscoveryScreen({ onGuildJoined }: DiscoveryScreenProps) {
  const insets = useSafeAreaInsets()
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [selectedGuild, setSelectedGuild] = useState<Guild>()
  const mutedSoftColor = useThemeColor("muted-soft")

  const createSheetReference = useRef<any>(null)
  const detailSheetReference = useRef<any>(null)

  const { isLoading: loadingMyGuilds, refetch: refetchMyGuilds } = useMyGuilds()
  const {
    data: guilds,
    isLoading: searching,
    refetch: refetchGuilds,
  } = useGuilds(debouncedQuery ? { q: debouncedQuery } : undefined)

  // Debounce search
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const handleSearchChange = useCallback((text: string) => {
    setSearchQuery(text)
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => {
      setDebouncedQuery(text)
    }, 300)
  }, [])

  const handleGuildPress = (guild: Guild) => {
    setSelectedGuild(guild)
    setTimeout(() => detailSheetReference.current?.present(), 100)
  }

  const handleJoined = () => {
    onGuildJoined()
  }

  const handleCreateGuild = () => {
    createSheetReference.current?.present()
  }

  const onRefresh = useCallback(() => {
    refetchMyGuilds()
    refetchGuilds()
  }, [refetchMyGuilds, refetchGuilds])

  const showNoResults = searchQuery && !searching && guilds?.length === 0
  const showEmptyState = !searchQuery && !searching && (!guilds || guilds.length === 0)

  return (
    <View className="flex-1 bg-canvas dark:bg-surface-dark">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8, gap: 24, paddingBottom: insets.bottom + 64 }}
        refreshControl={
          <RefreshControl refreshing={loadingMyGuilds} onRefresh={onRefresh} />
        }
        keyboardShouldPersistTaps="handled"
      >
        <SearchBar value={searchQuery} onChangeText={handleSearchChange} />

        {searching && (
          <View className="items-center justify-center py-12">
            <ActivityIndicator size="small" color="#cc785c" />
          </View>
        )}

        {showNoResults && (
          <View className="items-center justify-center py-12">
            <SearchX size={32} color={mutedSoftColor} />
            <Text className="mt-sm font-body text-body-sm text-muted">
              No guilds found
            </Text>
            <Text className="font-body text-caption text-muted-soft">
              Try a different search term
            </Text>
          </View>
        )}

        {showEmptyState && (
          <View className="items-center justify-center py-12">
            <Users size={32} color={mutedSoftColor} />
            <Text className="mt-sm font-body text-body-sm text-muted">
              No guilds yet
            </Text>
            <Text className="font-body text-caption text-muted-soft">
              Be the first to create one
            </Text>
          </View>
        )}

        {!searching && guilds && guilds.length > 0 && (
          <View className="gap-sm">
            {guilds.map((guild) => (
              <GuildCard key={guild.id} guild={guild} onPress={handleGuildPress} />
            ))}
          </View>
        )}

        <View className="mt-lg">
          <Button
            variant="primary"
            title="Create a Guild"
            onPress={handleCreateGuild}
          >
            <Plus size={18} color="#ffffff" />
            <Text className="font-body-medium text-button text-primary-foreground">
              Create a Guild
            </Text>
          </Button>
        </View>
      </ScrollView>

      <CreateGuildSheet ref={createSheetReference} onCreated={handleJoined} />

      {selectedGuild && (
        <GuildDetailSheet ref={detailSheetReference} guild={selectedGuild} onJoined={handleJoined} />
      )}
    </View>
  )
}
