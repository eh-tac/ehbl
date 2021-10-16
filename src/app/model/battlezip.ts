import * as fsModule from "fs";
import * as unzipper from "unzipper";
import { Platform } from "./platform";

export class BattleZIP {
  public readme: string;
  public name: string;
  public fileNames: string[] = [];
  public platform: Platform;
  constructor(public zipPath: string, public fs: typeof fsModule) {
    this.name = this.zipName.replace(".zip", "");
  }

  public get extractPath(): string {
    return this.zipPath.replace(".zip", "\\");
  }

  public get zipName(): string {
    const bits = this.zipPath.split("\\");
    const end = bits.pop();
    return end;
  }

  public fetch(zipURL: string): void {
    console.time("fetch");
    fetch(zipURL)
      .then(res => res.arrayBuffer())
      .then(res => {
        console.timeEnd("fetch");

        console.time("write zip");
        this.fs.writeFileSync(this.zipPath, Buffer.from(res));
        console.timeEnd("write zip");
      });
  }

  public extract(): Promise<void> {
    let extractPath = this.extractPath;
    return new Promise((resolve, reject) => {
      console.time("read zip");
      console.log("reading", this.zipPath);
      this.fs
        .createReadStream(this.zipPath)
        .pipe(unzipper.Extract({ path: extractPath }))
        .on("close", () => {
          console.timeEnd("read zip");
          console.log("extracted to", extractPath);
          const files = this.fs.readdirSync(extractPath);
          const processFile = (path: string, file: string) => {
            const lower = file.toLowerCase();
            console.log(lower);
            if (lower.endsWith(".lfd")) {
              this.platform = Platform.TIE;
            } else if (lower.endsWith(".scx")) {
              this.platform = Platform.SWGB;
            } else if (lower.includes("readme")) {
              this.readme = this.fs.readFileSync(path, "utf-8");
            }
          };
          files.forEach(file => {
            const path = `${extractPath}${file}`;
            const stats = this.fs.statSync(path);
            if (stats.isDirectory()) {
              this.fs.readdirSync(`${path}\\`).forEach(nestedFile => {
                const nPath = `${path}\\${nestedFile}`;
                processFile(nPath, nestedFile);
                this.fileNames.push(`${file}\\${nestedFile}`);
              });
            } else {
              processFile(path, file);
              this.fileNames.push(file);
            }
          });
          console.log("found files", this.fileNames);
          resolve();
        })
        .on("error", e => {
          console.log("ERROR e", e);
          reject(e);
        });
    });
  }
}
