import { PlatformStatus } from "./platformstatus";
import {
  TIEInstaller,
  SWGBInstaller,
  XWInstaller,
  XvTInstaller,
  BoPInstaller,
  XWAInstaller
} from "./battleinstaller";
import * as fsModule from "fs";
import { Settings } from "./settings";

export function loadPlatforms(fs: typeof fsModule, appPath: string): PlatformStatus[] {
  const cfg: Settings = Settings.load();

  return [
    new PlatformStatus(new XWInstaller(cfg.xwPath, fs, appPath)),
    new PlatformStatus(new TIEInstaller(cfg.tiePath, fs, appPath)),
    new PlatformStatus(new XvTInstaller(cfg.xvtPath, fs, appPath)),
    new PlatformStatus(new BoPInstaller(cfg.bopPath, fs, appPath)),
    new PlatformStatus(new XWAInstaller(cfg.xwaPath, fs, appPath)),
    new PlatformStatus(new SWGBInstaller(cfg.swgbPath, fs, appPath))
  ];
}
