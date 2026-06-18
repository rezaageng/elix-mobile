import type { z } from "zod"

import { authClient } from "@/lib/auth-client"

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message)
    this.name = "ApiError"
  }
}

export const BASE_URL = process.env.EXPO_PUBLIC_API_URL as string

if (!BASE_URL) {
  throw new Error("EXPO_PUBLIC_API_URL is not defined")
}

export interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | undefined>
}

export async function apiFetch<T>(
  path: string,
  options: FetchOptions,
  schema: z.ZodType<T>
): Promise<T> {
  const url = new URL(path, BASE_URL)

  if (options.params) {
    for (const [key, value] of Object.entries(options.params)) {
      if (value !== undefined) {
        url.searchParams.set(key, String(value))
      }
    }
  }

  const cookies = authClient.getCookie()
  const headers = new Headers(options.headers)

  if (cookies) {
    headers.set("Cookie", cookies)
  }

  const isFormData = options.body instanceof FormData
  if (
    !isFormData &&
    !headers.has("Content-Type") &&
    ["POST", "PATCH", "PUT"].includes(options.method || "")
  ) {
    headers.set("Content-Type", "application/json")
  }

  const response = await fetch(url.toString(), {
    ...options,
    headers,
    credentials: "omit",
  })

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}))
    throw new ApiError(
      errorBody.error?.message ||
        errorBody.message ||
        `Request failed with status ${response.status}`,
      response.status,
      errorBody.error?.code
    )
  }

  if (response.status === 204) {
    return undefined as T
  }

  const json = await response.json()

  const parsed = schema.safeParse(json)

  console.log(parsed)

  if (!parsed.success) {
    throw new ApiError(
      `Response validation failed: ${parsed.error.message}`,
      response.status,
      "VALIDATION_ERROR"
    )
  }

  return parsed.data
}
