import { List } from "@raycast/api";
import { useSQL } from "@raycast/utils";
import { MessageItem, ListItem, Account } from "../types";
import { getMailDbPath } from "../utils/misc";
import { MessageListItem } from "./messageListItem";
import { conversationQuery } from "../utils/sqlQueries";

interface Props extends ListItem {
  messages: MessageItem[];
  mailboxes: string[];
  accounts: Account[];
}

export const Conversation = (props: Props) => {
  const { isLoading, data, revalidate } = useSQL<MessageItem>(
    getMailDbPath(),
    conversationQuery({ conversation_id: props.messages[0].conversation_id, mailboxes: props.mailboxes })
  );


  // compare data and props.messages and return the objects that are in props.messages and in data
  const filteredData = data?.filter((m) => props.messages.some((p) => p.ROWID === m.ROWID));

  const messages = filteredData || props.messages;

  const revalidateBoth: () => Promise<MessageItem[]> = () => {
    props.revalidate();
    return revalidate();
  };

  const participants = messages.map((m) => m.comment || m.sender);
  const participantsString =
    participants.length > 3
      ? `${participants.slice(0, 3).join(", ")} and ${participants.length - 3} more`
      : participants.join(", ");
  return (
    <List isLoading={isLoading} selectedItemId={messages[1].ROWID.toString()}>
      <List.Section title={messages[0].subject} subtitle={participantsString}>
        {(messages || []).map((message, index) => (
          <MessageListItem
            key={index}
            messages={[message]}
            revalidate={revalidateBoth}
            messageFilters={props.messageFilters}
            updateMessageFilter={props.updateMessageFilter}
            mailboxes={props.mailboxes}
            isInConversation={true}
            accounts={props.accounts}
          />
        ))}
      </List.Section>
    </List>
  );
};
