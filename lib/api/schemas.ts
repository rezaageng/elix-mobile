import { z } from "zod"

// ── Error ──

export const ErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.record(z.string(), z.unknown()).optional(),
})

export const ErrorEnvelopeSchema = z.object({
  error: ErrorSchema,
})

// ── Classes ──

export const ClassSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  description: z.string(),
  requirements: z.record(z.string(), z.unknown()).nullable().optional(),
  authorId: z.string(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
})

export const ClassChoiceSchema = z.object({
  id: z.uuid(),
  userId: z.string(),
  classId: z.uuid(),
  chosenAt: z.iso.datetime(),
})

// ── Quests ──

export const QuestSchema = z.object({
  id: z.uuid(),
  classId: z.uuid(),
  name: z.string(),
  description: z.string(),
  type: z.string(),
  submissionType: z.string(),
  duration: z.number().int(),
  requiredQuestId: z.uuid().nullable(),
  authorId: z.string().nullable().optional(),
  startsAt: z.iso.datetime().nullable().optional(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
})

export const QuestProgressSchema = z.object({
  id: z.uuid(),
  userId: z.string(),
  questId: z.uuid(),
  status: z.string(),
  startedAt: z.iso.datetime().nullable().optional(),
  completedAt: z.iso.datetime().nullable().optional(),
  rewardMultiplier: z.string().nullable().optional(),
  xpEarned: z.number().int().nullable().optional(),
  goldEarned: z.number().int().nullable().optional(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
})

export const QuestOverrideSchema = z.object({
  id: z.uuid(),
  userId: z.string(),
  questId: z.uuid(),
  name: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  duration: z.number().int().nullable().optional(),
  startsAt: z.iso.datetime().nullable().optional(),
  hidden: z.boolean().nullable().optional(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
})

export const ClassQuestSchema = QuestSchema.extend({
  progress: z.array(QuestProgressSchema).optional(),
  overrides: z.array(QuestOverrideSchema).optional(),
  xpReward: z.number().int().optional(),
  goldReward: z.number().int().optional(),
})

export const LevelUpInfoSchema = z.object({
  from: z.number().int(),
  to: z.number().int(),
})

// ── Shared ──

export const ImageUrlSchema = z.string().url()

// ── Guilds ──

export const GuildSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  description: z.string().nullable(),
  imageUrl: z.string().nullable(),
  headerUrl: z.string().nullable(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
})

export const GuildMemberSchema = z.object({
  id: z.string(),
  name: z.string(),
  image: ImageUrlSchema.nullable(),
  role: z.string(),
  status: z.string(),
})

export const GuildMemberRecordSchema = z.object({
  id: z.uuid(),
  guildId: z.uuid(),
  userId: z.string(),
  status: z.string(),
  joinedAt: z.iso.datetime(),
})

export const GuildMessageUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  username: z.string(),
  image: ImageUrlSchema.nullable(),
})

export const GuildMessageSchema = z.object({
  id: z.uuid(),
  content: z.string().nullable(),
  attachmentUrl: z.string().nullable(),
  createdAt: z.iso.datetime(),
  user: GuildMessageUserSchema,
})

export const GuildLeaderboardEntrySchema = z.object({
  id: z.string(),
  name: z.string(),
  username: z.string(),
  image: ImageUrlSchema.nullable(),
  expThisWeek: z.number().int(),
})

// ── Shop & Inventory ──

export const ItemSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  description: z.string(),
  type: z.string(),
  price: z.number().int(),
  isActive: z.boolean(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
})

export const InventoryItemSchema = z.object({
  id: z.uuid(),
  userId: z.string(),
  itemId: z.uuid(),
  quantity: z.number().int(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  item: ItemSchema,
})

// ── Users ──

export const ActiveBuffSchema = z.object({
  type: z.enum(["xp_boost", "gold_boost"]),
  multiplier: z.string(),
  expiresAt: z.iso.datetime(),
})

export const PublicUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  username: z.string().nullable(),
  displayUsername: z.string().nullable(),
  image: ImageUrlSchema.nullable(),
  banner: ImageUrlSchema.nullable().optional(),
  level: z.number().int(),
  xp: z.number().int(),
  gold: z.number().int(),
  streak: z.number().int(),
  longestStreak: z.number().int(),
  restorableStreak: z.number().int(),
  classes: z.array(ClassSchema),
  activeClass: ClassSchema.nullable(),
  activeBuffs: z.array(ActiveBuffSchema).default([]),
  createdAt: z.iso.datetime(),
})

export const BaseStatsSchema = z.object({
  questsCompleted: z.number().int(),
  questsInProgress: z.number().int(),
  questsNotStarted: z.number().int(),
  classesChosen: z.number().int(),
})

export const TimelinePointSchema = z.object({
  label: z.string(),
  value: z.number().int().nonnegative(),
})

export const TimelineSchema = z.object({
  all: z.array(TimelinePointSchema),
  yearly: z.array(TimelinePointSchema),
  monthly: z.array(TimelinePointSchema),
  weekly: z.array(TimelinePointSchema),
})

export const UserActivityItemSchema = z.object({
  id: z.string(),
  questName: z.string(),
  completedAt: z.iso.datetime(),
  className: z.string(),
})

export type UserActivityItem = z.infer<typeof UserActivityItemSchema>

export const UserStatsSchema = z.object({
  progression: z.object({
    level: z.number().int(),
    totalXp: z.number().int(),
    gold: z.number().int(),
    currentLevelXp: z.number().int(),
    xpToNextLevel: z.number().int(),
  }),
  allTime: BaseStatsSchema,
  yearly: BaseStatsSchema,
  monthly: BaseStatsSchema,
  weekly: BaseStatsSchema,
  timeline: TimelineSchema,
})

