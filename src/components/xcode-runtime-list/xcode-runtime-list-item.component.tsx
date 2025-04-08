import { Action, ActionPanel, Alert, confirmAlert, Icon, List } from "@raycast/api";
import { XcodeRuntime } from "../../models/xcode-runtime/xcode-runtime.model";
import { XcodeRuntimeService } from "../../services/xcode-runtime.service";
import { operationWithUserFeedback } from "../../shared/operation-with-user-feedback";

export function XcodeRuntimeListItem(props: { runtime: XcodeRuntime; revalidate: () => void }) {
  return (
    <List.Item
      title={props.runtime.name}
      subtitle={{ tooltip: "Build version", value: props.runtime.buildVersion }}
      keywords={[props.runtime.platform, props.runtime.name, props.runtime.version]}
      accessories={[
        ...(props.runtime.lastUsageDate
          ? [
              {
                icon: Icon.Clock,
                text: props.runtime.lastUsageDate.toLocaleDateString(),
                tooltip: "Last used",
              },
            ]
          : []),
      ]}
      actions={
        <ActionPanel>
          <Action
            title="Delete Runtime"
            icon={Icon.Trash}
            style={Action.Style.Destructive}
            shortcut={{ modifiers: ["ctrl"], key: "x" }}
            onAction={async () => {
              const alertOptions: Alert.Options = {
                icon: Icon.Trash,
                title: "Delete Runtime",
                message: `Are you sure you want to delete the ${props.runtime.name} runtime?`,
                primaryAction: {
                  title: "Delete",
                  style: Alert.ActionStyle.Destructive,
                },
              };
              if (!(await confirmAlert(alertOptions))) {
                return;
              }
              operationWithUserFeedback(
                "Deleting Runtime...",
                `${props.runtime.name} runtime has been deleted`,
                "Error Deleting runtime",
                async () => {
                  await XcodeRuntimeService.deleteXcodeRuntime(props.runtime);
                  props.revalidate();
                }
              );
            }}
          />
        </ActionPanel>
      }
    />
  );
}
