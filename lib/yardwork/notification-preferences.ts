import { z } from "zod/v3";

export const notificationPreferencesSchema = z
  .object({
    lateTexts: z.enum(["approval", "automatic", "off"]),
  })
  .strict();
export type NotificationPreferences = z.infer<
  typeof notificationPreferencesSchema
>;
export const defaultNotificationPreferences: NotificationPreferences = {
  lateTexts: "approval",
};

/** Older workspaces and malformed settings always require approval. */
export function normalizeNotificationPreferences(
  value: unknown,
): NotificationPreferences {
  const parsed = notificationPreferencesSchema.safeParse(value);
  return parsed.success ? parsed.data : { ...defaultNotificationPreferences };
}
