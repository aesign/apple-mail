import { Color, Icon, List, ActionPanel, Action, open } from "@raycast/api";
import { MessageItem, ListItem } from "../types";
import { getFlagColor, openInMail, showInMail } from "../utils/mail";
import { convertTime } from "../utils/misc";
import { ActionsMessageActions } from "./actionsMessageActions";
import { ActionsMessageFilter } from "./actionsMessageFilter";

interface Props extends ListItem {
  message: MessageItem;
} 

export const MessageListItem = (props: Props) => {
  const id = props.message.ROWID.toString();
  const icon =
    props.message.read === 1
      ? { source: "/empty.png", tintColor: Color.SecondaryText }
      : { source: Icon.Dot, tintColor: Color.Blue };
  const title = props.message.comment || props.message.sender;
  const summmary =
    props.message.summary.length > 60 ? props.message.summary.substring(0, 60) + "..." : props.message.summary;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const accessories: any[] = [];

  props.message.flagged &&
    accessories.push({ icon: { source: Icon.Tag, tintColor: getFlagColor(props.message.flag_color) } });
  accessories.push({ text: convertTime(props.message.date_received) });

  return (
    <List.Item
      id={id}
      icon={icon}
      title={title}
      subtitle={summmary}
      accessories={accessories}
      detail={
        <List.Item.Detail
          markdown={props.message.summary}
          metadata={
            <List.Item.Detail.Metadata>
              <List.Item.Detail.Metadata.Label title="Types" />
              <List.Item.Detail.Metadata.Label title="Grass" icon="pokemon_types/grass.svg" />
              <List.Item.Detail.Metadata.Separator />
              <List.Item.Detail.Metadata.Label title="Poison" icon="pokemon_types/poison.svg" />
              <List.Item.Detail.Metadata.Separator />
              <List.Item.Detail.Metadata.Label title="Chracteristics" />
              <List.Item.Detail.Metadata.Label title="Height" text="70cm" />
              <List.Item.Detail.Metadata.Separator />
              <List.Item.Detail.Metadata.Label title="Weight" text="6.9 kg" />
              <List.Item.Detail.Metadata.Separator />
              <List.Item.Detail.Metadata.Label title="Abilities" />
              <List.Item.Detail.Metadata.Label title="Chlorophyll" text="Main Series" />
              <List.Item.Detail.Metadata.Separator />
              <List.Item.Detail.Metadata.Label title="Overgrow" text="Main Series" />
              <List.Item.Detail.Metadata.Separator />
            </List.Item.Detail.Metadata>
          }
        />
      }
      actions={
        <ActionPanel>
          <Action
            title="Open in Mail"
            onAction={async () => {
              console.log(props.message.ROWID, props.message.url);
              const messageId = await openInMail(props.message.ROWID);
              open(`message://%3c${messageId}%3e`);
              props.revalidate();
            }}
          />
          <Action
            title="Show in Mail"
            onAction={async () => {
              console.log(props.message.ROWID, props.message.url);
              await showInMail(props.message.ROWID);
              props.revalidate();
            }}
          />
          <ActionsMessageActions message={props.message} revalidate={props.revalidate} />
          <ActionsMessageFilter messageFilters={props.messageFilters} updateMessageFilter={props.updateMessageFilter} />
        </ActionPanel>
      }
    />
  );
};
