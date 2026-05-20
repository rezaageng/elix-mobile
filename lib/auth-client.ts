import { expoClient } from "@better-auth/expo/client"
import { createAuthClient } from "better-auth/react"
import { inferAdditionalFields } from "better-auth/client/plugins"
import * as SecureStore from "expo-secure-store"

export const authClient = createAuthClient({
  baseURL: process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000",
  plugins: [
    expoClient({
      scheme: "elix",
      storagePrefix: "auth",
      storage: SecureStore,
    }),
    inferAdditionalFields({
      user: {
        activeClassId: {
          type: "string",
          required: false,
        },
      },
    }),
  ],
})

export const { useSession } = authClient
