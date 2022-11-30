import { List, Icon, ActionPanel, showToast, Toast } from "@raycast/api";
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
    // function to check if all messageFilters are disabled
    const allMessageFiltersDisabled = () => {
      return messageFilter.options.every((option) => !option.enabled);
    };

    const anyMessageFiltersEnabled = () => {
      return messageFilter.options.some((option) => option.enabled);
    };

    console.log(messageFilter.enabled);

    // if (allMessageFiltersDisabled() && messageFilter.enabled) {
    //   messageFilter.enabled = false;
    // }

    // if (anyMessageFiltersEnabled() && !messageFilter.enabled) {
    //   messageFilter.enabled = true;
    // }

    // if (messageFilter.enabled && allMessageFiltersDisabled()) {
    //   messageFilter.options[0].enabled = true;
    // }

    console.log("allMessageFiltersDisabled", allMessageFiltersDisabled());
    // if (!messageFilter.enabled && Object.values(messageFilter.options).some((option) => option)) {
    //   messageFilter.enabled = true;
    // }
    setMessageFilters(JSON.stringify(messageFilter));
    getEnabledFilters();
  };

  useEffect(() => {
    const setup = async () => {
      try {
        const accounts = await getAccounts();
        console.log("accounts", accounts);
        const mailboxes = await getMailboxes(props.name);
        const mailboxMessageIds = await getMailboxMessageIds(props.name);
        // const mailboxUnreadCount = await getMailboxUnreadCount(props.name);
        const mailboxName = await getMailboxName(props.name);
        setMailboxName(mailboxName);
        setAccounts(accounts);
        setMailboxes(mailboxes);
        setMailboxMessageIds(mailboxMessageIds);
        // setMailboxUnreadCount(mailboxUnreadCount);
      } catch (e) {
        showToast(Toast.Style.Failure, "Error!", (e as Error).message);
      }
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
        <List.Dropdown.Item icon={Icon.Envelope} title={mailboxName} value="all" />
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
              message={conversation}
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
