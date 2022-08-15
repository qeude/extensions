import { getIconForStatus } from "@/services/notion/utils/get-icon-for-status";
import { Status } from "@/types/status";
import { Todo } from "@/types/todo";
import { Action, ActionPanel, Icon, List } from "@raycast/api";
import { SetStatusAction } from "./set-status-action";

export function TodoItem({
  todo,
  status,
  handleSetStatus,
}: {
  todo: Todo;
  status: Status[];
  handleSetStatus: (todo: Todo, status: Status | null) => Promise<null | undefined>;
}) {
  return (
    <List.Item
      key={todo.id}
      icon={{
        tooltip: todo.status.name,
        value: getIconForStatus(todo.status),
      }}
      title={todo.title}
      actions={
        <ActionPanel>
          <SetStatusAction todo={todo} status={status} onSetStatus={handleSetStatus} />
          <Action.OpenInBrowser
            title="Open in Notion"
            icon={Icon.Window}
            url={todo.url}
            shortcut={{ modifiers: ["cmd"], key: "o" }}
          />
        </ActionPanel>
      }
    />
  );
}
