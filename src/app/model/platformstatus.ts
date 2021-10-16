import { BattleInstaller } from "./battleinstaller";
import { BattleZIP } from "./battlezip";

export class PlatformStatus {
  public battle: BattleZIP;
  constructor(public installer: BattleInstaller) {}
  public get ready(): boolean {
    return this.installer.valid;
  }
  public get loaded(): boolean {
    return !!this.battle;
  }
  public get label(): string {
    return this.installer.platform;
  }

  public get badgeClass(): string {
    if (!this.ready) {
      return "danger";
    } else if (this.battle) {
      return "success";
    } else {
      return "light";
    }
  }

  public get badgeText(): string {
    if (!this.ready) {
      return "Not found";
    } else if (this.battle) {
      return this.battle.name;
    } else {
      return "No battle installed";
    }
  }

  public install(battle: BattleZIP): Promise<void> {
    return this.installer
      .install(battle.extractPath, battle.fileNames)
      .then(() => {
        this.battle = battle;
      });
  }
}
