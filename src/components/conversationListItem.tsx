import { Color, Icon, List, ActionPanel, Action } from "@raycast/api";
import { MessageItem, ListItem } from "../types";
import { getFlagColor } from "../utils/mail";
import { convertTime } from "../utils/misc";
import { ActionsMessageActions } from "./actionsMessageActions";
import { ActionsMessageFilter } from "./actionsMessageFilter";
import { Conversation } from "./conversationList";

interface Props extends ListItem {
  messages: MessageItem[];
}

export const ConversationListItem = (props: Props) => {
  const { messages } = props;
  const isRead = props.messages.every((m) => m.read === 1);
  const isFlagged = props.messages.some((m) => m.flagged === 1);
  const icon = isRead
    ? { source: "/empty.png", tintColor: Color.SecondaryText }
    : { source: Icon.Dot, tintColor: Color.Blue };
  const title = messages[0].comment || messages[0].sender;

  const summmary = messages[0].summary.length > 60 ? messages[0].summary.substring(0, 60) + "..." : messages[0].summary;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const accessories: any[] = [];

  isFlagged && accessories.push({ icon: { source: Icon.Tag, tintColor: getFlagColor(props.messages[0].flag_color) } });
  accessories.push({
    text: convertTime(messages[0].date_received),
  });

  return (
    <List.Item
      icon={icon}
      title={title}
      subtitle={summmary}
      accessories={accessories}
      actions={
        <ActionPanel>
          <Action.Push
            title={`${messages.length - 1} more`}
            target={
              <Conversation
                messages={messages}
                revalidate={props.revalidate}
                messageFilters={props.messageFilters}
                updateMessageFilter={props.updateMessageFilter}
              />
            }
          />
          <ActionsMessageActions message={props.messages} revalidate={props.revalidate} />
          <ActionsMessageFilter messageFilters={props.messageFilters} updateMessageFilter={props.updateMessageFilter} />
        </ActionPanel>
      }
    />
  );
};
