export function getZodErrorMessage(error?: unknown): string | undefined {
  if (!error) return
  if (Array.isArray(error)) {
    return (error[0] as { message?: string })?.message
  }
  const zodError = error as {
    issues?: { message: string }[]
  }
  return zodError.issues?.[0]?.message
}
