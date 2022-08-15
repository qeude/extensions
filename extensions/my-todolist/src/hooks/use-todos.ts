import { useCallback, useEffect, useState } from "react";
import { showToast, Toast } from "@raycast/api";

import { loadStatus, loadTodos, storeTodos } from "@/services/storage";
import { getTodos } from "../services/notion/operations/get-todos";
import { createTodo } from "../services/notion/operations/create-todo";
import { updateTodoStatus } from "../services/notion/operations/update-todo-status";

import { Todo } from "@/types/todo";
import { Status, StatusValue } from "@/types/status";
import { getDatabase } from "../services/notion/operations/get-database";
import { formatNotionUrl } from "../services/notion/utils/format-notion-url";
import { getTitleUrl } from "../services/notion/utils/get-title-url";

export function useTodos() {
  const [data, setData] = useState<Todo[] | null>(null);
  const [notionDbUrl, setNotionDbUrl] = useState<string>("");
  const [todos, setTodos] = useState<Todo[]>([]);
  const [status, setStatus] = useState<Status[]>([]);
  const [searchText, setSearchText] = useState<string>("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState<boolean>(true);

  const getInitialData = async () => {
    try {
      const localTodos = await loadTodos();
      setData(localTodos);
      const localStatus = await loadStatus();
      setStatus(localStatus);

      const { status, databaseId, databaseUrl } = await getDatabase();
      const fetchedTodos = await getTodos(databaseId, localTodos);

      setStatus(status);
      setNotionDbUrl(formatNotionUrl(databaseUrl));
      setData(fetchedTodos);
    } catch (e) {
      showToast(Toast.Style.Failure, "Error occurred");
    } finally {
      setLoading(false);
    }
  };

  function wait(ms: any, opts: { signal?: any }) {
    return new Promise((resolve, reject) => {
      const timerId = setTimeout(resolve, ms);
      if (opts.signal) {
        // implement aborting logic for our async operation
        opts.signal.addEventListener("abort", (event: any) => {
          clearTimeout(timerId);
          reject(event);
        });
      }
    });
  }

  const handleCreate = useCallback(async () => {
    try {
      if (!data) return null;
      setLoading(true);
      const item = status.find((t) => t.id === filter) ?? status.find((t) => t.name === StatusValue.NotStarted)!;
      const optimisticTodo: Todo = {
        id: `fake-id-${Math.random() * 100}`,
        title: searchText,
        status: item,
        url: "",
        contentUrl: getTitleUrl(searchText),
        lastEditedDateString: null,
      };

      setData([...data, optimisticTodo]);
      setSearchText("");

      const validatedTodo = await createTodo({
        title: searchText,
        statusId: item?.id,
      });

      const validatedData = [...data, validatedTodo];

      setData(validatedData);
      await storeTodos(validatedData);
    } catch (e) {
      showToast(Toast.Style.Failure, "Error occurred");
    } finally {
      setLoading(false);
    }
  }, [searchText]);

  const handleSetStatus = useCallback(
    async (todo: Todo, status: Status | null) => {
      try {
        if (!data) return null;
        setLoading(true);
        const optimisticData = data.map((t) => (t.id === todo.id ? { ...todo, status } : t));
        setData(optimisticData);
        const statusId = status?.id ? status.id : null;
        const validatedTodo = await updateTodoStatus(todo.id, statusId);
        const validatedData = data.map((t) => (t.id === validatedTodo.id ? validatedTodo : t));
        setData(validatedData);
        await storeTodos(validatedData);
      } catch (e) {
        showToast(Toast.Style.Failure, "Error occurred");
      } finally {
        setLoading(false);
      }
    },
    [data]
  );

  useEffect(() => {
    getInitialData();
  }, []);

  useEffect(() => {
    if (data) {
      if (searchText || filter !== "all") {
        setTodos(
          data.filter((item) => {
            const isTagAllowed = filter === "all" ? true : item.status?.id === filter;

            return item.title.toUpperCase().includes(searchText.toUpperCase()) && isTagAllowed;
          })
        );
      } else {
        setTodos(data);
      }
    }
  }, [data, searchText, filter]);

  return {
    todos,
    data,
    status,
    notionDbUrl,
    searchText,
    setSearchText,
    filter,
    setFilter,
    loading,
    handleCreate,
    handleSetStatus,
    getInitialData,
  };
}
