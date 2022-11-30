import { Action, ActionPanel, Icon, showToast, Toast } from "@raycast/api";
import { Account, MessageItem } from "../types";
import { copyMail, deleteMail, moveMail } from "../utils/mail";

export const ActionsMessageMove = (props: {
  message: MessageItem[] | MessageItem;
  accounts: Account[];
  revalidate: () => Promise<MessageItem[]>;
}) => {
  const message = Array.isArray(props.message) ? props.message[0] : props.message;
  const selectedAccountId = message.url.split("/")[2];
  const messageIds = Array.isArray(props.message) ? props.message.map((m) => m.ROWID) : props.message.ROWID;
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
                await moveMail(messageIds, mailbox);
                props.revalidate();
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
                await copyMail(messageIds, mailbox);
                props.revalidate();
              }}
            />
          ))}
      </ActionPanel.Submenu>
      <Action
        icon={Icon.Trash}
        title="Delete"
        style={Action.Style.Destructive}
        onAction={async () => {
          const toast = await showToast({
            style: Toast.Style.Animated,
            title: "Deleting...",
          });
          console.log(Array.isArray(messageIds));
          await deleteMail(messageIds);

          let data = (await props.revalidate()).filter((m) =>
            Array.isArray(messageIds) ? messageIds.includes(m.ROWID) : m.ROWID === messageIds
          );
          const dateStarted = Date.now();

          while (data.length > 0) {
            console.log("deleting", data.length);
            data = (await props.revalidate()).filter((m) =>
              Array.isArray(messageIds) ? messageIds.includes(m.ROWID) : m.ROWID === messageIds
            );
            await props.revalidate();

            if (Date.now() - dateStarted > 4000) {
              console.log((Date.now() - dateStarted) / 1000);
              toast.style = Toast.Style.Failure;
              toast.title = "Could not check if message was deleted";
              break;
            }
          }
          await props.revalidate();
          const count = Array.isArray(messageIds) ? messageIds.length : 1;
          toast.style = Toast.Style.Success;
          toast.title = `Deleted ${count > 1 ? count + " messages" : "message"}`;
        }}
      />
    </ActionPanel.Section>
  );
};
