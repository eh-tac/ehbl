export class Settings {
  public static data: Settings;

  public static KEY: string = "ehbl-settings";
  public constructor(
    public pin: string,
    public createPilot: boolean,
    public xwPath: string,
    public tiePath: string,
    public xvtPath: string,
    public bopPath: string,
    public xwaPath: string,
    public swgbPath: string
  ) { }

  public toJSON(): object {
    const xwPath = this.xwPath;
    const tiePath = this.tiePath;
    const xvtPath = this.xvtPath;
    const bopPath = this.bopPath;
    const xwaPath = this.xwaPath;
    const swgbPath = this.swgbPath;
    const pin = this.pin;
    const createPilot = this.createPilot;

    return { xwPath, tiePath, xvtPath, bopPath, xwaPath, swgbPath, pin, createPilot };
  }

  public save(): void {
    window.localStorage.setItem(Settings.KEY, JSON.stringify(this));
  }

  public static load(): Settings {
    if (!Settings.data) {
      const jsonStr: string = window.localStorage.getItem(Settings.KEY);
      const obj = jsonStr ? JSON.parse(jsonStr) : {};

      Settings.data = new Settings(
        obj.pin,
        !!obj.createPilot,
        obj.xwPath,
        obj.tiePath,
        obj.xvtPath,
        obj.bopPath,
        obj.xwaPath,
        obj.swgbPath
      );
    }
    return Settings.data;
  }
}
