import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { apiFetch } from "@/lib/api/client";
import { VerificationResultSchema } from "@/lib/api/schemas";
import type { VerificationResult } from "@/lib/api/schemas";

// ── Fetch Functions ──

export const submitVerification = async (
  formData: FormData
): Promise<VerificationResult> => {
  const data = await apiFetch(
    "/api/verification",
    { method: "POST", body: formData },
    z.object({ data: VerificationResultSchema })
  );
  return data.data;
};

// ── React Query Hooks ──

export const useSubmitVerification = () => {
  return useMutation({
    mutationFn: submitVerification,
  });
};
