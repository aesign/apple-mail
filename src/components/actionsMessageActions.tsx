import { Action, ActionPanel, Icon, showToast, Toast } from "@raycast/api";
import { Account, MessageItem } from "../types";
import { flags } from "../utils/costants";
import { markAsRead, reply, forward, toggleFlag, getFlagColor, setFlag } from "../utils/mail";

// todo: opmtimistic update of flags

export const ActionsMessageActions = (props: {
  message: MessageItem[] | MessageItem;
  accounts: Account[];
  revalidate: () => Promise<MessageItem[]>;
  updateMessage?: (message: MessageItem[]) => void;
}) => {
  const message = Array.isArray(props.message) ? props.message[0] : props.message;
  const isRead = Array.isArray(props.message) ? props.message.every((m) => m.read === 1) : props.message.read === 1;
  const isFlagged = Array.isArray(props.message)
    ? props.message.some((m) => m.flagged === 1)
    : props.message.flagged === 1;
  const messageIds = Array.isArray(props.message) ? props.message.map((m) => m.ROWID) : props.message.ROWID;
  return (
    <>
      <ActionPanel.Section>
        <Action
          title={`Mark as ${isRead ? "Unread" : "Read"}`}
          shortcut={{ modifiers: ["cmd", "shift"], key: "u" }}
          onAction={async () => {
            await markAsRead(messageIds, isRead ? false : true);
            await props.revalidate();
          }}
        />
        <Action
          title={`Reply`}
          shortcut={{ modifiers: ["cmd"], key: "r" }}
          onAction={async () => {
            console.log(message.ROWID, message.url);
            await reply(message.ROWID, false);
            await props.revalidate();
          }}
        />
        <Action
          title={`Reply to all`}
          shortcut={{ modifiers: ["shift", "cmd"], key: "r" }}
          onAction={async () => {
            console.log(message.ROWID, message.url);
            await reply(message.ROWID, true);
            await props.revalidate();
          }}
        />
        <Action
          title={`Forward`}
          shortcut={{ modifiers: ["shift", "cmd"], key: "f" }}
          onAction={async () => {
            console.log(message.ROWID, message.url);
            await forward(message.ROWID);
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
                  title: "Flagging...",
                });
                await setFlag(messageIds, flag.index);

                const dateStarted = Date.now();

                let data = (await props.revalidate()).filter((m) =>
                  Array.isArray(messageIds) ? messageIds.includes(m.ROWID) : m.ROWID === messageIds
                );

                while (data.some((m) => m.flag_color !== flag.index)) {
                  console.log("waiting for flag to be set");
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
                const count = Array.isArray(messageIds) ? messageIds.length : 1;
                toast.style = Toast.Style.Success;
                toast.title = `Flagged ${count > 1 ? count + " messages" : "message"}`;
              }}
            />
          ))}
          <Action
            title={`Toggle Flag`}
            shortcut={{ modifiers: ["cmd", "shift"], key: "l" }}
            onAction={async () => {
              console.log(message.ROWID, message.url);
              await toggleFlag(messageIds, isFlagged ? false : true);
              await props.revalidate();
            }}
          />
        </ActionPanel.Submenu>
        <Action
          title={`Toggle Flag`}
          shortcut={{ modifiers: ["cmd", "shift"], key: "l" }}
          onAction={async () => {
            console.log(message.ROWID, message.url);
            await toggleFlag(messageIds, isFlagged ? false : true);
            await props.revalidate();
          }}
        />
        <Action
          title={`Clear Flag`}
          onAction={async () => {
            console.log(message.ROWID, message.url);
            await toggleFlag(messageIds, false);
            await props.revalidate();
          }}
        />
      </ActionPanel.Section>
    </>
  );
};
