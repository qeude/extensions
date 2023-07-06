import { ActionPanel, Action, Icon, Grid, LaunchProps } from "@raycast/api";
import { GeneratorService } from "./services/generator.service";
import { PaletteService } from "./services/palette.service";
import { usePromise } from "@raycast/utils";
import { useState } from "react";
import { Palette } from "./models/palette.model";

export default function Command(
  props: LaunchProps<{ arguments: { color: string } }>
) {
  const [baseColor, setBaseColor] = useState<string>(props.arguments.color);
  const palette = usePromise(GeneratorService.generatePalette, [baseColor]);
  return (
    <Grid
      isLoading={palette.isLoading}
      columns={11}
      navigationTitle={palette.data?.name}
    >
      {Object.entries(palette.data?.colors ?? []).map(([name, color]) => (
        <Grid.Item
          key={name}
          content={{
            color: {
              light: color,
              dark: color,
              adjustContrast: false,
            },
          }}
          title={name}
          subtitle={color}
          actions={
            <ActionPanel>
              <Action.CopyToClipboard content={color} />
              <Action.CopyToClipboard
                title="Copy All Colors as Variable Declaration Ready"
                content={PaletteService.variableDeclarationReadyPalette(
                  palette.data as Palette
                )}
              />
              <Action.CopyToClipboard
                title="Copy All Colors as JSON"
                content={PaletteService.jsonStringPalette(
                  palette.data as Palette
                )}
              />
              <Action
                title="Use as New Base Color"
                icon={{ source: Icon.RotateClockwise }}
                onAction={() => {
                  setBaseColor(color);
                  palette.revalidate;
                }}
              />
            </ActionPanel>
          }
        />
      ))}
      )
    </Grid>
  );
}
