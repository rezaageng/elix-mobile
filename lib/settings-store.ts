import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { apiFetch } from "@/lib/api/client";

export interface ProfileSettings {
  showQuestNamesInActivity: boolean;
  hideActivityCompletely: boolean;
}

const SettingsSchema = z.object({
  showQuestNamesInActivity: z.boolean(),
  hideActivityCompletely: z.boolean(),
});

export const getProfileSettings = async (): Promise<ProfileSettings> => {
  const data = await apiFetch(
    "/api/users/me/settings",
    { method: "GET" },
    z.object({
      data: SettingsSchema,
    })
  );
  return data.data;
};

export const updateProfileSettings = async (
  settings: Partial<ProfileSettings>
): Promise<ProfileSettings> => {
  const data = await apiFetch(
    "/api/users/me/settings",
    { method: "PATCH", body: JSON.stringify(settings) },
    z.object({
      data: SettingsSchema,
    })
  );
  return data.data;
};

export const useProfileSettings = () => {
  return useQuery({
    queryKey: ["user", "me", "settings"],
    queryFn: getProfileSettings,
  });
};

export const useUpdateProfileSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProfileSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "me", "settings"] });
    },
  });
};
