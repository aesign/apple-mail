import { run } from "@jxa/run";
import "@jxa/global-type";
import { Mail } from "@jxa/types/src/core/Mail";
import { Account, MailboxNames } from "../types";
import { Color } from "@raycast/api";

export const getAccounts = async () => {
  try {
    const result = await run(() => {
      const mail = Application("Mail");
      const accounts: Account[] = [];
      mail
        .accounts()
        .map((account: { enabled: () => any; name: () => any; id: () => any; mailboxes: () => Mail.Mailbox[] }) => {
          account.enabled() &&
            accounts.push({
              name: account.name(),
              id: account.id(),
              mailboxes: account.mailboxes().map((mailbox: Mail.Mailbox) => mailbox.name()),
            });
        });
      return accounts;
    });

    return result as Account[];
  } catch (e) {
    throw new Error((e as Error).message);
  }
};

export const openInMail = async (id: number): Promise<string> => {
  try {
    const result = await run(
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
    return result as string;
  } catch (e) {
    throw new Error((e as Error).message);
  }
};

export const moveMail = async (id: number[], mailboxName: string): Promise<string> => {
  try {
    const result = await run(
      ({ id, mailboxName }) => {
        const mail = Application("Mail");
        id.map((idMap: number) => {
          console.log(id);
          const message = mail
            .inbox()
            .messages()
            .find((message: Mail.Message) => message.id() === idMap);
          const account = message.mailbox().account();
          const mailbox = account.mailboxes().find((mailbox: Mail.Mailbox) => mailbox.name() === mailboxName);
          return mail.move(message, { to: mailbox });
        });
      },
      { id, mailboxName }
    );
    return result as string;
  } catch (e) {
    throw new Error((e as Error).message);
  }
};

// todo: fix deleting multiple messages

export const deleteMail = async (id: number[]) => {
  try {
    await run(
      ({ id }) => {
        const mail = Application("Mail");
        console.log("array");
        id.forEach((idMap: number) => {
          const message = mail
            .inbox()
            .messages()
            .find((message: Mail.Message) => message.id() === idMap);
          return mail.delete(message);
        });
      },
      { id }
    );
  } catch (e) {
    throw new Error((e as Error).message);
  }
};

export const copyMail = async (id: number[], mailboxName: string): Promise<string> => {
  try {
    const result = await run(
      ({ id, mailboxName }) => {
        const mail = Application("Mail");
        id.map((idMap: number) => {
          console.log(id);
          const message = mail
            .inbox()
            .messages()
            .find((message: Mail.Message) => message.id() === idMap);
          const account = message.mailbox().account();
          const mailbox = account.mailboxes().find((mailbox: Mail.Mailbox) => mailbox.name() === mailboxName);
          return mail.duplicate(message, { to: mailbox });
        });
      },
      { id, mailboxName }
    );
    return result as string;
  } catch (e) {
    throw new Error((e as Error).message);
  }
};

// doesn't work
export const showInMail = async (id: number): Promise<string> =>
  await run(
    ({ id }) => {
      const mail = Application("Mail");
      mail.messageViewers[0].messages().map((msg: Mail.Message, index: number) => {
        // console.log(msg.id(), msg.sender(), msg.id() === id);
        if (msg.id() === id) {
          console.log(msg.subject(), index);

          // const newMessageViewer  = mail.messageViewers[0]
          // mail.messageViewers[0].selectedMessages = [];
          // newMessageViewer.selectedMessages = newMessageViewer.messages().find((msg: Mail.Message) => msg.id() === id);
          // mail.messageViewers.push(newMessageViewer);
        }
      });
    },
    { id }
  );

export const markAsRead = async (id: number[], read: boolean) => {
  try {
    await run(
      ({ id, read }) => {
        const mail = Application("Mail");
        id.map((idMap: number) => {
          const message = mail
            .inbox()
            .messages()
            .find((message: Mail.Message) => message.id() === idMap);
          message.readStatus = read;
        });
      },
      { id, read }
    );
  } catch (e) {
    throw new Error((e as Error).message);
  }
};

export const toggleFlag = async (id: number[], flag: boolean): Promise<boolean> => {
  try {
    const result = await run(
      ({ id, flag }) => {
        const mail = Application("Mail");
        id.map((idMap: number) => {
          console.log(id);
          const message = mail
            .inbox()
            .messages()
            .find((message: Mail.Message) => message.id() === idMap);
          message.flaggedStatus = flag;
        });
      },
      { id, flag }
    );
    return result as boolean;
  } catch (e) {
    throw new Error((e as Error).message);
  }
};

// doesnt work
export const setFlag = async (id: number[], flagIndex: number): Promise<number> => {
  try {
    const result = await run(
      ({ id, flagIndex }) => {
        const mail = Application("Mail");
        id.map((idMap: number) => {
          console.log(id);
          const message = mail
            .inbox()
            .messages()
            .find((message: Mail.Message) => message.id() === idMap);
          message.flagIndex = flagIndex;
        });
      },
      { id, flagIndex }
    );
    return result as number;
  } catch (e) {
    throw new Error((e as Error).message);
  }
};

export const reply = async (id: number, toAll: boolean): Promise<Mail.Message> => {
  try {
    const result = await run(
      ({ id, toAll }) => {
        const mail = Application("Mail");
        const message = mail
          .inbox()
          .messages()
          .find((message: Mail.Message) => message.id() === id);
        mail.reply(message, { openingWindow: true, replyToAll: toAll });
        mail.activate();
      },
      { id, toAll }
    );
    return result as Mail.Message;
  } catch (e) {
    throw new Error((e as Error).message);
  }
};

export const forward = async (id: number): Promise<Mail.Message> => {
  try {
    const result = await run(
      ({ id }) => {
        const mail = Application("Mail");
        const message = mail
          .inbox()
          .messages()
          .find((message: Mail.Message) => message.id() === id);
        mail.forward(message, { openingWindow: true });
        mail.activate();
      },
      { id }
    );
    return result as Mail.Message;
  } catch (e) {
    throw new Error((e as Error).message);
  }
};

export const getMailboxes = async (mailboxName: MailboxNames): Promise<string[]> => {
  try {
    const result = await run(
      () => {
        const mail = Application("Mail");
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
    );

    return result as string[];
  } catch (e) {
    throw new Error((e as Error).message);
  }
};

export const getMessageId = async (id: number): Promise<string> => {
  try {
    const result = await run(
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
    return result as string;
  } catch (e) {
    throw new Error((e as Error).message);
  }
};

export const getMailboxMessageIds = async (mailboxName: MailboxNames): Promise<number[]> => {
  try {
    const result = await run(
      () => {
        const mail = Application("Mail");
        const ids = mail
          .inbox()
          .messages()
          .map((message: Mail.Message) => message.id());
        return ids as number[];
      },
      { mailboxName }
    );
    return result as number[];
  } catch (e) {
    throw new Error((e as Error).message);
  }
};

export const getMailboxUnreadCount = async (mailboxName: MailboxNames): Promise<number> => {
  try {
    const result = await run(
      () => {
        const mail = Application("Mail");
        const unreadCount = mail.inbox().unreadCount();
        return unreadCount as number;
      },
      { mailboxName }
    );
    return result as number;
  } catch (e) {
    throw new Error((e as Error).message);
  }
};

export const getMailboxName = async (mailboxName: MailboxNames): Promise<string> => {
  try {
    const result = await run(
      () => {
        const mail = Application("Mail");
        const name = mail.inbox().name();
        return name as string;
      },
      { mailboxName }
    );
    return result as string;
  } catch (e) {
    throw new Error((e as Error).message);
  }
};

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
