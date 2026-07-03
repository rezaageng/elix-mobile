import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { z } from "zod"

import { apiFetch } from "@/lib/api/client"
import type {
  Class,
  ClassChoice,
  CreateClassBody,
  UpdateClassBody,
} from "@/lib/api/schemas"
import { ClassChoiceSchema, ClassSchema } from "@/lib/api/schemas"

// ── Fetch Functions ──

export const getClasses = async (): Promise<Class[]> => {
  const data = await apiFetch(
    "/api/classes",
    { method: "GET" },
    z.object({ data: z.array(ClassSchema) })
  )

  return data.data
}

export const createClass = async (body: CreateClassBody): Promise<Class> => {
  const data = await apiFetch(
    "/api/classes",
    { method: "POST", body: JSON.stringify(body) },
    z.object({ data: ClassSchema })
  )
  return data.data
}

export const getClass = async (classId: string): Promise<Class> => {
  const data = await apiFetch(
    `/api/classes/${classId}`,
    { method: "GET" },
    z.object({ data: ClassSchema })
  )
  return data.data
}

export const updateClass = async (
  classId: string,
  body: UpdateClassBody
): Promise<Class> => {
  const data = await apiFetch(
    `/api/classes/${classId}`,
    { method: "PATCH", body: JSON.stringify(body) },
    z.object({ data: ClassSchema })
  )
  return data.data
}

export const deleteClass = async (classId: string): Promise<void> => {
  await apiFetch(`/api/classes/${classId}`, { method: "DELETE" }, z.void())
}

export const chooseClass = async (classId: string): Promise<ClassChoice> => {
  const data = await apiFetch(
    `/api/classes/${classId}/choose`,
    { method: "POST" },
    z.object({ data: ClassChoiceSchema })
  )
  return data.data
}

// ── React Query Hooks ──

export const useClasses = () => {
  return useQuery({
    queryKey: ["classes"],
    queryFn: getClasses,
  })
}

export const useCreateClass = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createClass,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] })
    },
  })
}

export const useClass = (classId: string) => {
  return useQuery({
    queryKey: ["classes", classId],
    queryFn: () => getClass(classId),
    enabled: !!classId,
  })
}

export const useUpdateClass = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      classId,
      body,
    }: {
      classId: string
      body: UpdateClassBody
    }) => updateClass(classId, body),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["classes", variables.classId],
      })
      queryClient.invalidateQueries({ queryKey: ["classes"] })
    },
  })
}

export const useDeleteClass = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteClass,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] })
    },
  })
}

export const useChooseClass = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: chooseClass,
    onSuccess: (_, classId) => {
      queryClient.invalidateQueries({
        queryKey: ["classes", classId, "choice"],
      })
      queryClient.invalidateQueries({ queryKey: ["user", "me"] })
    },
  })
}
