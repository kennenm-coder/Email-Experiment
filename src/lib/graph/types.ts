import { z } from "zod";

const EmailAddressSchema = z.object({
  emailAddress: z.object({
    name: z.string().nullable().optional(),
    address: z.string(),
  }),
});

export const GraphMessageSchema = z.object({
  id: z.string(),
  internetMessageId: z.string().nullable().optional(),
  subject: z.string().nullable().optional(),
  from: EmailAddressSchema.nullable().optional(),
  sender: EmailAddressSchema.nullable().optional(),
  toRecipients: z.array(EmailAddressSchema).optional(),
  ccRecipients: z.array(EmailAddressSchema).optional(),
  receivedDateTime: z.string(),
  sentDateTime: z.string().nullable().optional(),
  hasAttachments: z.boolean().optional(),
  importance: z.enum(["low", "normal", "high"]).optional(),
  isRead: z.boolean().optional(),
  inferenceClassification: z
    .enum(["focused", "other"])
    .nullable()
    .optional(),
  conversationId: z.string().nullable().optional(),
  bodyPreview: z.string().nullable().optional(),
  webLink: z.string(),
  parentFolderId: z.string().nullable().optional(),
  categories: z.array(z.string()).optional(),
  lastModifiedDateTime: z.string().nullable().optional(),
});

export type GraphMessage = z.infer<typeof GraphMessageSchema>;

export const GraphMessagesResponseSchema = z.object({
  value: z.array(GraphMessageSchema),
  "@odata.nextLink": z.string().optional(),
});

export type GraphMessagesResponse = z.infer<typeof GraphMessagesResponseSchema>;

export interface GraphError {
  code: string;
  message: string;
  statusCode: number;
}
