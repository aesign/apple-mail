import { Action, ActionPanel, Icon } from "@raycast/api";
import { MessageItem } from "../types";
import { flags } from "../utils/costants";
import { markAsRead, reply, replyToAll, forward, toggleFlag, clearFlag, getFlagColor, setFlag } from "../utils/mail";

export const ActionsMessageActions = (props: {
  message: MessageItem[] | MessageItem;
  revalidate: () => Promise<MessageItem[]>;
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
            props.revalidate();
          }}
        />
        <Action
          title={`Reply`}
          shortcut={{ modifiers: ["cmd"], key: "r" }}
          onAction={async () => {
            console.log(message.ROWID, message.url);
            await reply(message.ROWID);
            props.revalidate();
            // open(`message://%3c${messageId}%3e`);
          }}
        />
        <Action
          title={`Reply to all`}
          shortcut={{ modifiers: ["shift", "cmd"], key: "r" }}
          onAction={async () => {
            console.log(message.ROWID, message.url);
            await replyToAll(message.ROWID);
            props.revalidate();
            // open(`message://%3c${messageId}%3e`);
          }}
        />
        <Action
          title={`Forward`}
          shortcut={{ modifiers: ["shift", "cmd"], key: "f" }}
          onAction={async () => {
            console.log(message.ROWID, message.url);
            await forward(message.ROWID);
            props.revalidate();
            // open(`message://%3c${messageId}%3e`);
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
                // todo: fix flagging
                await setFlag(message.ROWID, flag.index);
                props.revalidate();
              }}
            />
          ))}
          <Action
            title={`Toggle Flag`}
            shortcut={{ modifiers: ["cmd", "shift"], key: "l" }}
            onAction={async () => {
              console.log(message.ROWID, message.url);
              await toggleFlag(message.ROWID, message.flagged === 1 ? false : true);
              props.revalidate();
            }}
          />
        </ActionPanel.Submenu>
        <Action
          title={`Toggle Flag`}
          shortcut={{ modifiers: ["cmd", "shift"], key: "l" }}
          onAction={async () => {
            console.log(message.ROWID, message.url);
            await toggleFlag(messageIds, isFlagged ? false : true);
            props.revalidate();
          }}
        />
        <Action
          title={`Clear Flag`}
          onAction={async () => {
            console.log(message.ROWID, message.url);
            await clearFlag(message.ROWID);
            props.revalidate();
          }}
        />
      </ActionPanel.Section>
    </>
  );
};
