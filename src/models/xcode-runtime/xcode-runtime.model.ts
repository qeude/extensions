import { XcodeRuntimePlatform } from "./xcode-runtime-platform.model";

/**
 * A Xcode Runtime
 */
export interface XcodeRuntime {
  /**
   * The name
   */
  name: string;
  /**
   * The platform
   */
  platform: XcodeRuntimePlatform;
  /**
   * The version
   */
  version: string;

  /**
   * The build version
   */
  buildVersion: string;
}
