import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import { ElectronService } from "../core/services";
import { Battle, BattleDownload } from "./battle";
import * as unzipper from "unzipper";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"]
})
export class HomeComponent implements OnInit {
  private baseUrl: string = "http://192.168.1.39:5555/api/battle/TIE/";
  private dlUrl: string = "https://tc.emperorshammer.org";
  private dlPath: string =
    "C:\\GOG Games\\Star Wars - TIE Fighter (1998)\\EHMISS\\";
  private mission: string =
    "C:\\GOG Games\\Star Wars - TIE Fighter (1998)\\MISSION\\";
  private resource: string =
    "C:\\GOG Games\\Star Wars - TIE Fighter (1998)\\RESOURCE\\";
  private launch: string = "TIE95.EXE";
  private launchDir: string = "C:\\GOG Games\\Star Wars - TIE Fighter (1998)\\";
  public spam: string[] = [
    "TC/104",
    "TC/119",
    "TC/189",
    "TC/19",
    "TC/67",
    "TC/137",
    "TC/98"
  ];
  public battle: Battle;
  public pin: string = "9555";
  public readme: string;
  constructor(
    public electronService: ElectronService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadBattle(this.spam[0]);
  }

  public loadBattle(battle: string, event?: Event): void {
    this.readme = undefined;
    if (event) event.preventDefault();
    fetch(`${this.baseUrl}${battle}`)
      .then(res => res.json())
      .then(res => {
        this.battle = res;
        console.log(this.battle);
      });
  }

  public load(): void {
    fetch(`http://192.168.1.39:5555${this.battle.URL}/download`)
      .then(res => res.json())
      .then(res => {
        this.getZip(res);
        this.copyPilot();
      });
  }

  private copyPilot(): void {
    const pilot = `${this.dlPath}BLANK.tfr`;
    const fs = this.electronService.fs;
    const cleanedCode = this.battle.code.replace("-", "").replace(" ", "");
    const pin = 9555;
    const tfrName = `${pin}${cleanedCode}.tfr`;
    fs.copyFileSync(pilot, `${this.launchDir}${tfrName}`);
    console.log("made ", tfrName);
  }

  private getZip(dl: BattleDownload): void {
    const zipName = this.getZipName(dl.zip);
    const fs = this.electronService.fs;
    console.time("fetch");
    fetch(`${this.dlUrl}${dl.zip}`)
      .then(res => res.arrayBuffer())
      .then(res => {
        const zipPath = `${this.dlPath}${zipName}`;
        const extractPath = zipPath.replace(".zip", "\\");
        console.timeEnd("fetch");
        console.time("write zip");
        fs.writeFileSync(zipPath, Buffer.from(res));
        console.timeEnd("write zip");
        console.time("read zip");
        fs.createReadStream(zipPath)
          .pipe(unzipper.Extract({ path: extractPath }))
          .on("close", () => {
            console.timeEnd("read zip");
            fs.readdirSync(extractPath).forEach(file => {
              const lower = file.toLowerCase();
              console.time(file);
              if (lower.endsWith(".tie")) {
                fs.renameSync(
                  `${extractPath}${file}`,
                  `${this.mission}${file}`
                );
              } else if (lower.endsWith(".lfd")) {
                fs.renameSync(
                  `${extractPath}${file}`,
                  `${this.resource}${file}`
                );
              } else if (lower.includes("readme")) {
                this.readme = fs.readFileSync(`${extractPath}${file}`, "utf-8");
                this.cd.detectChanges();
              }
              console.timeEnd(file);
            });
          })
          .on("error", e => {
            console.log("ERROR e", e);
          });
      });
  }

  private getZipName(path: string): string {
    const bits = path.split("/");
    const end = bits.pop();
    return end;
  }

  public fly(): void {
    const l = this.electronService.childProcess.execFile(this.launch, {
      cwd: this.launchDir
    });
    console.log(l);
  }
}
