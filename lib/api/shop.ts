import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { apiFetch } from "@/lib/api/client";
import {
  InventoryItemSchema,
  ItemSchema,
} from "@/lib/api/schemas";
import type { BuyItemBody, InventoryItem, Item, UseItemBody } from "@/lib/api/schemas";

// ── Fetch Functions ──

export const getShopItems = async (): Promise<Item[]> => {
  const data = await apiFetch(
    "/api/shop",
    { method: "GET" },
    z.object({ data: z.array(ItemSchema) })
  );
  return data.data;
};

export const buyItem = async (
  itemId: string,
  body?: BuyItemBody
): Promise<{ success: boolean }> => {
  const data = await apiFetch(
    `/api/shop/${itemId}/buy`,
    { method: "POST", body: JSON.stringify(body ?? {}) },
    z.object({ data: z.object({ success: z.boolean() }) })
  );
  return data.data;
};

export const getInventory = async (): Promise<InventoryItem[]> => {
  const data = await apiFetch(
    "/api/inventory",
    { method: "GET" },
    z.object({ data: z.array(InventoryItemSchema) })
  );
  return data.data;
};

export const consumeItem = async (
  itemId: string,
  body?: UseItemBody
): Promise<{ success: boolean; message: string }> => {
  const data = await apiFetch(
    `/api/inventory/${itemId}/use`,
    { method: "POST", body: JSON.stringify(body ?? {}) },
    z.object({
      data: z.object({
        success: z.boolean(),
        message: z.string(),
      }),
    })
  );
  return data.data;
};

// ── React Query Hooks ──

export const useShopItems = () => {
  return useQuery({
    queryKey: ["shop"],
    queryFn: getShopItems,
  });
};

export const useBuyItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, body }: { itemId: string; body?: BuyItemBody }) =>
      buyItem(itemId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shop"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["user", "me"] });
    },
  });
};

export const useInventory = () => {
  return useQuery({
    queryKey: ["inventory"],
    queryFn: getInventory,
  });
};

export const useUseItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, body }: { itemId: string; body?: UseItemBody }) =>
      consumeItem(itemId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["user", "me"] });
    },
  });
};
