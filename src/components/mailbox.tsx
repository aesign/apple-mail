import { ActionPanel, Clipboard, Icon, List, showToast, Toast } from "@raycast/api";
import { useCachedState, useSQL } from "@raycast/utils";
import _ from "lodash";
import { useEffect } from "react";
import { Account, MailboxNames, MessageFilters, MessageItem } from "../types";
import { getAccounts, getMailboxes, getMailboxMessageIds, getMailboxName } from "../utils/mail";
import { getMailDbPath } from "../utils/misc";
import { mailboxQuery } from "../utils/sqlQueries";
import { ActionsMessageFilter } from "./actionsMessageFilter";
import { MessageListItem } from "./messageListItem";

export const Mailbox = (props: { name: MailboxNames }) => {
  const [accounts, setAccounts] = useCachedState<Account[]>("enabled-accounts", []);
  const [mailboxName, setMailboxName] = useCachedState<string>("mailbox-name", "Inbox");
  const [mailboxes, setMailboxes] = useCachedState<string[]>("mailboxes", []);
  const [cachedData, setCachedData] = useCachedState<MessageItem[]>("data", []);
  const [selectedAccount, setSelectedAccount] = useCachedState<string>("selected-account", "all");
  const [mailboxMessageIds, setMailboxMessageIds] = useCachedState<number[]>("mailbox-message-ids", []);
  const [messageFilters, setMessageFilters] = useCachedState<string>(
    "message-filters",
    JSON.stringify({
      enabled: false,
      options: [
        { name: "Unread", dbKey: "read", defaultFilterValue: 0, enabled: true },
        { name: "Flagged", dbKey: "flagged", defaultFilterValue: 1, enabled: false },
      ],
    })
  );

  // const [isShowingDetail, setShowingDetail] = useCachedState<boolean>("is-showing-detail", false);
  // const [mailboxUnreadCount, setMailboxUnreadCount] = useCachedState<number>("mailbox-unread-count", 0);

  const parsedMessageFilters = JSON.parse(messageFilters) as MessageFilters;

  // workaround for gmail accounts having same "Al Mail" mailbox both for inbox and archive
  const filterData = (data: MessageItem[]) => data?.filter((m) => mailboxMessageIds.some((p) => p === m.ROWID));

  const { isLoading, data, revalidate } = useSQL<MessageItem>(
    getMailDbPath(),
    mailboxQuery({
      mailboxes: mailboxes,
      accounts: accounts,
      selectedAccount: selectedAccount,
      mailboxMessageIds: mailboxMessageIds,
      messageFilter: parsedMessageFilters,
    }),
    {
      onData: (data) => {
        setCachedData(filterData(data));
      },
    }
  );

  const updateMessageFilters = (messageFilter: MessageFilters) => {
    // const allMessageFiltersDisabled = () => {
    //   return messageFilter.options.every((option) => !option.enabled);
    // };

    // const anyMessageFiltersEnabled = () => {
    //   return messageFilter.options.some((option) => option.enabled);
    // };

    // if (allMessageFiltersDisabled() && messageFilter.enabled) {
    //   messageFilter.enabled = false;
    // }

    // if (anyMessageFiltersEnabled() && !messageFilter.enabled) {
    //   messageFilter.enabled = true;
    // }

    // if (messageFilter.enabled && allMessageFiltersDisabled()) {
    //   messageFilter.options[0].enabled = true;
    // }

    // if (!messageFilter.enabled && Object.values(messageFilter.options).some((option) => option)) {
    //   messageFilter.enabled = true;
    // }
    setMessageFilters(JSON.stringify(messageFilter));
    getEnabledFilters();
  };

  Clipboard.copy(
    mailboxQuery({
      mailboxes: mailboxes,
      accounts: accounts,
      selectedAccount: selectedAccount,
      mailboxMessageIds: mailboxMessageIds,
      messageFilter: parsedMessageFilters,
    })
  );

  useEffect(() => {
    const setup = async () => {
      const errors = [];
      try {
        const accounts = await getAccounts();
        setAccounts(accounts);
      } catch (e) {
        errors.push({ title: "accounts", detail: (e as ErrorEvent).message });
      }

      try {
        const mailboxes = await getMailboxes(props.name);
        setMailboxes(mailboxes);
      } catch (e) {
        errors.push({ title: "mailboxes", detail: (e as ErrorEvent).message });
      }
      try {
        const mailboxMessageIds = await getMailboxMessageIds(props.name);
        setMailboxMessageIds(mailboxMessageIds);
      } catch (e) {
        errors.push({ title: "message ids", detail: (e as ErrorEvent).message });
      }
      try {
        const mailboxName = await getMailboxName(props.name);
        setMailboxName(mailboxName);
      } catch (e) {
        errors.push({ title: "mailbox name", detail: (e as ErrorEvent).message });
      }

      if (errors.length > 0) {
        showToast(
          Toast.Style.Failure,
          `Failed to fetch ${errors.map((e) => e.title).join(", ")}`,
          errors.map((e) => e.detail).join(", ")
        );
      }
      // const mailboxUnreadCount = await getMailboxUnreadCount(props.name);
      // setMailboxUnreadCount(mailboxUnreadCount);
    };
    setup();
  }, []);

  const dataToRender = (data && filterData(data)) || cachedData;

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
        <List.Dropdown.Item icon={Icon.Envelope} title={"All Accounts"} value="all" />
      </List.Dropdown.Section>
      {(accounts || []).map((account) => (
        <List.Dropdown.Item key={account.id} icon={Icon.Tray} title={account.name} value={account.id} />
      ))}
    </List.Dropdown>
  );
  const getEnabledFilters = () => {
    if (!parsedMessageFilters.enabled) return undefined;

    const enabledFilters = parsedMessageFilters.options
      .filter((option) => option.enabled)
      ?.map((option) => option.name);

    return enabledFilters.length
      ? `Filter by: ${enabledFilters.join(" or ")} (${dataToRender?.length.toString()})`
      : "";
  };

  const sectionTitle =
    selectedAccount !== "all" ? "Inbox - " + accounts.find((acc) => acc.id === selectedAccount)?.name : mailboxName;

  const loading = isLoading || mailboxMessageIds.length === 0 || accounts.length === 0 || mailboxes.length === 0;

  return (
    <List
      isLoading={loading}
      searchBarAccessory={<AccountsDropdown />}
      actions={
        <ActionPanel>
          <ActionsMessageFilter messageFilters={parsedMessageFilters} updateMessageFilter={updateMessageFilters} />
        </ActionPanel>
      }
    >
      <List.Section title={sectionTitle} subtitle={getEnabledFilters()}>
        {conversationKeys?.reverse().map((key) => {
          const conversation = groupedData[key];
          return (
            <MessageListItem
              key={key}
              messages={conversation}
              messageFilters={parsedMessageFilters}
              updateMessageFilter={updateMessageFilters}
              revalidate={revalidate}
              mailboxes={mailboxes}
              accounts={accounts}
            />
          );
        })}
      </List.Section>
    </List>
  );
};
