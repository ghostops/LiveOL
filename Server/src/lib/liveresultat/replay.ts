import { LiveresultatApi } from 'lib/liveresultat/types';
import fs from 'fs';
import ms from 'ms';

export class LiveresultatReplayer {
  private files: string[];

  private currentIndex: number = 0;

  private currentFile: string | undefined;

  constructor(private inDir: string) {
    this.files = fs.readdirSync(this.inDir);

    this.currentFile = this.files[this.currentIndex];

    setInterval(() => {
      if (this.currentIndex === this.files.length - 1) {
        this.currentIndex = 0;
      } else {
        this.currentIndex += 1;
      }

      this.currentFile = this.files[this.currentIndex];
    }, ms('15 seconds'));
  }

  public getCurrentResults = (): LiveresultatApi.getclassresults => {
    const str = fs.readFileSync(`${this.inDir}/${this.currentFile}`).toString();
    const data: LiveresultatApi.getclassresults = JSON.parse(str).data;

    return data;
  };
}
