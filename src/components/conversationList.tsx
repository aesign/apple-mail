import { List } from "@raycast/api";
import { useSQL } from "@raycast/utils";
import { MessageItem, ListItem } from "../types";
import { getMailDbPath } from "../utils/misc";
import { MessageListItem } from "./messageListItem";

interface Props extends ListItem {
  messages: MessageItem[];
}

export const Conversation = (props: Props) => {
  const mailsQuery = `SELECT
	messages.ROWID,
	addresses.address AS sender,
	addresses. "comment",
	messages.subject_prefix,
	subjects.subject,
	summaries.summary,
	mailboxes.url,
	messages.conversation_id,
	messages.date_received,
	messages.date_sent,
	messages.display_date,
	messages.mailbox,
	messages. "read",
	messages.flagged,
	server_messages.flag_color,
	message_global_data.follow_up_start_date,
	message_global_data.follow_up_end_date,
	messages.deleted,
	messages.root_status
FROM
	messages
	INNER JOIN summaries ON messages. summary = summaries. ROWID
	INNER JOIN subjects ON messages. subject = subjects. ROWID
	INNER JOIN addresses ON messages. sender = addresses.ROWID
	INNER JOIN mailboxes ON messages.mailbox = mailboxes.ROWID
  INNER JOIN server_messages ON messages.ROWID = server_messages.message
  INNER JOIN message_global_data ON messages.message_id = message_global_data.message_id
  WHERE messages.conversation_id = ${props.messages[0].conversation_id}
    ORDER BY
messages.display_date DESC
    LIMIT 100
  `;

  const { isLoading, data, revalidate } = useSQL<MessageItem>(getMailDbPath(), mailsQuery);

  const messages = data || props.messages;

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
        {(data || messages || []).map((message, index) => (
          <MessageListItem
            key={index}
            message={message}
            revalidate={revalidateBoth}
            messageFilters={props.messageFilters}
            updateMessageFilter={props.updateMessageFilter}
          />
        ))}
      </List.Section>
    </List>
  );
};
