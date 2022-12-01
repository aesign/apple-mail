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
  messages: MessageItem[];
  mailboxes: string[];
  accounts: Account[];
}

export const MessageListItem = (props: Props) => {
  const isThread = () => props.messages.length > 1;

  const isRead = props.messages.every((m) => m.read === 1);
  const isFlagged = props.messages.some((m) => m.flagged === 1);
  const id = props.messages[0].ROWID.toString();
  const icon = isRead
    ? { source: "/empty.png", tintColor: Color.SecondaryText }
    : { source: Icon.Dot, tintColor: Color.Blue };
  const title = props.messages[0].comment || props.messages[0].sender;
  const summmary =
    props.messages[0].summary.length > 60
      ? props.messages[0].summary.substring(0, 60) + "..."
      : props.messages[0].summary;

  const accessories: any[] = [];

  if (isFlagged) {
    const flagColors = props.messages.map((m) => (m.flagged === 1 ? m.flag_color : null));
    const uniqueFlagColors = [...new Set(flagColors)];
    uniqueFlagColors.forEach((color) => {
      color !== null && accessories.push({ icon: { source: Icon.Tag, tintColor: getFlagColor(color) } });
    });
  }

  isThread() ? console.log(props.messages[0].summary.slice(0,10),props.messages[0].display_date) : "";

  isThread()
    ? accessories.push(
        {
          icon: Icon.Envelope,
          text: props.messages.length.toString(),
        },
        {
          text: convertTime(props.messages[0].display_date),
        }
      )
    : accessories.push({ text: convertTime(props.messages[0].display_date) });
    
  return (
    <List.Item
      id={id}
      icon={icon}
      title={title}
      subtitle={summmary}
      accessories={accessories}
      actions={
        <ActionPanel>
          <ActionsMessageOpen messages={props.messages} revalidate={props.revalidate} />
          {isThread() && (
            <>
              <Action.Push
                title={`Open Thread`}
                shortcut={{ modifiers: ["cmd"], key: "arrowRight" }}
                target={
                  <Conversation
                    messages={props.messages}
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
          <ActionsMessageActions messages={props.messages} revalidate={props.revalidate} accounts={props.accounts} />
          <ActionsMessageMove messages={props.messages} revalidate={props.revalidate} accounts={props.accounts} />
          <ActionsMessageFilter messageFilters={props.messageFilters} updateMessageFilter={props.updateMessageFilter} />
          <ActionsMessageCopy messages={props.messages} revalidate={props.revalidate} />
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
