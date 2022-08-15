import { Action, ActionPanel, Color, Icon } from "@raycast/api";
import { Todo } from "@/types/todo";
import { Status } from "@/types/status";

type SetStatusAction = {
  todo: Todo;
  status: Status[];
  onSetStatus: (todo: Todo, status: Status | null) => void;
};

export function SetStatusAction({
  todo,
  status,
  onSetStatus,
}: SetStatusAction) {
  return (
    <ActionPanel.Submenu
      title="Set Status"
      icon={{
        source: Icon.Tag,
        tintColor: Color.PrimaryText,
      }}
      shortcut={{ modifiers: ["cmd"], key: "l" }}
    >
      {status.map((item) => (
        <Action
          key={item.id}
          icon={{
            source: Icon.Dot,
            tintColor: item.color,
          }}
          title={item.name}
          onAction={() => onSetStatus(todo, item)}
        />
      ))}
      <Action.OpenInBrowser title="Create" icon={Icon.Plus} url={todo.url} />
    </ActionPanel.Submenu>
  );
}
