import { GraphClient } from "./client";
import { GraphMessagesResponseSchema, type GraphMessage } from "./types";

const INBOX_FIELDS = [
  "id",
  "internetMessageId",
  "subject",
  "from",
  "sender",
  "toRecipients",
  "ccRecipients",
  "receivedDateTime",
  "sentDateTime",
  "hasAttachments",
  "importance",
  "isRead",
  "inferenceClassification",
  "conversationId",
  "bodyPreview",
  "webLink",
  "parentFolderId",
  "categories",
  "lastModifiedDateTime",
].join(",");

export async function fetchInboxMessages(
  accessToken: string,
  top: number = 10
): Promise<GraphMessage[]> {
  const client = new GraphClient(accessToken);

  const path =
    `/me/mailFolders/inbox/messages` +
    `?$select=${INBOX_FIELDS}` +
    `&$orderby=receivedDateTime desc` +
    `&$top=${top}`;

  const response = await client.fetch(path, {
    useImmutableId: true,
    preferTextBody: true,
  });

  const data = await response.json();
  const parsed = GraphMessagesResponseSchema.parse(data);

  return parsed.value;
}
