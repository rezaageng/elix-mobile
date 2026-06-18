import { useEffect } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { io } from "socket.io-client"
import { z } from "zod"

import { apiFetch, BASE_URL } from "@/lib/api/client"
import type {
  ApproveMemberBody,
  CreateGuildBody,
  CreateGuildMessageBody,
  Guild,
  GuildImageUploadResponse,
  GuildLeaderboardEntry,
  GuildMember,
  GuildMemberRecord,
  GuildMessage,
  UpdateGuildBody,
  UpdateMemberRoleBody,
} from "@/lib/api/schemas"
import {
  GuildImageUploadResponseSchema,
  GuildLeaderboardEntrySchema,
  GuildMemberRecordSchema,
  GuildMemberSchema,
  GuildMessageSchema,
  GuildSchema,
  UploadMessageAttachmentResponseSchema,
} from "@/lib/api/schemas"

// ── Fetch Functions ──

export const searchGuilds = async (parameters?: {
  q?: string
  page?: number
  limit?: number
}): Promise<Guild[]> => {
  const data = await apiFetch(
    "/api/guilds",
    { method: "GET", params: parameters },
    z.object({ data: z.array(GuildSchema) })
  )
  return data.data
}

export const createGuild = async (body: CreateGuildBody): Promise<Guild> => {
  const data = await apiFetch(
    "/api/guilds",
    { method: "POST", body: JSON.stringify(body) },
    z.object({ data: GuildSchema })
  )
  return data.data
}

export const getGuild = async (
  guildId: string
): Promise<Guild & { members: GuildMember[] }> => {
  const data = await apiFetch(
    `/api/guilds/${guildId}`,
    { method: "GET" },
    z.object({
      data: GuildSchema.extend({
        members: z.array(GuildMemberSchema),
      }),
    })
  )
  return data.data
}

export const joinGuild = async (
  guildId: string
): Promise<GuildMemberRecord> => {
  const data = await apiFetch(
    `/api/guilds/${guildId}/join`,
    { method: "POST" },
    z.object({ data: GuildMemberRecordSchema })
  )
  return data.data
}

export const approveMember = async (
  guildId: string,
  body: ApproveMemberBody
): Promise<GuildMemberRecord> => {
  const data = await apiFetch(
    `/api/guilds/${guildId}/members/approve`,
    { method: "PATCH", body: JSON.stringify(body) },
    z.object({ data: GuildMemberRecordSchema })
  )
  return data.data
}

export const getGuildLeaderboard = async (
  guildId: string
): Promise<GuildLeaderboardEntry[]> => {
  const data = await apiFetch(
    `/api/guilds/${guildId}/leaderboard`,
    { method: "GET" },
    z.object({ data: z.array(GuildLeaderboardEntrySchema) })
  )
  return data.data
}

export const getGuildMessages = async (
  guildId: string,
  limit?: number
): Promise<GuildMessage[]> => {
  const data = await apiFetch(
    `/api/guilds/${guildId}/messages`,
    { method: "GET", params: { limit } },
    z.object({ data: z.array(GuildMessageSchema) })
  )
  return data.data
}

export const sendGuildMessage = async (
  guildId: string,
  body: CreateGuildMessageBody
): Promise<GuildMessage> => {
  const data = await apiFetch(
    `/api/guilds/${guildId}/messages`,
    { method: "POST", body: JSON.stringify(body) },
    z.object({ data: GuildMessageSchema })
  )
  return data.data
}

export const getMyGuilds = async (): Promise<
  (Guild & { role: string; status: string })[]
> => {
  const data = await apiFetch(
    "/api/guilds/me",
    { method: "GET" },
    z.object({
      data: z.array(
        GuildSchema.extend({
          role: z.string(),
          status: z.string(),
        })
      ),
    })
  )
  return data.data
}

export const uploadMessageAttachment = async (
  guildId: string,
  formData: FormData
): Promise<{ url: string }> => {
  const data = await apiFetch(
    `/api/guilds/${guildId}/messages/upload`,
    { method: "POST", body: formData },
    z.object({ data: UploadMessageAttachmentResponseSchema })
  )
  return data.data
}

