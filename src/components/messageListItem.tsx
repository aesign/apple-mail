import { Color, Icon, List, ActionPanel, Action } from "@raycast/api";
import { MessageItem, ListItem, Account } from "../types";
import { getFlagColor } from "../utils/mail";
import { convertTime } from "../utils/misc";
import { ActionsMessageActions } from "./actionsMessageActions";
import { ActionsMessageCopy } from "./actionsMessageCopy";
import { ActionsMessageFilter } from "./actionsMessageFilter";
import { ActionsMessageMove } from "./actionsMessageMove";
import { ActionsMessageOpen } from "./actionsMessageOpen";
import { Conversation } from "./conversationList";

interface Props extends ListItem {
  message: MessageItem[];
  mailboxes: string[];
  accounts: Account[];
}

export const MessageListItem = (props: Props) => {
  const propsMessage = props.message;
  const isThread = () => propsMessage.length > 1;
  const message = propsMessage[0];
  const isRead = isThread() ? propsMessage.every((m) => m.read === 1) : propsMessage[0].read === 1;
  const isFlagged = isThread() ? propsMessage.some((m) => m.flagged === 1) : propsMessage[0].flagged === 1;
  const id = message.ROWID.toString();
  const icon = isRead
    ? { source: "/empty.png", tintColor: Color.SecondaryText }
    : { source: Icon.Dot, tintColor: Color.Blue };
  const title = propsMessage[0].comment || propsMessage[0].sender;
  const summmary =
    propsMessage[0].summary.length > 60 ? propsMessage[0].summary.substring(0, 60) + "..." : message.summary;

  const accessories: any[] = [];

  if (isFlagged) {
    const flagColors = propsMessage.map((m) => (m.flagged === 1 ? m.flag_color : null));
    const uniqueFlagColors = [...new Set(flagColors)];
    uniqueFlagColors.forEach((color) => {
      color !== null && accessories.push({ icon: { source: Icon.Tag, tintColor: getFlagColor(color) } });
    });
  }

  isThread()
    ? accessories.push(
        {
          icon: Icon.Envelope,
          text: propsMessage.length.toString(),
        },
        {
          text: convertTime(propsMessage[0].date_received),
        }
      )
    : accessories.push({ text: convertTime(propsMessage[0].date_received) });

  return (
    <List.Item
      id={id}
      icon={icon}
      title={title}
      subtitle={summmary}
      accessories={accessories}
      actions={
        <ActionPanel>
          <ActionsMessageOpen messages={propsMessage} revalidate={props.revalidate} />
          {isThread() && (
            <>
              <Action.Push
                title={`Open Thread`}
                shortcut={{ modifiers: ["cmd"], key: "arrowRight" }}
                target={
                  <Conversation
                    messages={propsMessage}
                    revalidate={props.revalidate}
                    messageFilters={props.messageFilters}
                    updateMessageFilter={props.updateMessageFilter}
                    mailboxes={props.mailboxes}
                    accounts={props.accounts}
                  />
                }
              />
            </>
          )}
          <ActionsMessageActions message={propsMessage} revalidate={props.revalidate} accounts={props.accounts} />
          <ActionsMessageMove message={propsMessage} revalidate={props.revalidate} accounts={props.accounts} />
          <ActionsMessageFilter messageFilters={props.messageFilters} updateMessageFilter={props.updateMessageFilter} />
          <ActionsMessageCopy messages={propsMessage} revalidate={props.revalidate} />
          <Action
            title="Refresh"
            shortcut={{ modifiers: ["cmd", "shift"], key: "r" }}
            onAction={() => props.revalidate()}
          />
        </ActionPanel>
      }
    />
  );
};
