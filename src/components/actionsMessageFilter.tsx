import { Action, ActionPanel, Color, Icon } from "@raycast/api";
import { MessageFilters } from "../types";

export const ActionsMessageFilter = (props: {
  messageFilters: MessageFilters;
  updateMessageFilter: (messageFilter: MessageFilters) => void;
}) => (
  <ActionPanel.Section title="Message Filter">
    <Action
      title={`${!props.messageFilters.enabled ? "Enable" : "Disable"} Message Filter`}
      icon={Icon.Filter}
      shortcut={{ modifiers: ["cmd"], key: "l" }}
      onAction={() => {
        props.updateMessageFilter({ ...props.messageFilters, enabled: !props.messageFilters.enabled });
      }}
    />
    <ActionPanel.Submenu title="Include filters">
      {props.messageFilters?.options.map((filter, index) => (
        <Action
          key={index}
          title={`${filter.name}`}
          icon={filter.enabled ? Icon.Checkmark : "/empty.png"}
          onAction={() => {
            props.updateMessageFilter(
              props.messageFilters.options.find((f, i) => i === index)
                ? {
                    ...props.messageFilters,
                    options: props.messageFilters.options.map((f, i) =>
                      i === index ? { ...f, enabled: !f.enabled } : f
                    ),
                  }
                : props.messageFilters
            );
          }}
        />
      ))}
    </ActionPanel.Submenu>
  </ActionPanel.Section>
);
