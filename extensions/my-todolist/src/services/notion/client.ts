import { Preferences } from "@/types/preferences";
import { Client } from "@notionhq/client";
import { getPreferenceValues } from "@raycast/api";

export async function notion() {
  return new Client({
    auth: getPreferenceValues<Preferences>().notion_token,
  });
}
