import { Preferences } from "@/types/preferences";
import { Todo } from "@/types/todo";
import { getPreferenceValues } from "@raycast/api";
import { getTitleUrl } from "./get-title-url";
import { mapPageStatus } from "./map-page-status";

export const mapPageToTodo = (page: any): Todo => {
  const preferences = getPreferenceValues<Preferences>();
  return {
    id: page.id,
    title: page.properties[preferences.property_title].title[0].text.content,
    status: page.properties[preferences.property_status].select
      ? mapPageStatus(page.properties[preferences.property_status].select)
      : null,
    url: page.url,
    contentUrl: getTitleUrl(page.properties[preferences.property_title].title[0].text.content),
    lastEditedDateString: page.properties[preferences.property_date].last_edited_time,
  };
};
