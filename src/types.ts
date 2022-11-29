export interface Account {
  id: string;
  name: string;
}

export type MailboxNames = "inbox" | "sent" | "vip" | "junk" | "drafts";

export interface MessageFilters {
  enabled: boolean;
  options: MessageFilterOption[];
}

export interface ListItem {
  messageFilters: MessageFilters;
  updateMessageFilter: (messageFilter: MessageFilters) => void;
  revalidate: () => Promise<MessageItem[]>;
}

interface MessageFilterOption {
  name: string;
  dbKey: string;
  defaultFilterValue: 0 | 1;
  enabled: boolean;
}

export interface MessageItem {
  ROWID: number;
  message_id: string;
  sender: string;
  comment: string;
  subject_prefix: null | string;
  subject: string;
  summary: string;
  url: string;
  conversation_id: number;
  date_received: number;
  date_sent: number;
  display_date: number;
  mailbox: number;
  read: 0 | 1;
  flagged: number;
  flag_color: number;
  follow_up_start_date: number | null;
  follow_up_end_date: number | null;
  deleted: number;
}
