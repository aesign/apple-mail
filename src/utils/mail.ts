import { run } from "@jxa/run";
import "@jxa/global-type";
import { Mail } from "@jxa/types/src/core/Mail";
import { Account, MailboxNames } from "../types";
import { Clipboard, Color } from "@raycast/api";

export const getAccounts = async () => {
  const result = await run(() => {
    const mail = Application("Mail");
    const accounts: Account[] = [];
    mail
      .accounts()
      .map((account: Mail.Account) => account.enabled() && accounts.push({ name: account.name(), id: account.id() }));
    return accounts;
  });

  return result as Account[];
};

export const openInMail = async (id: number): Promise<string> =>
  await run(
    ({ id }) => {
      const mail = Application("Mail");
      const message = mail
        .inbox()
        .messages()
        .find((message: Mail.Message) => message.id() === id);
      const messageId = message.messageId();
      return messageId;
    },
    { id }
  );

export const showInMail = async (id: number): Promise<string> =>
  await run(
    ({ id }) => {
      const mail = Application("Mail");
      const message = mail
        .inbox()
        .messages()
        .find((message: Mail.Message) => message.id() === id);
      mail.messageViewers[0].messages().map((msg: { id: () => any; subject: () => any }, index: string | number) => {
        if (msg.id() === id) {
          console.log(msg.subject(), index);
          mail.messageViewers[0].messages[index];
        }
      });
      // mail.messageViewers[0].selectedMessages = [];
      // mail.messageViewers[0].selectedMessages = message;
      // mail.activate()
    },
    { id }
  );

export const markAsRead = async (id: number | number[], read: boolean): Promise<boolean> =>
  await run(
    ({ id, read }) => {
      const mail = Application("Mail");
      const newId = id as number | number[];
      if (Array.isArray(newId)) {
        newId.map((idMap) => {
          console.log(id);
          const message = mail
            .inbox()
            .messages()
            .find((message: Mail.Message) => message.id() === idMap);
          message.readStatus = read;
        });
      } else {
        console.log("not array");
        const message = mail
          .inbox()
          .messages()
          .find((message: Mail.Message) => message.id() === id);
        message.readStatus = read;
      }
    },
    { id, read }
  );

export const toggleFlag = async (id: number | number[], flag: boolean): Promise<boolean> =>
  await run(
    ({ id, flag }) => {
      const mail = Application("Mail");
      const newId = id as number | number[];
      if (Array.isArray(newId)) {
        newId.map((idMap) => {
          console.log(id);
          const message = mail
            .inbox()
            .messages()
            .find((message: Mail.Message) => message.id() === idMap);
          message.flaggedStatus = flag;
        });
      } else {
        console.log("not array");
        const message = mail
          .inbox()
          .messages()
          .find((message: Mail.Message) => message.id() === id);
        message.flaggedStatus = flag;
      }
    },
    { id, flag }
  );
export const clearFlag = async (id: number): Promise<boolean> =>
  await run(
    ({ id }) => {
      const mail = Application("Mail");
      const message = mail
        .inbox()
        .messages()
        .find((message: Mail.Message) => message.id() === id);
      message.flaggedStatus = false;
    },
    { id }
  );

export const setFlag = async (id: number, flagIndex: number): Promise<boolean> =>
  await run(
    ({ id }) => {
      const mail = Application("Mail");
      const message = mail
        .inbox()
        .messages()
        .find((message: Mail.Message) => message.id() === id);
      message.flagIndex = flagIndex;
    },
    { id }
  );

export const reply = async (id: number): Promise<Mail.Message> =>
  await run(
    ({ id }) => {
      const mail = Application("Mail");
      const message = mail
        .inbox()
        .messages()
        .find((message: Mail.Message) => message.id() === id);
      mail.reply(message, { openingWindow: true });
    },
    { id }
  );

export const forward = async (id: number): Promise<Mail.Message> =>
  await run(
    ({ id }) => {
      const mail = Application("Mail");
      const message = mail
        .inbox()
        .messages()
        .find((message: Mail.Message) => message.id() === id);
      mail.forward(message, { openingWindow: true });
    },
    { id }
  );

export const replyToAll = async (id: number): Promise<Mail.Message> =>
  await run(
    ({ id }) => {
      const mail = Application("Mail");
      const message = mail
        .inbox()
        .messages()
        .find((message: Mail.Message) => message.id() === id);
      mail.reply(message, { openingWindow: true, replyToAll: true });
    },
    { id }
  );

export const getMailboxes = async (mailboxName: MailboxNames): Promise<string[]> =>
  (await run(
    (mailboxName: MailboxNames) => {
      const mail = Application("Mail");
      let mailbox;
      switch (mailboxName) {
        case "inbox":
          mailbox = mail.inbox();
          break;
        case "sent":
          mailbox = mail.inbox();
      }
      return [
        ...new Set(
          mail
            .inbox()
            .messages()
            .map((message: Mail.Message) => message.mailbox().name())
        ),
      ] as string[];
    },
    { mailboxName }
  )) as string[];

export const getMailboxMessageIds = async (mailboxName: MailboxNames): Promise<number[]> =>
  (await run(
    (mailboxName: MailboxNames) => {
      const mail = Application("Mail");
      let mailbox;
      switch (mailboxName) {
        case "inbox":
          mailbox = mail.inbox();
          break;
        case "sent":
          mailbox = mail.inbox();
      }
      const ids = mail
        .inbox()
        .messages()
        .map((message: Mail.Message) => message.id());
      return ids as number[];
    },
    { mailboxName }
  )) as number[];

export const getMailboxUnreadCount = async (mailboxName: MailboxNames): Promise<number> =>
  (await run(
    (mailboxName: MailboxNames) => {
      const mail = Application("Mail");
      let mailbox;
      switch (mailboxName) {
        case "inbox":
          mailbox = mail.inbox();
          break;
        case "sent":
          mailbox = mail.inbox();
      }
      const unreadCount = mail.inbox().unreadCount();
      return unreadCount as number;
    },
    { mailboxName }
  )) as number;

export const getMailboxName = async (mailboxName: MailboxNames): Promise<string> =>
  (await run(
    (mailboxName: MailboxNames) => {
      const mail = Application("Mail");
      let mailbox;
      switch (mailboxName) {
        case "inbox":
          mailbox = mail.inbox();
          break;
        case "sent":
          mailbox = mail.inbox();
      }
      const name = mail.inbox().name();
      return name as string;
    },
    { mailboxName }
  )) as string;

export const getFlagColor = (flagIndex: number) => {
  switch (flagIndex) {
    case 0:
      return Color.Red;
    case 1:
      return Color.Orange;
    case 2:
      return Color.Yellow;
    case 3:
      return Color.Green;
    case 4:
      return Color.Blue;
    case 5:
      return Color.Purple;
    case 6:
      return Color.SecondaryText;
    default:
      Color.SecondaryText;
  }
};
