export class Battle {
  public constructor(
    public code: string,
    public nr: number,
    public missions: number,
    public name: string,
    public added: string,
    public updated: string,
    public comments: string,
    public medal: string,
    public URL: string
  ) {}
}

export class BattleDownload {
  public constructor(
    public ehm: string,
    public zip: string,
    public missions: string[],
    public resources: string[]
  ) {}
}
