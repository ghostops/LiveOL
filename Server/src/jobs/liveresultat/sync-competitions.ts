import type { LiveresultatApi } from 'lib/liveresultat/types';
import { APIResponse, apiSingletons } from 'lib/singletons';
import _ from 'lodash';

export class SyncCompetitionsJob {
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
    } catch (error) {
      console.error('Error syncing competitions:', error);
    }
  }

  private async dispatchCompetitionSync(
    competitions: LiveresultatApi.competition[],
  ) {
    competitions.forEach(competition => {
      this.api.Queue.addJob({
        name: 'sync-competition',
        data: {
          competitionId: competition.id,
        },
      });
    });
  }
}
