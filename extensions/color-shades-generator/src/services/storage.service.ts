import { LocalStorage } from "@raycast/api";
import { Palette } from "../models/palette.model";

export class StorageService {
  static async allPalettes(): Promise<Palette> {
    return LocalStorage.allItems<Palette>();
  }

  static async savePalette(palette: Palette): Promise<void> {
    await LocalStorage.setItem(
      `${palette.creationDate}${palette.name}`,
      JSON.stringify(palette)
    );
  }
}
