import { Action, ActionPanel, Icon, showToast, Toast } from "@raycast/api";
import { Account, MessageItem } from "../types";
import { copyMail, deleteMail, moveMail } from "../utils/mail";

export const ActionsMessageMove = (props: {
  messages: MessageItem[];
  accounts: Account[];
  revalidate: () => Promise<MessageItem[]>;
}) => {
  const firstMessage = props.messages[0];
  const selectedAccountId = firstMessage.url.split("/")[2];
  const messageIds = props.messages.map((m) => m.ROWID);
  return (
    <ActionPanel.Section>
      <ActionPanel.Submenu title="Move to">
        {props.accounts
          .find((a) => a.id === selectedAccountId)
          ?.mailboxes.map((mailbox, index) => (
            <Action
              key={index}
              title={mailbox}
              onAction={async () => {
                const toast = await showToast({
                  style: Toast.Style.Animated,
                  title: "Moving...",
                });
                await moveMail(messageIds, mailbox);
                props.revalidate();
                toast.title = `Moved ${
                  messageIds.length > 1 ? messageIds.length + " messages" : "message"
                } to ${mailbox}`;
                toast.style = Toast.Style.Success;
              }}
            />
          ))}
      </ActionPanel.Submenu>
      <ActionPanel.Submenu title="Copy to">
        {props.accounts
          .find((a) => a.id === selectedAccountId)
          ?.mailboxes.map((mailbox, index) => (
            <Action
              key={index}
              title={mailbox}
              onAction={async () => {
                const toast = await showToast({
                  style: Toast.Style.Animated,
                  title: "Copying...",
                });
                await copyMail(messageIds, mailbox);
                props.revalidate();
                toast.title = `Copied ${
                  messageIds.length > 1 ? messageIds.length + " messages" : "message"
                } to ${mailbox}`;
                toast.style = Toast.Style.Success;
              }}
            />
          ))}
      </ActionPanel.Submenu>

      {/* currently, the delete actions doesn't work for conversations */}

      {props.messages.length === 1 ? (
        <Action
          icon={Icon.Trash}
          title="Delete"
          style={Action.Style.Destructive}
          onAction={async () => {
            const toast = await showToast({
              style: Toast.Style.Animated,
              title: "Deleting...",
            });
            await deleteMail(messageIds);

            let data = (await props.revalidate()).filter((m) => messageIds.includes(m.ROWID));
            const dateStarted = Date.now();

            while (data.length > 0) {
              data = (await props.revalidate()).filter((m) => messageIds.includes(m.ROWID));
              await props.revalidate();

              if (Date.now() - dateStarted > 4000) {
                console.log((Date.now() - dateStarted) / 1000);
                toast.style = Toast.Style.Failure;
                toast.title = "Could not check if message was deleted";
                break;
              }
            }
            await props.revalidate();
            toast.style = Toast.Style.Success;
            toast.title = `Deleted ${messageIds.length > 1 ? messageIds.length + " messages" : "message"}`;
          }}
        />
      ) : null}
    </ActionPanel.Section>
  );
};
