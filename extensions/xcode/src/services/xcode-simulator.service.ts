import { XcodeSimulator } from "../models/xcode-simulator/xcode-simulator.model";
import { execAsync } from "../shared/exec-async";
import { XcodeSimulatorGroup } from "../models/xcode-simulator/xcode-simulator-group.model";
import { XcodeSimulatorState } from "../models/xcode-simulator/xcode-simulator-state.model";
import { XcodeSimulatorAppAction } from "../models/xcode-simulator/xcode-simulator-app-action.model";
import { XcodeSimulatorAppPrivacyAction } from "../models/xcode-simulator/xcode-simulator-app-privacy-action.model";
import { XcodeSimulatorAppPrivacyServiceType } from "../models/xcode-simulator/xcode-simulator-app-privacy-service-type.model";
import { groupBy } from "../shared/group-by";
import {
  Clipboard,
  closeMainWindow,
  showToast,
  Toast,
  LaunchProps,
} from "@raycast/api";
import { XcodeService } from "./xcode.service";
/**
 * XcodeSimulatorService
 */
export class XcodeSimulatorService {
  /**
   * Retrieve all XcodeSimulatorGroups
   */
  static async xcodeSimulatorGroups(): Promise<XcodeSimulatorGroup[]> {
    const simulators = await XcodeSimulatorService.xcodeSimulators();
    return groupBy(simulators, (simulator) => simulator.runtime)
      .map((group) => {
        return { runtime: group.key, simulators: group.values };
      })
      .sort((lhs, rhs) => lhs.runtime.localeCompare(rhs.runtime));
  }

  /**
   * Retrieve all installed XcodeSimulators
   */
  static async xcodeSimulators(): Promise<XcodeSimulator[]> {
    // Execute command
    const output = await execAsync("xcrun simctl list -j -v devices");
    // Parse stdout as JSON
    const devicesResponseJSON = JSON.parse(output.stdout);
    // Check if JSON or devices within the JSON are not available
    if (!devicesResponseJSON || !devicesResponseJSON.devices) {
      // Return empty simulators array
      throw [];
    }
    // Initialize XcodeSimulators
    const simulators: XcodeSimulator[] = [];
    // For each DeviceGroup
    for (const deviceGroup in devicesResponseJSON.devices) {
      // Initialize runtime components from DeviceGroup
      const runtimeComponents = deviceGroup
        .substring(deviceGroup.lastIndexOf(".") + 1)
        .split("-");
      // Initialize runtime string
      const runtime = [
        runtimeComponents.shift(),
        runtimeComponents.join("."),
      ].join(" ");
      // Push Simulators in DeviceGroup
      simulators.push(
        ...devicesResponseJSON.devices[deviceGroup].map(
          (simulator: XcodeSimulator) => {
            simulator.runtime = runtime;
            return simulator;
          }
        )
      );
    }
    // Return XcodeSimulators
    return simulators;
  }

  /**
   * Boot XcodeSimulator
   * @param xcodeSimulator The XcodeSimulator to boot
   */
  static boot(xcodeSimulator: XcodeSimulator): Promise<void> {
    return execAsync(`xcrun simctl boot ${xcodeSimulator.udid}`).then(() => {
      // Silently open Simulator application
      execAsync("open -a simulator");
    });
  }

  /**
   * Shutdown XcodeSimulator
   * @param xcodeSimulator The XcodeSimulator to shutdown
   */
  static shutdown(xcodeSimulator: XcodeSimulator): Promise<void> {
    // Shutdown Simulator
    return execAsync(`xcrun simctl shutdown ${xcodeSimulator.udid}`).then();
  }

  /**
   * Toggle XcodeSimulator
   */
  static toggle(xcodeSimulator: XcodeSimulator): Promise<void> {
    switch (xcodeSimulator.state) {
      case XcodeSimulatorState.booted:
        return XcodeSimulatorService.shutdown(xcodeSimulator);
      case XcodeSimulatorState.shuttingDown:
        return Promise.resolve();
      case XcodeSimulatorState.shutdown:
        return XcodeSimulatorService.boot(xcodeSimulator);
    }
  }

