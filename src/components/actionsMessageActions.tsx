import { Action, ActionPanel, Icon, showToast, Toast } from "@raycast/api";
import { Account, MessageItem } from "../types";
import { flags } from "../utils/costants";
import { markAsRead, reply, forward, toggleFlag, getFlagColor, setFlag } from "../utils/mail";

// todo: opmtimistic update of flags

export const ActionsMessageActions = (props: {
  messages: MessageItem[];
  accounts: Account[];
  revalidate: () => Promise<MessageItem[]>;
  updateMessage?: (message: MessageItem[]) => void;
}) => {
  const firstMessage = Array.isArray(props.messages) ? props.messages[0] : props.messages;
  const isRead = props.messages.every((m) => m.read === 1);
  const isFlagged = props.messages.some((m) => m.flagged === 1);
  const messageIds = props.messages.map((m) => m.ROWID);
  return (
    <>
      <ActionPanel.Section>
        <Action
          title={`Mark as ${isRead ? "Unread" : "Read"}`}
          shortcut={{ modifiers: ["cmd", "shift"], key: "u" }}
          onAction={async () => {
            try {
              await markAsRead(messageIds, isRead ? false : true);
              await props.revalidate();
            } catch (e) {
              showToast(
                Toast.Style.Failure,
                `Could not mark as ${isRead ? "unread" : "read"}`,
                (e as ErrorEvent).message
              );
            }
          }}
        />
        <Action
          title={`Reply`}
          shortcut={{ modifiers: ["cmd"], key: "r" }}
          onAction={async () => {
            try {
              console.log(firstMessage.ROWID, firstMessage.url);
              await reply(firstMessage.ROWID, false);
              await props.revalidate();
            } catch (e) {
              showToast(Toast.Style.Failure, "Could not reply", (e as ErrorEvent).message);
            }
          }}
        />
        <Action
          title={`Reply to all`}
          shortcut={{ modifiers: ["shift", "cmd"], key: "r" }}
          onAction={async () => {
            try {
              console.log(firstMessage.ROWID, firstMessage.url);
              await reply(firstMessage.ROWID, true);
              await props.revalidate();
            } catch (e) {
              showToast(Toast.Style.Failure, "Could not reply to all", (e as ErrorEvent).message);
            }
          }}
        />
        <Action
          title={`Forward`}
          shortcut={{ modifiers: ["shift", "cmd"], key: "f" }}
          onAction={async () => {
            console.log(firstMessage.ROWID, firstMessage.url);
            await forward(firstMessage.ROWID);
            await props.revalidate();
          }}
        />
      </ActionPanel.Section>
      <ActionPanel.Section title="Flags">
        <ActionPanel.Submenu title="Flags">
          {flags.map((flag) => (
            <Action
              key={flag.index}
              icon={{ source: Icon.Tag, tintColor: getFlagColor(flag.index) }}
              title={flag.name}
              onAction={async () => {
                const toast = await showToast({
                  style: Toast.Style.Animated,
                  title: "Setting flag...",
                });

                try {
                  await setFlag(messageIds, flag.index);

                  const dateStarted = Date.now();

                  let data = (await props.revalidate()).filter((m) => messageIds.includes(m.ROWID));

                  while (data.some((m) => m.flag_color !== flag.index)) {
                    console.log("waiting for flag to be set");
                    data = (await props.revalidate()).filter((m) => messageIds.includes(m.ROWID));
                    await props.revalidate();
                    if (Date.now() - dateStarted > 4000) {
                      console.log((Date.now() - dateStarted) / 1000);
                      toast.style = Toast.Style.Failure;
                      toast.title = "Could not check if message was deleted";
                      break;
                    }
                  }
                  toast.style = Toast.Style.Success;
                  toast.title = `Flagged ${messageIds.length > 1 ? messageIds.length + " messages" : "message"}`;
                } catch (e) {
                  toast.style = Toast.Style.Failure;
                  toast.title = "Could not set flag";
                  toast.message = (e as ErrorEvent).message;
                }
              }}
            />
          ))}
          <Action
            title={`Toggle Flag`}
            shortcut={{ modifiers: ["cmd", "shift"], key: "l" }}
            onAction={async () => {
              try {
                console.log(firstMessage.ROWID, firstMessage.url);
                await toggleFlag(messageIds, isFlagged ? false : true);
                await props.revalidate();
              } catch (e) {
                showToast(Toast.Style.Failure, "Could not toggle flag", (e as ErrorEvent).message);
              }
            }}
          />
        </ActionPanel.Submenu>
        <Action
          title={`Toggle Flag`}
          shortcut={{ modifiers: ["cmd", "shift"], key: "l" }}
          onAction={async () => {
            try {
              console.log(firstMessage.ROWID, firstMessage.url);
              await toggleFlag(messageIds, isFlagged ? false : true);
              await props.revalidate();
            } catch (e) {
              showToast(Toast.Style.Failure, "Could not toggle flag", (e as ErrorEvent).message);
            }
          }}
        />
        <Action
          title={`Clear Flag`}
          onAction={async () => {
            try {
              console.log(firstMessage.ROWID, firstMessage.url);
              await toggleFlag(messageIds, false);
              await props.revalidate();
            } catch (e) {
              showToast(Toast.Style.Failure, "Could not clear flag", (e as ErrorEvent).message);
            }
          }}
        />
      </ActionPanel.Section>
    </>
  );
};
