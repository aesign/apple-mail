import { run } from "@jxa/run";
import { MenuBarExtra, Icon, open, launchCommand, LaunchType } from "@raycast/api";
import { useCachedState } from "@raycast/utils";

export default function MenuBar() {
  const [count, setCount] = useCachedState<number>("unread-count", 0);

  (async () => {
    const count: number = await run(() => {
      const mail = Application("Mail");
      const unreadCount = mail.inbox().unreadCount();
      console.log(unreadCount);
      return unreadCount as number;
    });
    setCount(count);
  })();
  return (
    <MenuBarExtra icon={Icon.Envelope} title={count.toString()} isLoading={false}>
      <MenuBarExtra.Item
        title="View inbox"
        onAction={() => launchCommand({ name: "index", type: LaunchType.UserInitiated })}
      />
      <MenuBarExtra.Item title="Open in Mail" onAction={() => open("message://")} />
    </MenuBarExtra>
  );
}
