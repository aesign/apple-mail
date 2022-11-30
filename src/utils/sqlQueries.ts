import { Account, MessageFilters } from "../types";

const accountsSQLFilter = (accounts: Account[]) =>
  accounts?.length
    ? `WHERE (${accounts
        .map((account, index) => `${index !== 0 ? "OR" : ""} mailboxes.url LIKE '%${encodeURIComponent(account.id)}%'`)
        .join("\r\n")})`
    : "";

const selectedAccountSQLFilter = (selectedAccount: string) =>
  selectedAccount !== "all" ? `AND mailboxes.url LIKE '%${encodeURIComponent(selectedAccount)}%'` : "";

const mailboxesSQLFilter = (mailboxes: string[]) =>
  mailboxes?.length
    ? `AND (${mailboxes
        .map((inbox, index) => `${index !== 0 ? "OR" : ""} mailboxes.url LIKE '%${encodeURIComponent(inbox)}%'`)
        .join("\r\n")})`
    : "";

// const mailboxesMessageIdsSQLFilter = (mailboxMessageIds: number[]) =>
//   mailboxMessageIds?.length
//     ? mailboxMessageIds
//         .map(
//           (id, index) =>
//             `${index === 0 ? "AND(" : "OR"} messages.ROWID LIKE ${id} ${
//               index === mailboxMessageIds.length - 1 ? ")" : ""
//             }`
//         )
//         .join("\r\n")
//     : "";

const messageViewSQLFilter = (messageFilter: MessageFilters) => {
  // if only one option is enabled
  // if no options are enabled return empty string
  if (messageFilter.options.filter((option) => option.enabled).length === 0 || !messageFilter.enabled) {
    return "";
  } else if (messageFilter.options.filter((option) => option.enabled).length === 1) {
    const filter = messageFilter.options.find((option) => option.enabled);
    return `
      AND conversation_id IN(
        SELECT
          conversation_id FROM messages
        WHERE
          ${filter?.dbKey} = ${filter?.defaultFilterValue}
        GROUP BY
          conversation_id)`;
  } else {
    return `
          ${messageFilter.options
            .map(
              (filter, index) =>
                `${index === 0 ? "AND (" : "OR"} conversation_id IN(
                  SELECT
                    conversation_id FROM messages
                  WHERE
                    ${filter?.dbKey} = ${filter?.defaultFilterValue}
                  GROUP BY
                    conversation_id) ${index === messageFilter.options.length - 1 ? ")" : ""}`
            )
            .join("\r\n")}`;
  }
};

interface mailboxQueryOptions {
  accounts: Account[];
  selectedAccount: string;
  mailboxes: string[];
  mailboxMessageIds: number[];
  messageFilter: MessageFilters;
}

export const mailboxQuery = (options: mailboxQueryOptions) => `SELECT
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

  ${accountsSQLFilter(options.accounts)}
  ${selectedAccountSQLFilter(options.selectedAccount)}
  ${mailboxesSQLFilter(options.mailboxes)}
  ${messageViewSQLFilter(options.messageFilter)}

  ORDER BY
messages.display_date DESC
  LIMIT 40
`;

interface conversationQueryOptions {
  conversation_id: number;
  mailboxes: string[];
}

export const conversationQuery = (options: conversationQueryOptions) => `SELECT
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
  WHERE messages.conversation_id = ${options.conversation_id}
  ${mailboxesSQLFilter(options.mailboxes)}
    ORDER BY
messages.display_date DESC
    LIMIT 100
  `;
