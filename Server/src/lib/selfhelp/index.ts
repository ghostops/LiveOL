import * as cron from 'node-cron';
import { IncomingWebhook } from '@slack/webhook';
import { getEnv } from 'lib/helpers/env';
import { appRouter } from 'trpc';
import { createCallerFactory } from 'trpc/client';
import { apiSingletons } from 'lib/singletons';

const DEV = getEnv('env') !== 'live';

interface HealthCheck {
  name: string;
  query: () => Promise<boolean>;
}

const createCaller = createCallerFactory(appRouter);
const caller = createCaller(apiSingletons.createApiSingletons());

export class OLSelfHelper {
  private webhook: IncomingWebhook | undefined;

  constructor() {
    if (!process.env.SLACK_WEBHOOK) {
      console.warn('No SLACK_WEBHOOK defined for self helper!');
    } else {
      this.webhook = new IncomingWebhook(process.env.SLACK_WEBHOOK, {
        icon_emoji: ':interrobang:',
      });
    }
  }

  public start = () => {
    const schedule = DEV ? '* * * * *' : '*/15 * * * *';
    cron.schedule(schedule, this.healthcheck);
    setTimeout(this.healthcheck, DEV ? 1000 : 5000);
  };

  private healthcheck = async () => {
    const checks: HealthCheck[] = [
      {
        name: 'GetCompetitions',
        query: async () => {
          const res = await caller.getCompetitions({ cursor: 1 });

          if (res?.competitions?.length) {
            return true;
          }

          return false;
        },
      },
      {
        name: 'GetSingleCompetition',
        query: async () => {
          const res = await caller.getCompetition({ competitionId: 18595 });

          if (res.competition.name === 'Ungdomscupen deltävling 2') {
            return true;
          }

          return false;
        },
      },
      {
        name: 'GetClub',
        query: async () => {
          const club = 'OK Gynge';

          const res = await caller.getClubResults({
            competitionId: 18595,
            clubName: club,
          });

          if (res[0]?.club === club) {
            return true;
          }

          return false;
        },
      },
      {
        name: 'GetResults',
        query: async () => {
          const res = await caller.getResults({
            competitionId: 26860,
            className: 'Men 20',
            sorting: 'place:asc',
          });

          if (res.results[0]?.club === 'GER Germany') {
            return true;
          }

          return false;
        },
      },
    ];

    const errors = [];

    for (const check of checks) {
      try {
        console.info(`Test: running ${check.name}`);
        const res = await check.query();
        if (!res) {
          throw new Error(`Query succeded but response data was invalid.`);
        }
        console.info(`Test: success ${check.name}`);
      } catch (err: any) {
        errors.push({ name: check.name, error: err?.message || err });
      }
    }

    if (errors.length) {
      this.alert(errors);
    }
  };

  private alert = async (errors: any[]) => {
    if (!this.webhook) {
      console.error(errors);
      return;
    }

    await this.webhook.send({
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `${errors.length} LiveOL error(s):`,
          },
        },
        ...errors.map(err => {
          return {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '```' + this.forceStringify(err) + '```',
            },
          };
        }),
      ],
    });
  };

  private forceStringify = (error: any): string => {
    try {
      return JSON.stringify(error);
    } catch {
      return String(error);
    }
  };
}