// ── Verification ──

export const VerificationResultSchema = z.object({
  isValid: z.boolean(),
  reasoning: z.string(),
  feedback: z.string(),
})

// ── Request Body Schemas ──

export const CreateClassBodySchema = z.object({
  name: z.string(),
  description: z.string(),
})

export const UpdateClassBodySchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
})

export const CreateQuestBodySchema = z.object({
  name: z.string(),
  description: z.string(),
  type: z.enum(["daily", "weekly", "main", "side", "event"]),
  submissionType: z.enum(["image", "text"]),
  duration: z.number().int(),
  requiredQuestId: z.uuid().nullable().optional(),
  startsAt: z.iso.datetime().optional().nullable(),
})

export const UpdateQuestBodySchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  type: z.enum(["daily", "weekly", "main", "side", "event"]).optional(),
  submissionType: z.enum(["image", "text"]).optional(),
  duration: z.number().int().optional(),
  requiredQuestId: z.uuid().nullable().optional(),
  startsAt: z.iso.datetime().optional().nullable(),
})

export const OverrideQuestBodySchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  duration: z.number().int().optional(),
  startsAt: z.iso.datetime().optional().nullable(),
  hidden: z.boolean().optional(),
})

export const UpdateQuestProgressBodySchema = z.object({
  status: z.enum(["in_progress", "completed"]),
})

export const UpdateGuildBodySchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
})

export const CreateGuildBodySchema = z.object({
  name: z.string(),
  description: z.string().optional(),
})

export const ApproveMemberBodySchema = z.object({
  userId: z.uuid(),
  status: z.enum(["approved", "rejected"]),
})

export const UpdateMemberRoleBodySchema = z.object({
  userId: z.uuid(),
  role: z.enum(["member", "admin"]),
})

export const CreateGuildMessageBodySchema = z.object({
  content: z.string().optional(),
  attachmentUrl: z.string().url().optional(),
})

export const UploadMessageAttachmentResponseSchema = z.object({
  url: z.string().url(),
})

export const GuildImageUploadResponseSchema = z.object({
  url: z.string().url(),
})

export const BuyItemBodySchema = z.object({
  quantity: z.number().int().optional(),
})

export const UseItemBodySchema = z.object({
  quantity: z.number().int().optional(),
  targetQuestId: z.uuid().optional(),
})

// ── Response Wrapper Schemas ──

export const DataWrapperSchema = <T extends z.ZodTypeAny>(schema: T) =>
  z.object({ data: schema })

export const PaginatedMetaSchema = z.object({
  page: z.number().int(),
  limit: z.number().int(),
  totalItems: z.number().int(),
  totalPages: z.number().int(),
})

// ── Types ──

export type ApiErrorData = z.infer<typeof ErrorSchema>
export type ApiErrorEnvelope = z.infer<typeof ErrorEnvelopeSchema>
export type Class = z.infer<typeof ClassSchema>
export type ClassChoice = z.infer<typeof ClassChoiceSchema>
export type Quest = z.infer<typeof QuestSchema>
export type ClassQuest = z.infer<typeof ClassQuestSchema>
export type QuestOverride = z.infer<typeof QuestOverrideSchema>
export type ActiveBuff = z.infer<typeof ActiveBuffSchema>
export type QuestProgress = z.infer<typeof QuestProgressSchema>
export type LevelUpInfo = z.infer<typeof LevelUpInfoSchema>
export type Guild = z.infer<typeof GuildSchema>
export type GuildMember = z.infer<typeof GuildMemberSchema>
export type GuildMemberRecord = z.infer<typeof GuildMemberRecordSchema>
export type GuildMessage = z.infer<typeof GuildMessageSchema>
export type GuildLeaderboardEntry = z.infer<typeof GuildLeaderboardEntrySchema>
export type Item = z.infer<typeof ItemSchema>
export type InventoryItem = z.infer<typeof InventoryItemSchema>
export type PublicUser = z.infer<typeof PublicUserSchema>
export type BaseStats = z.infer<typeof BaseStatsSchema>
export type UserStats = z.infer<typeof UserStatsSchema>
export type VerificationResult = z.infer<typeof VerificationResultSchema>
export type CreateClassBody = z.infer<typeof CreateClassBodySchema>
export type UpdateClassBody = z.infer<typeof UpdateClassBodySchema>
export type CreateQuestBody = z.infer<typeof CreateQuestBodySchema>
export type UpdateQuestBody = z.infer<typeof UpdateQuestBodySchema>
export type OverrideQuestBody = z.infer<typeof OverrideQuestBodySchema>
export type UpdateQuestProgressBody = z.infer<
  typeof UpdateQuestProgressBodySchema
>
export type CreateGuildBody = z.infer<typeof CreateGuildBodySchema>
export type UpdateGuildBody = z.infer<typeof UpdateGuildBodySchema>
export type GuildImageUploadResponse = z.infer<typeof GuildImageUploadResponseSchema>
export type ApproveMemberBody = z.infer<typeof ApproveMemberBodySchema>
export type UpdateMemberRoleBody = z.infer<typeof UpdateMemberRoleBodySchema>
export type CreateGuildMessageBody = z.infer<typeof CreateGuildMessageBodySchema>
export type BuyItemBody = z.infer<typeof BuyItemBodySchema>
export type UseItemBody = z.infer<typeof UseItemBodySchema>
export type PaginatedMeta = z.infer<typeof PaginatedMetaSchema>
