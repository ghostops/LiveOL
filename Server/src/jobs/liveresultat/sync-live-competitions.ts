import { addDays, isAfter, isValid, parse } from 'date-fns';
import type { LiveresultatApi } from 'lib/liveresultat/types';
import logger from 'lib/logger';
import { APIResponse, apiSingletons } from 'lib/singletons';
import _ from 'lodash';

export class SyncLiveCompetitionsJob {
  private api: APIResponse;

  constructor(
    private startDate?: string,
    private endDate?: string,
  ) {
    this.api = apiSingletons.createApiSingletons();
  }

  async run() {
    try {
      const { competitions } = await this.api.Liveresultat.getcompetitions();

      const batches = _.chunk(competitions, 50);

      await Promise.all(
        batches.map(batch => this.dispatchCompetitionSync(batch)),
      );

      if (batches.length > 0) {
        logger.info(`Dispatched live competitions for sync.`);
      }
    } catch (error) {
      logger.error(`Error syncing competitions: ${error}`);
    }
  }

  private async dispatchCompetitionSync(
    competitions: LiveresultatApi.getcompetitioninfo[],
  ) {
    const start = this.startDate
      ? parse(this.startDate, 'yyyy-MM-dd', new Date())
      : new Date();
    const end = this.endDate
      ? parse(this.endDate, 'yyyy-MM-dd', new Date())
      : addDays(start, 1);

    competitions.forEach(competition => {
      const parsedDate = this.parseDate(competition.date);

      if (
        !parsedDate ||
        isAfter(parsedDate, end) ||
        isAfter(start, parsedDate)
      ) {
        return;
      }

      this.api.Queue.RegularQueue.addJob({
        name: 'sync-live-competition',
        data: {
          competitionId: competition.id,
        },
      });
    });
  }

  private parseDate(dateString: string): Date | null {
    if (!dateString) return null;
    try {
      const date = parse(dateString, 'yyyy-MM-dd', new Date());
      return isValid(date) ? date : null;
    } catch {
      return null;
    }
  }
}
