import { APIResponse, apiSingletons } from 'lib/singletons';
import { LiveClassWriter } from './live-class-writer';
import logger from 'lib/logger';

export class SyncLiveClassJob {
  private api: APIResponse;
  private writer: LiveClassWriter;

  constructor(
    private competitionId: number,
    private className: string,
  ) {
    if (!competitionId) {
      throw new Error('Competition ID is required');
    }
    if (!className) {
      throw new Error('Class name is required');
    }
    this.api = apiSingletons.createApiSingletons();
    this.writer = new LiveClassWriter(this.api.Drizzle.db);
  }

  async run() {
    try {
      const results = await this.api.Liveresultat.getclassresults(
        this.competitionId,
        this.className,
      );

      if (!results) {
        logger.info(
          `No updates for class ${this.className} (${this.competitionId}).`,
        );
        return;
      }

      await this.writer.write(this.competitionId, results);

      logger.info(
        `Class ${this.className} (${this.competitionId}) synced successfully.`,
      );
    } catch (error) {
      logger.error(
        `Error syncing class ${this.className} (${this.competitionId}): ${error}`,
      );
    }
  }
}
