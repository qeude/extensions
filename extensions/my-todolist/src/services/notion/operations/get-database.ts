import { storeDatabase, storeStatus } from "@/services/storage";
import { Preferences } from "@/types/preferences";
import { Status } from "@/types/status";
import { isNotionClientError } from "@notionhq/client";
import { getPreferenceValues, showToast, Toast } from "@raycast/api";
import { notion } from "../client";
import { mapPageStatus } from "../utils/map-page-status";

export async function getDatabase(): Promise<{
  databaseId: string;
  databaseUrl: string;
  status: Status[];
}> {
  try {
    const notionClient = await notion();

    const preferences = getPreferenceValues<Preferences>();

    const databases = await notionClient.search({
      query: preferences.database_name,
      filter: { property: "object", value: "database" },
    });

    const database: any = databases.results[0];
    const databaseId = database.id;
    const databaseUrl = database.url;
    const availableStatus: any[] =
      database?.properties[preferences.property_status]?.select?.options ?? [];

    const status = availableStatus.map(mapPageStatus);
    await storeDatabase({ databaseId, databaseUrl });
    await storeStatus(status);

    return { databaseId, databaseUrl, status };
  } catch (err) {
    if (isNotionClientError(err)) {
      showToast(Toast.Style.Failure, err.message);
    } else {
      showToast(Toast.Style.Failure, "Failed to fetch database");
    }
    return { databaseId: "", databaseUrl: "", status: [] };
  }
}
