import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { apiFetch } from "@/lib/api/client";
import {
  ClassQuestSchema,
  LevelUpInfoSchema,
  QuestProgressSchema,
  QuestSchema,
} from "@/lib/api/schemas";
import type {
  ClassQuest,
  CreateQuestBody,
  LevelUpInfo,
  OverrideQuestBody,
  Quest,
  QuestProgress,
  UpdateQuestBody,
  UpdateQuestProgressBody,
} from "@/lib/api/schemas";

// ── Fetch Functions ──

export const getClassQuests = async (classId: string): Promise<ClassQuest[]> => {
  const data = await apiFetch(
    `/api/classes/${classId}/quests`,
    { method: "GET" },
    z.object({ data: z.array(ClassQuestSchema) })
  );
  return data.data;
};

export const createQuests = async (
  classId: string,
  body: CreateQuestBody[]
): Promise<Quest[]> => {
  const data = await apiFetch(
    `/api/classes/${classId}/quests`,
    { method: "POST", body: JSON.stringify(body) },
    z.object({ data: z.array(QuestSchema) })
  );
  return data.data;
};

export const updateQuest = async (
  classId: string,
  questId: string,
  body: UpdateQuestBody
): Promise<Quest> => {
  const data = await apiFetch(
    `/api/classes/${classId}/quests/${questId}`,
    { method: "PATCH", body: JSON.stringify(body) },
    z.object({ data: QuestSchema })
  );
  return data.data;
};

export const deleteQuest = async (classId: string, questId: string): Promise<void> => {
  await apiFetch(
    `/api/classes/${classId}/quests/${questId}`,
    { method: "DELETE" },
    z.void()
  );
};

export const overrideQuest = async (
  classId: string,
  questId: string,
  body: OverrideQuestBody
): Promise<unknown> => {
  const data = await apiFetch(
    `/api/classes/${classId}/quests/${questId}/override`,
    { method: "PATCH", body: JSON.stringify(body) },
    z.object({ data: z.unknown() })
  );
  return data.data;
};

export const startQuestProgress = async (
  classId: string,
  questId: string
): Promise<QuestProgress> => {
  const data = await apiFetch(
    `/api/classes/${classId}/quests/${questId}/progress`,
    { method: "POST" },
    z.object({ data: QuestProgressSchema })
  );
  return data.data;
};

export const updateQuestProgress = async (
  classId: string,
  questId: string,
  body: UpdateQuestProgressBody
): Promise<{ data: QuestProgress; levelUp?: LevelUpInfo | null }> => {
  const data = await apiFetch(
    `/api/classes/${classId}/quests/${questId}/progress`,
    { method: "PATCH", body: JSON.stringify(body) },
    z.object({
      data: QuestProgressSchema,
      levelUp: LevelUpInfoSchema.nullable().optional(),
    })
  );
  return data;
};

// ── React Query Hooks ──

export const useClassQuests = (classId: string) => {
  return useQuery({
    queryKey: ["classes", classId, "quests"],
    queryFn: () => getClassQuests(classId),
    enabled: !!classId,
  });
};

export const useCreateQuests = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ classId, body }: { classId: string; body: CreateQuestBody[] }) =>
      createQuests(classId, body),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["classes", variables.classId, "quests"],
      });
      queryClient.refetchQueries({
        queryKey: ["classes", variables.classId, "quests"],
      });
    },
  });
};

export const useUpdateQuest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      classId,
      questId,
      body,
    }: {
      classId: string;
      questId: string;
      body: UpdateQuestBody;
    }) => updateQuest(classId, questId, body),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["classes", variables.classId, "quests"],
      });
      queryClient.invalidateQueries({
        queryKey: ["classes", variables.classId, "quests", variables.questId],
      });
    },
  });
};

export const useDeleteQuest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ classId, questId }: { classId: string; questId: string }) =>
      deleteQuest(classId, questId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["classes", variables.classId, "quests"],
      });
      queryClient.refetchQueries({
        queryKey: ["classes", variables.classId, "quests"],
      });
    },
  });
};

export const useOverrideQuest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      classId,
      questId,
      body,
    }: {
      classId: string;
      questId: string;
      body: OverrideQuestBody;
    }) => overrideQuest(classId, questId, body),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["classes", variables.classId, "quests"],
      });
      queryClient.refetchQueries({
        queryKey: ["classes", variables.classId, "quests"],
      });
    },
  });
};

export const useStartQuestProgress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ classId, questId }: { classId: string; questId: string }) =>
      startQuestProgress(classId, questId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["classes", variables.classId, "quests", variables.questId, "progress"],
      });
      queryClient.invalidateQueries({
        queryKey: ["classes", variables.classId, "quests"],
      });
    },
  });
};

export const useUpdateQuestProgress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      classId,
      questId,
      body,
    }: {
      classId: string;
      questId: string;
      body: UpdateQuestProgressBody;
    }) => updateQuestProgress(classId, questId, body),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["classes", variables.classId, "quests", variables.questId, "progress"],
      });
      queryClient.invalidateQueries({
        queryKey: ["classes", variables.classId, "quests"],
      });
      queryClient.invalidateQueries({ queryKey: ["user", "me"] });
    },
  });
};

export const startStarterQuests = async (classId: string): Promise<{ started: number }> => {
  const data = await apiFetch(
    `/api/classes/${classId}/quests/start`,
    { method: "POST" },
    z.object({ data: z.object({ started: z.number().int() }) })
  );
  return data.data;
};

export const useStartStarterQuests = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ classId }: { classId: string }) => startStarterQuests(classId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["classes", variables.classId, "quests"],
      });
    },
  });
};
