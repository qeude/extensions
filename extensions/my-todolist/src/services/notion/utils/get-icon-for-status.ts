import { Status, StatusValue } from "@/types/status";
import { Icon, Image } from "@raycast/api";

export const getIconForStatus = (status: Status): Image.ImageLike => {
  switch (status.name) {
    case StatusValue.NotStarted:
      return { source: Icon.Circle, tintColor: status.color };
    case StatusValue.InProgress:
      return { source: Icon.CircleProgress, tintColor: status.color };
    case StatusValue.Done:
      return { source: Icon.CheckCircle, tintColor: status.color };
  }
};
