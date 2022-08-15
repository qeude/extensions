import { Preferences } from "@/types/preferences";
import { TodoPage } from "@/types/todo-page";
import { isNotionClientError } from "@notionhq/client";
import { getPreferenceValues, showToast, Toast } from "@raycast/api";
import { notion } from "../client";
import { mapPageToTodo } from "../utils/map-page-to-todo";

export async function updateTodoStatus(
  pageId: string,
  labelId: string | null
): Promise<any> {
  try {
    const notionClient = await notion();
    const statusProperty = getPreferenceValues<Preferences>().property_status;
    const page = await notionClient.pages.update({
      page_id: pageId,
      properties: {
        [statusProperty]: {
          select: labelId ? { id: labelId } : null,
        },
      },
    });

    return mapPageToTodo(page as TodoPage);
  } catch (err) {
    if (isNotionClientError(err)) {
      showToast(Toast.Style.Failure, err.message);
    } else {
      showToast(
        Toast.Style.Failure,
        "Error occurred check that you have a Label property"
      );
    }
    return undefined;
  }
}
