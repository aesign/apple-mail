import { List, Icon, ActionPanel } from "@raycast/api";
import { useCachedState, useSQL } from "@raycast/utils";
import _ from "lodash";
import { useEffect } from "react";
import { Account, MailboxNames, MessageFilters, MessageItem } from "../types";
import { getAccounts, getMailboxes, getMailboxMessageIds, getMailboxName } from "../utils/mail";
import { getMailDbPath } from "../utils/misc";
import { ActionsMessageFilter } from "./actionsMessageFilter";
import { ConversationListItem } from "./conversationListItem";
import { MessageListItem } from "./messageListItem";

export const Mailbox = (props: { name: MailboxNames }) => {
  const [accounts, setAccounts] = useCachedState<Account[]>("enabled-accounts", []);
  // const [isShowingDetail, setShowingDetail] = useCachedState<boolean>("is-showing-detail", false);
  // const [mailboxUnreadCount, setMailboxUnreadCount] = useCachedState<number>("mailbox-unread-count", 0);
  const [mailboxName, setMailboxName] = useCachedState<string>("mailbox-name", "Inbox");
  const [mailboxes, setMailboxes] = useCachedState<string[]>("mailboxes", []);
  const [cachedData, setCachedData] = useCachedState<MessageItem[]>("data", []);
  const [selectedAccount, setSelectedAccount] = useCachedState<string>("selected-account", "all");
  const [mailboxMessageIds, setMailboxMessageIds] = useCachedState<number[]>("mailbox-message-ids", []);
  const [messageFilters, setMessageFilters] = useCachedState<string>(
    "message-filters",
    JSON.stringify({
      enabled: true,
      options: [
        { name: "Unread", dbKey: "read", defaultFilterValue: 0, enabled: true },
        { name: "Flagged", dbKey: "flagged", defaultFilterValue: 1, enabled: false },
      ],
    })
  );

  const parsedMessageFilters = JSON.parse(messageFilters) as MessageFilters;

  const accountsSQLFilter = () =>
    accounts?.length
      ? `WHERE (${accounts
          .map(
            (account, index) => `${index !== 0 ? "OR" : ""} mailboxes.url LIKE '%${encodeURIComponent(account.id)}%'`
          )
          .join("\r\n")})`
      : "";

  const selectedAccountSQLFilter = () =>
    selectedAccount !== "all" ? `AND mailboxes.url LIKE '%${encodeURIComponent(selectedAccount)}%'` : "";

  const mailboxesSQLFilter = () =>
    mailboxes?.length
      ? `AND (${mailboxes
          .map((inbox, index) => `${index !== 0 ? "OR" : ""} mailboxes.url LIKE '%${encodeURIComponent(inbox)}%'`)
          .join("\r\n")})`
      : "";

  const mailboxesMessageIdsSQLFilter = () =>
    mailboxMessageIds?.length
      ? mailboxMessageIds
          .map(
            (id, index) =>
              `${index === 0 ? "AND(" : "OR"} messages.ROWID LIKE ${id} ${
                index === mailboxMessageIds.length - 1 ? ")" : ""
              }`
          )
          .join("\r\n")
      : "";

  const messageViewSQLFilter = () => {
    // if only one option is enabled
    // if no options are enabled return empty string
    if (parsedMessageFilters.options.filter((option) => option.enabled).length === 0 || !parsedMessageFilters.enabled) {
      return "";
    } else if (parsedMessageFilters.options.filter((option) => option.enabled).length === 1) {
      const filter = parsedMessageFilters.options.find((option) => option.enabled);
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
          ${parsedMessageFilters.options
            .map(
              (filter, index) =>
                `${index === 0 ? "AND (" : "OR"} conversation_id IN(
                  SELECT
                    conversation_id FROM messages
                  WHERE
                    ${filter?.dbKey} = ${filter?.defaultFilterValue}
                  GROUP BY
                    conversation_id) ${index === parsedMessageFilters.options.length - 1 ? ")" : ""}`
            )
            .join("\r\n")}`;
    }
  };

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

    ${accountsSQLFilter()}
    ${selectedAccountSQLFilter()}
    ${mailboxesSQLFilter()}
    ${mailboxesMessageIdsSQLFilter()}
    ${messageViewSQLFilter()}
    
    ORDER BY
messages.display_date DESC
    LIMIT 40
  `;

  const { isLoading, data, revalidate } = useSQL<MessageItem>(getMailDbPath(), mailsQuery, {
    onData: (data) => {
      setCachedData(data);
    },
  });

  const updateMessageFilters = (messageFilter: MessageFilters) => {
    if (messageFilter.enabled && !Object.values(messageFilter.options).some((option) => option)) {
      messageFilter.options[0].enabled = true;
    }
    setMessageFilters(JSON.stringify(messageFilter));
    getEnabledFilters();
  };

  useEffect(() => {
    const setup = async () => {
      const accounts = await getAccounts();
      const mailboxes = await getMailboxes(props.name);
      const mailboxMessageIds = await getMailboxMessageIds(props.name);
      // const mailboxUnreadCount = await getMailboxUnreadCount(props.name);
      const mailboxName = await getMailboxName(props.name);
      setMailboxName(mailboxName);
      setAccounts(accounts);
      setMailboxes(mailboxes);
      setMailboxMessageIds(mailboxMessageIds);
      // setMailboxUnreadCount(mailboxUnreadCount);
    };
    setup();
  }, []);

  const dataToRender = data || cachedData;

  const sortedData = _.orderBy(dataToRender, ["display_date"], ["desc"]);

  const groupedData = _.groupBy(dataToRender, (item) => item.conversation_id);

  const conversationKeys = Object.keys(_.groupBy(sortedData, "conversation_id"));

  if (!dataToRender)
    return (
      <List>
        <List.EmptyView title="No emails found" />
      </List>
    );

  const AccountsDropdown = () => (
    <List.Dropdown onChange={setSelectedAccount} value={selectedAccount} tooltip="Select account">
      <List.Dropdown.Section>
        <List.Dropdown.Item icon={Icon.Envelope} title={mailboxName} value="all" />
      </List.Dropdown.Section>
      {(accounts || []).map((account) => (
        <List.Dropdown.Item key={account.id} icon={Icon.Tray} title={account.name} value={account.id} />
      ))}
    </List.Dropdown>
  );
  const getEnabledFilters = () => {
    if (!parsedMessageFilters.enabled) return undefined;

    // function that rerurns the enabled filters
    const enabledFilters = parsedMessageFilters.options
      .filter((option) => option.enabled)
      ?.map((option) => option.name);

    return enabledFilters.length && !isLoading
      ? `Filter by: ${enabledFilters.join(" or ")} (${dataToRender?.length.toString()})`
      : "";
  };

  const renderConversations = conversationKeys?.reverse().map((key) => {
    const conversation = groupedData[key];
    if (conversation.length === 1) {
      return (
        <MessageListItem
          key={key}
          message={conversation[0]}
          messageFilters={parsedMessageFilters}
          updateMessageFilter={updateMessageFilters}
          revalidate={revalidate}
        />
      );
    } else {
      return (
        <ConversationListItem
          key={key}
          messages={conversation}
          messageFilters={parsedMessageFilters}
          updateMessageFilter={updateMessageFilters}
          revalidate={revalidate}
        />
      );
    }
  });

  const sectionTitle =
    selectedAccount !== "all" ? "Inbox - " + accounts.find((acc) => acc.id === selectedAccount)?.name : mailboxName;

  return (
    <List
      isLoading={isLoading || mailboxMessageIds.length === 0 || accounts.length === 0 || mailboxes.length === 0}
      searchBarAccessory={<AccountsDropdown />}
      actions={
        <ActionPanel>
          <ActionsMessageFilter messageFilters={parsedMessageFilters} updateMessageFilter={updateMessageFilters} />
        </ActionPanel>
      }
    >
      <List.Section title={sectionTitle} subtitle={getEnabledFilters()}>
        {renderConversations}
      </List.Section>
    </List>
  );
};
