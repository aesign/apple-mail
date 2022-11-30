import { Action, ActionPanel, open } from "@raycast/api";
import { MessageItem } from "../types";
import { openInMail, showInMail } from "../utils/mail";

export const ActionsMessageOpen = (props: { messages: MessageItem[]; revalidate: () => void }) => (
  <ActionPanel.Section>
    <Action
      title="Open in Mail"
      onAction={async () => {
        const messageId = await openInMail(props.messages[0].ROWID);
        open(`message://%3c${messageId}%3e`);
        props.revalidate();
      }}
    />
    <Action
      title="Show in Mail"
      onAction={async () => {
        await showInMail(props.messages[0].ROWID);
        props.revalidate();
      }}
    />
  </ActionPanel.Section>
);
