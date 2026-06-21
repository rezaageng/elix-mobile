import { apiFetch } from "@/lib/api/client"
import { DataWrapperSchema, PushTokenSchema } from "@/lib/api/schemas"
import type { PushToken } from "@/lib/api/schemas"

export const registerPushToken = async (
  token: string,
  platform: string
): Promise<PushToken> => {
  const data = await apiFetch(
    "/api/push-tokens",
    { method: "POST", body: JSON.stringify({ token, platform }) },
    DataWrapperSchema(PushTokenSchema)
  )
  return data.data
}
