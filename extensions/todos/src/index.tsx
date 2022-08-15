import { Action, ActionPanel, Color, Icon, List } from "@raycast/api";
import { TodoItem } from "./components/todo-item";
import { useTodos } from "./hooks/use-todos";
import { getIconForStatus } from "./services/notion/utils/get-icon-for-status";
import { StatusValue } from "./types/status";

export default function App() {
  const {
    todos,
    data,
    status,
    notionDbUrl,
    searchText,
    setSearchText,
    loading,
    handleCreate,
    handleSetStatus,
    setFilter,
    filter,
    getInitialData,
  } = useTodos();

  const doneTodos = todos.filter((todo) => todo.status.name === StatusValue.Done);
  const todoTodos = todos.filter((todo) => todo.status.name !== StatusValue.Done);
  return (
    <List
      isLoading={loading}
      searchText={searchText}
      onSearchTextChange={setSearchText}
      searchBarPlaceholder="Filter or create to-do"
      searchBarAccessory={
        <List.Dropdown tooltip="Filter by status" value={filter} onChange={setFilter}>
          <List.Dropdown.Item title="All" value={"all"} />
          {status.map((item) => (
            <List.Dropdown.Item key={item.id} icon={getIconForStatus(item)} title={item.name} value={item.id} />
          ))}
        </List.Dropdown>
      }
    >
      {searchText ? (
        <List.Item
          icon={{ source: Icon.Plus, tintColor: Color.Blue }}
          title={`Create "${searchText}"`}
          actions={
            <ActionPanel>
              <Action icon={Icon.Plus} title="Create To-do" onAction={handleCreate} />
              <Action.OpenInBrowser
                title="Open Database"
                icon={Icon.Binoculars}
                url={notionDbUrl}
                shortcut={{ modifiers: ["cmd"], key: "i" }}
              />
            </ActionPanel>
          }
        />
      ) : null}
      <List.Section title={"To-Do"}>
        {todoTodos.length > 0
          ? todoTodos.map((todo) => <TodoItem todo={todo} status={status} handleSetStatus={handleSetStatus} />)
          : null}
      </List.Section>
      <List.Section title={StatusValue.Done}>
        {doneTodos.length > 0
          ? doneTodos
              .sort((a, b) => {
                if (b.lastEditedDateString !== null && a.lastEditedDateString !== null) {
                  return new Date(b.lastEditedDateString).getTime() - new Date(a.lastEditedDateString).getTime();
                }
                return -1;
              })
              .map((todo) => <TodoItem todo={todo} status={status} handleSetStatus={handleSetStatus} />)
          : null}
      </List.Section>
    </List>
  );
}
