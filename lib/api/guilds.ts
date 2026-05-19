import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { apiFetch } from "@/lib/api/client";
import {
  GuildLeaderboardEntrySchema,
  GuildMemberRecordSchema,
  GuildMemberSchema,
  GuildMessageSchema,
  GuildSchema,
} from "@/lib/api/schemas";
import type {
  ApproveMemberBody,
  CreateGuildBody,
  Guild,
  GuildLeaderboardEntry,
  GuildMember,
  GuildMemberRecord,
  GuildMessage,
} from "@/lib/api/schemas";

// ── Fetch Functions ──

export const searchGuilds = async (parameters?: {
  q?: string;
  page?: number;
  limit?: number;
}): Promise<Guild[]> => {
  const data = await apiFetch(
    "/api/guilds",
    { method: "GET", params: parameters },
    z.object({ data: z.array(GuildSchema) })
  );
  return data.data;
};

export const createGuild = async (body: CreateGuildBody): Promise<Guild> => {
  const data = await apiFetch(
    "/api/guilds",
    { method: "POST", body: JSON.stringify(body) },
    z.object({ data: GuildSchema })
  );
  return data.data;
};

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
  );
  return data.data;
};

export const joinGuild = async (inviteCode: string): Promise<GuildMemberRecord> => {
  const data = await apiFetch(
    `/api/guilds/join/${inviteCode}`,
    { method: "POST" },
    z.object({ data: GuildMemberRecordSchema })
  );
  return data.data;
};

export const approveMember = async (
  guildId: string,
  body: ApproveMemberBody
): Promise<GuildMemberRecord> => {
  const data = await apiFetch(
    `/api/guilds/${guildId}/members/approve`,
    { method: "PATCH", body: JSON.stringify(body) },
    z.object({ data: GuildMemberRecordSchema })
  );
  return data.data;
};

export const getGuildLeaderboard = async (
  guildId: string
): Promise<GuildLeaderboardEntry[]> => {
  const data = await apiFetch(
    `/api/guilds/${guildId}/leaderboard`,
    { method: "GET" },
    z.object({ data: z.array(GuildLeaderboardEntrySchema) })
  );
  return data.data;
};

export const getGuildMessages = async (
  guildId: string,
  limit?: number
): Promise<GuildMessage[]> => {
  const data = await apiFetch(
    `/api/guilds/${guildId}/messages`,
    { method: "GET", params: { limit } },
    z.object({ data: z.array(GuildMessageSchema) })
  );
  return data.data;
};

export const uploadMessageAttachment = async (
  guildId: string,
  formData: FormData
): Promise<{ url: string }> => {
  const data = await apiFetch(
    `/api/guilds/${guildId}/messages/upload`,
    { method: "POST", body: formData },
    z.object({ data: z.object({ url: z.string() }) })
  );
  return data.data;
};

export const getGuildWebSocketUrl = (guildId: string): string => {
  const wsUrl = BASE_URL.replace(/^http/, "ws");
  return `${wsUrl}/api/guilds/${guildId}/ws`;
};

// ── React Query Hooks ──

export const useGuilds = (parameters?: { q?: string; page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ["guilds", parameters],
    queryFn: () => searchGuilds(parameters),
  });
};

export const useCreateGuild = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createGuild,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guilds"] });
    },
  });
};

export const useGuild = (guildId: string) => {
  return useQuery({
    queryKey: ["guilds", guildId],
    queryFn: () => getGuild(guildId),
    enabled: !!guildId,
  });
};

export const useJoinGuild = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: joinGuild,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guilds"] });
    },
  });
};

export const useApproveMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ guildId, body }: { guildId: string; body: ApproveMemberBody }) =>
      approveMember(guildId, body),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["guilds", variables.guildId] });
    },
  });
};

export const useGuildLeaderboard = (guildId: string) => {
  return useQuery({
    queryKey: ["guilds", guildId, "leaderboard"],
    queryFn: () => getGuildLeaderboard(guildId),
    enabled: !!guildId,
  });
};

export const useGuildMessages = (guildId: string, limit?: number) => {
  return useQuery({
    queryKey: ["guilds", guildId, "messages", limit],
    queryFn: () => getGuildMessages(guildId, limit),
    enabled: !!guildId,
  });
};

export const useUploadMessageAttachment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ guildId, formData }: { guildId: string; formData: FormData }) =>
      uploadMessageAttachment(guildId, formData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["guilds", variables.guildId, "messages"],
      });
    },
  });
};

// Need BASE_URL locally for WS helper
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "";