export const updateMemberRole = async (
  guildId: string,
  body: UpdateMemberRoleBody
): Promise<GuildMemberRecord> => {
  const data = await apiFetch(
    `/api/guilds/${guildId}/members/role`,
    { method: "PATCH", body: JSON.stringify(body) },
    z.object({ data: GuildMemberRecordSchema })
  )
  return data.data
}

export const leaveGuild = async (guildId: string): Promise<void> => {
  await apiFetch(
    `/api/guilds/${guildId}/members/me`,
    { method: "DELETE" },
    z.void()
  )
}

export const updateGuild = async (
  guildId: string,
  body: UpdateGuildBody
): Promise<Guild> => {
  const data = await apiFetch(
    `/api/guilds/${guildId}`,
    { method: "PATCH", body: JSON.stringify(body) },
    z.object({ data: GuildSchema })
  )
  return data.data
}

export const uploadGuildImage = async (
  guildId: string,
  type: "avatar" | "header",
  formData: FormData
): Promise<GuildImageUploadResponse> => {
  const data = await apiFetch(
    `/api/guilds/${guildId}/images?type=${type}`,
    { method: "POST", body: formData },
    z.object({ data: GuildImageUploadResponseSchema })
  )
  return data.data
}

export const kickMember = async (
  guildId: string,
  userId: string
): Promise<void> => {
  await apiFetch(
    `/api/guilds/${guildId}/members/${userId}`,
    { method: "DELETE" },
    z.void()
  )
}

export const deleteGuild = async (guildId: string): Promise<void> => {
  await apiFetch(`/api/guilds/${guildId}`, { method: "DELETE" }, z.void())
}

export const getGuildWebSocketUrl = (
  guildId: string,
  token?: string
): string => {
  const wsUrl = BASE_URL.replace(/^http/, "ws")
  const query = token ? `?token=${encodeURIComponent(token)}` : ""
  return `${wsUrl}/api/guilds/${guildId}/ws${query}`
}

export const getWebSocketToken = async (): Promise<string> => {
  const data = await apiFetch(
    "/api/guilds/ws-token",
    { method: "POST" },
    z.object({ data: z.object({ token: z.string() }) })
  )
  return data.data.token
}

// ── React Query Hooks ──

export const useGuilds = (parameters?: {
  q?: string
  page?: number
  limit?: number
}) => {
  return useQuery({
    queryKey: ["guilds", parameters],
    queryFn: () => searchGuilds(parameters),
  })
}

export const useCreateGuild = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createGuild,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guilds"] })
    },
  })
}

export const useGuild = (guildId: string) => {
  return useQuery({
    queryKey: ["guilds", guildId],
    queryFn: () => getGuild(guildId),
    enabled: !!guildId,
  })
}

export const useJoinGuild = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: joinGuild,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guilds"] })
    },
  })
}

export const useApproveMember = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      guildId,
      body,
    }: {
      guildId: string
      body: ApproveMemberBody
    }) => approveMember(guildId, body),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["guilds", variables.guildId] })
    },
  })
}

export const useGuildLeaderboard = (guildId: string) => {
  return useQuery({
    queryKey: ["guilds", guildId, "leaderboard"],
    queryFn: () => getGuildLeaderboard(guildId),
    enabled: !!guildId,
  })
}

export const useMyGuilds = () => {
  return useQuery({
    queryKey: ["guilds", "me"],
    queryFn: getMyGuilds,
  })
}

export const useGuildMessages = (guildId: string, limit?: number) => {
  return useQuery({
    queryKey: ["guilds", guildId, "messages", limit],
    queryFn: () => getGuildMessages(guildId, limit),
    enabled: !!guildId,
  })
}

