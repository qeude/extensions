import { LocalStorage } from "@raycast/api";
import { Todo } from "@/types/todo";
import { Status } from "@/types/status";

export const loadDatabase = async (): Promise<{
  databaseUrl: string;
  databaseId: string;
}> => {
  const database: string | undefined = await LocalStorage.getItem("NOTION_DATABASE");
  return JSON.parse(database || "{}");
};

export const storeDatabase = (database: { databaseUrl: string; databaseId: string }) => {
  return LocalStorage.setItem("NOTION_DATABASE", JSON.stringify(database));
};

export const loadStatus = async (): Promise<Status[]> => {
  const status: string | undefined = await LocalStorage.getItem("NOTION_STATUS");
  return JSON.parse(status || "[]");
};

export const storeStatus = (status: any[]) => {
  return LocalStorage.setItem("NOTION_STATUS", JSON.stringify(status));
};

export const loadTodos = async () => {
  const localTodos: string | undefined = await LocalStorage.getItem("NOTION_TODOS");
  return JSON.parse(localTodos || "[]") as Todo[];
};

export const storeTodos = (todos: any[]) => {
  return LocalStorage.setItem("NOTION_TODOS", JSON.stringify(todos));
};
