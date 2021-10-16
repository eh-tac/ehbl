import * as fsModule from "fs";
import { Platform } from "./platform";
import { ElectronService } from "../core/services";
import { Settings } from "./settings";

export abstract class BattleInstaller {
  protected cfg: Settings;
  constructor(
    public platform: Platform,
    public rootDir: string,
    public fs: typeof fsModule,
    public ehblPath: string
  ) {
    this.cfg = Settings.load();
  }
  public abstract get exePath(): string;
  public get valid(): boolean {
    return !!this.rootDir && this.fs.existsSync(this.exePath);
  }
  public get pilotDir(): string {
    return `${this.ehblPath}\\src\\assets\\pilots\\`;
  }

  public abstract install(fromDir: string, files: string[]): Promise<void>;

  public launch(electron: ElectronService): void {
    const l = electron.childProcess.execFile(this.exePath, {
      cwd: this.rootDir
    });
    console.log(l);
  }

  public abstract setRoot(path: string): void;
  public abstract makePilot(pin: string | number, battleCode: string): void;
}

export class SWGBInstaller extends BattleInstaller {
  public constructor(root: string, fs: typeof fsModule, ehblPath: string) {
    super(Platform.SWGB, root, fs, ehblPath);
  }
  public get exePath(): string {
    return `${this.rootDir}Battlegrounds.exe`;
  }
  public get campaignDir(): string {
    return `${this.rootDir}Campaign\\`;
  }
  public get scenarioDir(): string {
    return `${this.rootDir}Scenario\\`;
  }

  public install(fromDir: string, files: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
      files.forEach(file => {
        const lower = file.toLowerCase();
        const old = `${fromDir}${file}`;
        const newF = file.split("\\").pop();
        if (lower.endsWith(".scx")) {
          this.fs.renameSync(old, `${this.scenarioDir}${newF}`);
        } else if (lower.endsWith(".cpx")) {
          this.fs.renameSync(old, `${this.campaignDir}${newF}`);
        }
      });
      resolve();
    });
  }

  public setRoot(path: string): void {
    // if we're not at the desired depth...
    if (this.fs.existsSync(`${path}swgbg.exe`) && this.fs.existsSync(`${path}Game\\Battlegrounds.exe`)) {
      path = `${path}Game\\`;
    }

    this.rootDir = path;
    this.cfg.swgbPath = path;
    this.cfg.save();
  }

  public makePilot(): void { }
}

export class XWInstaller extends BattleInstaller {
  public constructor(root: string, fs: typeof fsModule, ehblPath: string) {
    super(Platform.XW, root, fs, ehblPath);
  }
  public get exePath(): string {
    return `${this.rootDir}\\XWING95.exe`;
  }
  public get missionDir(): string {
    return `${this.rootDir}\\X-Wing Data\\MISSION\\`;
  }
  public install(fromDir: string, files: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
      files.forEach(file => {
        const lower = file.toLowerCase();
        const old = `${fromDir}${file}`;
        if (lower.endsWith(".xwi") || lower.endsWith(".brf")) {
          this.fs.renameSync(old, `${this.missionDir}${file}`);
        }
      });
      resolve();
    });
  }

  public setRoot(path: string): void {
    this.rootDir = path;
    this.cfg.xwPath = path;
    this.cfg.save();
  }

  public makePilot(pin: string | number, battleCode: string): void {
    // TODO
  }
}

export class TIEInstaller extends BattleInstaller {
  public constructor(root: string, fs: typeof fsModule, ehblPath: string) {
    super(Platform.TIE, root, fs, ehblPath);
  }
  public get exePath(): string {
    return `${this.rootDir}\\TIE95.exe`;
  }
  public get missionDir(): string {
    return `${this.rootDir}\\MISSION\\`;
  }
  public get resourceDir(): string {
    return `${this.rootDir}\\RESOURCE\\`;
  }

  public install(fromDir: string, files: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
      files.forEach(file => {
        const lower = file.toLowerCase();
        const old = `${fromDir}${file}`;
        if (lower.endsWith(".lfd")) {
          this.fs.renameSync(old, `${this.resourceDir}${file}`);
        } else if (lower.endsWith(".tie")) {
          this.fs.renameSync(old, `${this.missionDir}${file}`);
        }
      });
      resolve();
    });
  }

  public setRoot(path: string): void {
    this.rootDir = path;
    this.cfg.tiePath = path;
    this.cfg.save();
  }

  public makePilot(pin: string | number, battleCode: string): void {
    console.log(this.pilotDir, this.fs.readdirSync(this.pilotDir));
    if (this.fs.existsSync(`${this.pilotDir}BLANK.tfr`)) {
      this.fs.copyFileSync(`${this.pilotDir}BLANK.tfr`, `${this.rootDir}${pin}${battleCode}.tfr`);
    }
  }
}

export class XvTInstaller extends BattleInstaller {
  public constructor(root: string, fs: typeof fsModule, ehblPath: string) {
    super(Platform.XvT, root, fs, ehblPath);
  }
  public get exePath(): string {
    return `${this.rootDir}\\Z_XVT__.EXE`;
  }
  public install(fromDir: string, files: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
      files.forEach(file => {
        const lower = file.toLowerCase();
        const old = `${fromDir}${file}`;
      });
      resolve();
    });
  }

  public setRoot(path: string): void {
    this.rootDir = path;
    this.cfg.xvtPath = path;
    this.cfg.save();
  }

  public makePilot(pin: string | number, battleCode: string): void {
    // TODO
  }
}

export class BoPInstaller extends BattleInstaller {
  public constructor(root: string, fs: typeof fsModule, ehblPath: string) {
    super(Platform.BoP, root, fs, ehblPath);
  }
  public get exePath(): string {
    return `${this.rootDir}\\z_xvt__.exe`;
  }
  public install(fromDir: string, files: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
      files.forEach(file => {
        const lower = file.toLowerCase();
        const old = `${fromDir}${file}`;
      });
      resolve();
    });
  }

  public setRoot(path: string): void {
    this.rootDir = path;
    this.cfg.bopPath = path;
    this.cfg.save();
  }

  public makePilot(pin: string | number, battleCode: string): void {
    // TODO
  }
}

export class XWAInstaller extends BattleInstaller {
  public constructor(root: string, fs: typeof fsModule, ehblPath: string) {
    super(Platform.XWA, root, fs, ehblPath);
  }
  public get exePath(): string {
    return `${this.rootDir}\\XWINGALLIANCE.EXE`;
  }
  public install(fromDir: string, files: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
      files.forEach(file => {
        const lower = file.toLowerCase();
        const old = `${fromDir}${file}`;
      });
      resolve();
    });
  }

  public setRoot(path: string): void {
    this.rootDir = path;
    this.cfg.xwaPath = path;
    this.cfg.save();
  }

  public makePilot(pin: string | number, battleCode: string): void {
    // TODO
  }
}
