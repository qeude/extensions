import { Status } from "./status";

export interface Todo {
  id: string;
  title: string;
  status: Status;
  url: string;
  contentUrl: string | null;
  lastEditedDateString: string;
}
