import type { LiveresultatApi } from 'lib/liveresultat/types';
import { APIResponse, apiSingletons } from 'lib/singletons';
import _ from 'lodash';

export class SyncLiveCompetitionsJob {
  private api: APIResponse;

  constructor() {
    this.api = apiSingletons.createApiSingletons();
  }

  async run() {
    try {
      const { competitions } = await this.api.Liveresultat.getcompetitions();

      const batches = _.chunk(competitions, 50);

      await Promise.all(
        batches.map(batch => this.dispatchCompetitionSync(batch)),
      );

      console.log(`Dispatched ${competitions.length} competitions for sync.`);
    } catch (error) {
      console.error('Error syncing competitions:', error);
    }
  }

  private async dispatchCompetitionSync(
    competitions: LiveresultatApi.competition[],
  ) {
    competitions.forEach(competition => {
      this.api.Queue.addJob({
        name: 'sync-live-competition',
        data: {
          competitionId: competition.id,
        },
      });
    });
  }
}