export const useGuildWebSocket = (guildId: string) => {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!guildId) return

    let ws: WebSocket | undefined
    let reconnectTimer: ReturnType<typeof setTimeout> | undefined
    let closed = false

    const connect = async () => {
      let token: string
      try {
        token = await getWebSocketToken()
      } catch (error) {
        console.error("[WS] token fetch failed", error)
        return
      }

      console.log("[WS] token fetched:", token)
      const url = getGuildWebSocketUrl(guildId, token)
      console.log("[WS] connecting to:", url)

      queryClient.invalidateQueries({
        queryKey: ["guilds", guildId, "messages"],
      })

      ws = new WebSocket(url)

      ws.addEventListener("open", () => {
        console.log("[WS] connected", guildId)
      })

      ws.addEventListener("message", (event) => {
        try {
          const message = JSON.parse(event.data) as GuildMessage
          queryClient.setQueryData<GuildMessage[]>(
            ["guilds", guildId, "messages", undefined],
            (previous) => {
              if (!previous) return [message]
              if (previous.some((m) => m.id === message.id)) return previous
              return [...previous, message]
            }
          )
        } catch {
          // ignore invalid payloads
        }
      })

      ws.addEventListener("close", (event) => {
        console.log("[WS] disconnected", guildId, event.code, event.reason)
        if (closed) return
        reconnectTimer = setTimeout(connect, 3000)
      })

      ws.addEventListener("error", (event) => {
        console.error("[WS] error", guildId, event)
        ws?.close()
      })
    }

    connect()

    return () => {
      closed = true
      if (reconnectTimer) clearTimeout(reconnectTimer)
      ws?.close()
    }
  }, [guildId, queryClient])
}

export const useGuildSocketIO = (guildId: string) => {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!guildId) return

    let socket: ReturnType<typeof io> | undefined

    const connect = async () => {
      let token: string
      try {
        token = await getWebSocketToken()
      } catch (error) {
        console.error("[SOCKET] token fetch failed", error)
        return
      }

      const socketUrl = new URL(BASE_URL).origin
      console.log("[SOCKET] BASE_URL:", BASE_URL, "socketUrl:", socketUrl)
      socket = io(socketUrl, {
        path: "/socket.io/",
        transports: ["polling", "websocket"],
        auth: { token },
      })

      socket.on("connect", () => {
        console.log("[SOCKET] connected", guildId)
        socket?.emit("join", guildId)
        queryClient.invalidateQueries({ queryKey: ["guilds", guildId, "messages"] })
      })

      socket.on("message", (message: GuildMessage) => {
        queryClient.setQueryData<GuildMessage[]>(
          ["guilds", guildId, "messages", undefined],
          (previous) => {
            if (!previous) return [message]
            if (previous.some((m) => m.id === message.id)) return previous
            return [...previous, message]
          }
        )
      })

      socket.on("disconnect", (reason) => {
        console.log("[SOCKET] disconnected", guildId, reason)
      })

      socket.on("connect_error", (error) => {
        console.error("[SOCKET] connect error", guildId, error)
      })
    }

    connect()

    return () => {
      socket?.disconnect()
    }
  }, [guildId, queryClient])
}

export const useSendGuildMessage = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      guildId,
      body,
    }: {
      guildId: string
      body: CreateGuildMessageBody
    }) => sendGuildMessage(guildId, body),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["guilds", variables.guildId, "messages"],
      })
    },
  })
}

export const useUpdateMemberRole = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      guildId,
      body,
    }: {
      guildId: string
      body: UpdateMemberRoleBody
    }) => updateMemberRole(guildId, body),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["guilds", variables.guildId] })
    },
  })
}

export const useLeaveGuild = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: leaveGuild,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guilds"] })
    },
  })
}

export const useUpdateGuild = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      guildId,
      body,
    }: {
      guildId: string
      body: UpdateGuildBody
    }) => updateGuild(guildId, body),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["guilds", variables.guildId] })
      queryClient.invalidateQueries({ queryKey: ["guilds", "me"] })
    },
  })
}

export const useUploadGuildImage = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      guildId,
      type,
      formData,
    }: {
      guildId: string
      type: "avatar" | "header"
      formData: FormData
    }) => uploadGuildImage(guildId, type, formData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["guilds", variables.guildId] })
    },
  })
}

export const useKickMember = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ guildId, userId }: { guildId: string; userId: string }) =>
      kickMember(guildId, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["guilds", variables.guildId] })
    },
  })
}

export const useDeleteGuild = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteGuild,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guilds"] })
      queryClient.invalidateQueries({ queryKey: ["guilds", "me"] })
    },
  })
}

export const useUploadMessageAttachment = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      guildId,
      formData,
    }: {
      guildId: string
      formData: FormData
    }) => uploadMessageAttachment(guildId, formData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["guilds", variables.guildId, "messages"],
      })
    },
  })
}


