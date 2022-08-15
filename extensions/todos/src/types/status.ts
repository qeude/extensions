import { Color } from "@raycast/api";

export enum StatusValue {
  NotStarted = "Not started",
  InProgress = "In progress",
  Done = "Done",
}
export interface Status {
  id: string;
  name: StatusValue;
  color: Color;
}
