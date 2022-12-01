import { Action, ActionPanel, Clipboard, Icon, showHUD, showToast, Toast } from "@raycast/api";
import { MessageItem } from "../types";
import { getMessageId } from "../utils/mail";

export const ActionsMessageCopy = (props: { messages: MessageItem[]; revalidate: () => void }) => (
  <ActionPanel.Section>
    <Action.CopyToClipboard title="Copy Sender" content={props.messages[0].sender} />
    <Action.CopyToClipboard title="Copy Subject" content={props.messages[0].subject} />
    <Action
      icon={Icon.CopyClipboard}
      title="Copy Markdown Mail Link"
      onAction={async () => {
        try {
          const messsageId = await getMessageId(props.messages[0].ROWID);
          const md = `[${props.messages[0].subject}](message://%3c${messsageId}%3e)`;
          Clipboard.copy(md);
          showHUD("Copied link to Clipboard");
        } catch (e) {
          showToast(Toast.Style.Failure, "Could not fetch email link", (e as ErrorEvent).message);
        }
      }}
    />
    <Action
      icon={Icon.CopyClipboard}
      title="Copy HTML Mail Link"
      onAction={async () => {
        try {
          const messsageId = await getMessageId(props.messages[0].ROWID);
          const html = `<a href="message://%3c${messsageId}%3e">✉️ ${props.messages[0].subject}</a>`;
          const fileContent: Clipboard.Content = { html };
          Clipboard.copy(fileContent);
          showHUD("Copied link to Clipboard");
        } catch (e) {
          showToast(Toast.Style.Failure, "Could not fetch email link", (e as ErrorEvent).message);
        }
      }}
    />
  </ActionPanel.Section>
);
