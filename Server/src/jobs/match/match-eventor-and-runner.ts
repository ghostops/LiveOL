import { APIResponse, apiSingletons } from 'lib/singletons';

export class MatchEventorAndRunner {
  private api: APIResponse;

  constructor(private eventorRunnerId: number) {
    this.api = apiSingletons.createApiSingletons();
  }

  async run() {}
}
