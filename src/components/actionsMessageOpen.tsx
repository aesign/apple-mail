import { Action, ActionPanel, open, showToast, Toast } from "@raycast/api";
import { MessageItem } from "../types";
import { openInMail, showInMail } from "../utils/mail";

export const ActionsMessageOpen = (props: { messages: MessageItem[]; revalidate: () => void }) => (
  <ActionPanel.Section>
    <Action
      title="Open in Mail"
      onAction={async () => {
        try {
          const messageId = await openInMail(props.messages[0].ROWID);
          open(`message://%3c${messageId}%3e`);
          props.revalidate();
        } catch (e) {
          showToast(Toast.Style.Failure, "Could not open the email", (e as ErrorEvent).message);
        }
      }}
    />
    <Action
      title="Show in Mail"
      onAction={async () => {
        try {
          await showInMail(props.messages[0].ROWID);
          props.revalidate();
        } catch (e) {
          showToast(Toast.Style.Failure, "Could not show in mail", (e as ErrorEvent).message);
        }
      }}
    />
  </ActionPanel.Section>
);
