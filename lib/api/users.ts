import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { apiFetch } from "@/lib/api/client";
import {
  PaginatedMetaSchema,
  PublicUserSchema,
  UserStatsSchema,
} from "@/lib/api/schemas";
import type { PaginatedMeta, PublicUser, UserStats } from "@/lib/api/schemas";

// ── Fetch Functions ──

export const searchUsers = async (parameters?: {
  q?: string;
  page?: number;
  limit?: number;
}): Promise<{ data: PublicUser[]; meta: PaginatedMeta }> => {
  return apiFetch(
    "/api/users",
    { method: "GET", params: parameters },
    z.object({
      data: z.array(PublicUserSchema),
      meta: PaginatedMetaSchema,
    })
  );
};

export const getUser = async (userId: string): Promise<PublicUser> => {
  const data = await apiFetch(
    `/api/users/${userId}`,
    { method: "GET" },
    z.object({ data: PublicUserSchema })
  );
  return data.data;
};

export const getUserStats = async (userId: string): Promise<UserStats> => {
  const data = await apiFetch(
    `/api/users/${userId}/stats`,
    { method: "GET" },
    z.object({ data: UserStatsSchema })
  );
  return data.data;
};

export const getCurrentUser = async (): Promise<PublicUser> => {
  const data = await apiFetch(
    "/api/users/me",
    { method: "GET" },
    z.object({ data: PublicUserSchema })
  );
  return data.data;
};

export const uploadAvatar = async (formData: FormData): Promise<{ url: string }> => {
  const data = await apiFetch(
    "/api/users/me/avatar",
    { method: "POST", body: formData },
    z.object({ data: z.object({ url: z.string() }) })
  );
  return data.data;
};

export const deleteAvatar = async (): Promise<void> => {
  await apiFetch("/api/users/me/avatar", { method: "DELETE" }, z.void());
};

export const uploadBanner = async (formData: FormData): Promise<{ url: string }> => {
  const data = await apiFetch(
    "/api/users/me/banner",
    { method: "POST", body: formData },
    z.object({ data: z.object({ url: z.string() }) })
  );
  return data.data;
};

export const deleteBanner = async (): Promise<void> => {
  await apiFetch("/api/users/me/banner", { method: "DELETE" }, z.void());
};

// ── React Query Hooks ──

export const useUsers = (parameters?: { q?: string; page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ["users", parameters],
    queryFn: () => searchUsers(parameters),
  });
};

export const useUser = (userId: string) => {
  return useQuery({
    queryKey: ["users", userId],
    queryFn: () => getUser(userId),
    enabled: !!userId,
  });
};

export const useUserStats = (userId: string) => {
  return useQuery({
    queryKey: ["users", userId, "stats"],
    queryFn: () => getUserStats(userId),
    enabled: !!userId,
  });
};

export const useCurrentUser = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ["user", "me"],
    queryFn: getCurrentUser,
    staleTime: 0,
    ...options,
  });
};

export const useUploadAvatar = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: uploadAvatar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "me"] });
    },
  });
};

export const updateTimezone = async (timezone: string): Promise<{ timezone: string }> => {
  const data = await apiFetch(
    "/api/users/me/timezone",
    { method: "PATCH", body: JSON.stringify({ timezone }) },
    z.object({ data: z.object({ timezone: z.string() }) })
  );
  return data.data;
};

export const useUpdateTimezone = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateTimezone,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "me"] });
    },
  });
};

export const useDeleteAvatar = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAvatar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "me"] });
    },
  });
};

export const useUploadBanner = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: uploadBanner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "me"] });
    },
  });
};

export const useDeleteBanner = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteBanner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "me"] });
    },
  });
};
