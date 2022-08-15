import { Status } from "@/types/status";
import { Color } from "@raycast/api";
import { notionColorToTintColor } from "./notion-color-to-tint-color";

export const mapPageStatus = (status: any): Status => {
  return {
    ...status,
    color: status.color ? notionColorToTintColor(status.color) : Color.Brown,
  };
};
