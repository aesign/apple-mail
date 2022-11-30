import { Action, ActionPanel, Clipboard, Icon, showHUD } from "@raycast/api";
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
        const messsageId = await getMessageId(props.messages[0].ROWID);
        const md = `[${props.messages[0].subject}](message://%3c${messsageId}%3e)`;
        Clipboard.copy(md);
        showHUD("Copied link to Clipboard");
      }}
    />
  </ActionPanel.Section>
);
