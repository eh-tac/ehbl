import {
  Component,
  OnInit,
  ChangeDetectorRef,
  ViewChild,
  ElementRef,
} from "@angular/core";
import { ElectronService } from "../core/services";
import { Battle, BattleDownload } from "./battle";
import { PlatformStatus } from "../model/platformstatus";
import { loadPlatforms } from "../model";
import { Settings } from "../model/settings";
import { BattleZIP } from "../model/battlezip";
import { TFR } from "../model/pilot";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"],
})
export class HomeComponent implements OnInit {
  @ViewChild("fileSelector", { read: ElementRef, static: false })
  fileSelector: ElementRef;

  public platforms: PlatformStatus[] = [];

  private baseUrl: string = "http://192.168.1.74:5555/api/battle/TIE/";
  private dlUrl: string = "https://tc.emperorshammer.org";
  private dlPath: string = "";

  public pin: string = "9555";

  // nav & ui sections
  public errorText: string = "";
  public battle: Battle;
  public platform: PlatformStatus;
  public battleCenter: boolean = true;
  public about: boolean = false;
  public settings: boolean = false;

  constructor(
    public electronService: ElectronService,
    private cd: ChangeDetectorRef
  ) {
    // console.log("electron app", electronService.remote.app);
    const temp = electronService.remote.app.getPath("temp");
    this.dlPath = `${temp}\\`;
    // app path electronService.remote.app.getAppPath()
  }

  public ngOnInit() {
    this.platforms = loadPlatforms(
      this.electronService.fs,
      this.electronService.remote.app.getAppPath()
    );
  }

  public gameClick(platform: PlatformStatus): void {
    if (!platform.ready) {
      this.showSettings();
    } else {
      this.reset();
      this.platform = platform;
    }
  }

  public loadSelector(): void {
    const selector = this.fileSelector.nativeElement as HTMLInputElement;
    selector.onchange = this.fileSelect.bind(this);
    selector.click();
  }

  public fileSelect(ev: Event): void {
    const input = ev.target as HTMLInputElement;
    const found = input.files[0];
    if (!found) return;

    const fs = this.electronService.fs;
    const tmpPath = `${this.dlPath}${found.name}`;
    fs.copyFileSync(found.path, tmpPath);
    this.installZip(found.path, found.name);
  }

  public installZip(zipPath: string, zipName: string): void {
    const zip = new BattleZIP(zipPath, this.electronService.fs);
    zip.extract().then(() => {
      const plat = this.platforms.find(
        (plat) => plat.installer.platform === zip.platform
      );
      console.log("promise done", zip, plat, this.platforms);
      if (!plat) {
        this.errorText = `Unable to detect the platform of ${zipName}`;
      } else if (!plat.ready) {
        this.errorText = `Unable to install ${zip.platform} battle - settings are incorrect`;
      } else {
        console.log("about to install!");
        plat.install(zip).then(() => {
          const settings = Settings.load();
          if (settings.createPilot || true) {
            //TODO
            plat.installer.makePilot(this.pin, zip.name);
          }
          console.log("done installing");
          this.reset();
          this.platform = plat;
        });
      }
      console.log(this.errorText);
    });
  }

  public loadBattle(battle: string, event?: Event): void {
    if (event) event.preventDefault();
    fetch(`${this.baseUrl}${battle}`)
      .then((res) => res.json())
      .then((res) => {
        this.battle = res;
        console.log(this.battle);
      });
  }

  public showBattleCenter(): void {
    this.reset();
    this.battleCenter = true;
  }

  public showSettings(): void {
    this.reset();
    this.settings = true;
  }

  public showAbout(): void {
    this.reset();
    this.about = true;
  }

  public downloadBattle(event: CustomEvent<Battle>): void {
    fetch(`http://192.168.1.74:5555${event.detail.URL}/download`)
      .then((res) => res.json())
      .then((res) => {
        this.getZip(res);
      });
  }

  public findPlatform(platform: PlatformStatus): void {
    const selector = this.fileSelector.nativeElement as HTMLInputElement;
    selector.onchange = (ev: Event) => {
      const input = ev.target as HTMLInputElement;
      const found = input.files[0];
      if (!found) return;
      const rootPath = found.path.replace(found.name, "");
      platform.installer.setRoot(rootPath);
      this.platforms = [...this.platforms];
    };
    selector.click();
  }

  public setPin(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.pin = input.value;
    const settings = Settings.load();
    settings.pin = this.pin;
    settings.save();
  }

  public launch(platform: PlatformStatus): void {
    const dir = platform.installer.rootDir;
    const fs = this.electronService.fs;
    // setInterval(() => {
    //   const tfrs = fs.readdirSync(dir).filter((x) => x.endsWith(".tfr"));
    //   tfrs.forEach((t) => {
    //     const d = fs.readFileSync(`${dir}${t}`);
    //     const tfr = new TFR(d);
    //     console.log(t, new Date().toTimeString(), tfr);
    //   });
    // }, 10000);
    platform.installer.launch(this.electronService);
  }

  private reset(): void {
    this.errorText = this.platform = this.about = this.settings = this.battle = undefined;
    requestAnimationFrame(() => this.cd.detectChanges());
  }

  private getZip(dl: BattleDownload): void {
    const zipName = this.getZipName(dl.zip);
    const fs = this.electronService.fs;
    console.time("fetch");
    const url = `${this.dlUrl}${dl.zip}`;
    // fetch url then install
    const tmpPath = `${this.dlPath}${zipName}`;

    fetch(url)
      .then((res) => res.arrayBuffer())
      .then((res) => {
        console.log("got stuff, gonna write it", tmpPath, zipName, res);
        fs.writeFileSync(tmpPath, Buffer.from(res));
        this.installZip(tmpPath, zipName);
        console.log("installed zip");
      });
  }

  private getZipName(path: string): string {
    const bits = path.split("/");
    const end = bits.pop();
    return end;
  }
}