  /**
   * Perform a XcodeSimulator AppAction
   * @param action The XcodeSimulatorAppAction
   * @param bundleIdentifier The bundle identifier of the application
   * @param xcodeSimulator The XcodeSimulator
   */
  static async app(
    action: XcodeSimulatorAppAction,
    bundleIdentifier: string,
    xcodeSimulator: XcodeSimulator
  ): Promise<void> {
    try {
      // Boot Xcode Simulator and ignore any errors
      await XcodeSimulatorService.boot(xcodeSimulator);
      // eslint-disable-next-line no-empty
    } catch {}
    // Launch application by bundle identifier
    return execAsync(
      ["xcrun", "simctl", action, xcodeSimulator.udid, bundleIdentifier].join(
        " "
      )
    ).then();
  }

  /**
   * Perform a XcodeSimulator AppPrivacyAction for a given AppPrivacyServiceType
   * @param action The XcodeSimulatorAppPrivacyAction
   * @param serviceType The XcodeSimulatorAppPrivacyServiceType
   * @param bundleIdentifier The bundle identifier of the application
   * @param xcodeSimulator The XcodeSimulator
   */
  static async appPrivacy(
    action: XcodeSimulatorAppPrivacyAction,
    serviceType: XcodeSimulatorAppPrivacyServiceType,
    bundleIdentifier: string,
    xcodeSimulator: XcodeSimulator
  ): Promise<void> {
    try {
      // Boot Xcode Simulator and ignore any errors
      await XcodeSimulatorService.boot(xcodeSimulator);
      // eslint-disable-next-line no-empty
    } catch {}
    return execAsync(
      [
        "xcrun",
        "simctl",
        "privacy",
        xcodeSimulator.udid,
        action,
        serviceType,
        bundleIdentifier,
      ].join(" ")
    ).then();
  }

  /**
   * Show Simulator
   */
  static showSimulator(): Promise<void> {
    return execAsync(`open -b "com.apple.iphonesimulator"`).then();
  }

  /**
   * Defines wether there is at least one booted Simulator or not.
   */
  static async existsBootedSimulator(): Promise<boolean> {
    return XcodeSimulatorService.xcodeSimulators().then((simulators) =>
      simulators.some((s) => s.state == XcodeSimulatorState.booted)
    );
  }

  /**
   * Opens URL in Simulator
   * @param udid UDID of the Simulator in which we want to open the URL in.
   * @param url URL we want to open
   */
  static async openUrl(url?: string, udid?: string) {
    const toast = await showToast({
      style: Toast.Style.Animated,
      title: "Opening URL in Simulator",
    });
    try {
      await checkPreconditions();
      const trimmedUrl = url?.trim();
      await checkUrlValidity(trimmedUrl);
      await execAsync(
        `xcrun simctl openurl ${udid?.trim() ?? "booted"} '${trimmedUrl}'`
      );
      toast.style = Toast.Style.Success;
      toast.title = "URL opened in Simulator.";
      XcodeSimulatorService.showSimulator();
      await closeMainWindow();
    } catch (error) {
      console.error(error);
      const defaultTitle = "Error while opening URL in Simulator.";
      toast.style = Toast.Style.Failure;
      toast.title =
        error instanceof Error ? error.message ?? defaultTitle : defaultTitle;
    }

    async function checkPreconditions() {
      if (!(await XcodeService.isXcodeInstalled()))
        throw Error("Xcode is not installed");
      if (!(await XcodeSimulatorService.existsBootedSimulator()))
        throw Error("No booted Simulator found.");
    }

    async function checkUrlValidity(url: string | undefined) {
      if (!url) throw Error("URL provided is empty.");
      const regex = /\w+:\/\/[^\s]+/;
      if (!regex.test(url)) throw Error("URL provided has wrong format.");
    }
  }
}
