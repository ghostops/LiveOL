import * as cron from 'node-cron';
import { IncomingWebhook } from '@slack/webhook';
import { getEnv } from 'lib/helpers/env';
import axios from 'axios';

const DEV = getEnv('env') !== 'live';

interface HealthCheck {
  name: string;
  query: () => Promise<boolean>;
}

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
          const res = await axios.get('http://localhost:3000/v1/competitions');
          return res.data.status === 'success';
        },
      },
      {
        name: 'GetSingleCompetition',
        query: async () => {
          const res = await axios.get(
            'http://localhost:3000/v1/competitions/18595',
          );
          return res.data.status === 'success';
        },
      },
      {
        name: 'GetClub',
        query: async () => {
          const club = 'OK Gynge';

          const res = await axios.get(
            `http://localhost:3000/v1/results/18595/club/${encodeURIComponent(club)}`,
          );

          if (res.data.status !== 'success') {
            return false;
          }

          if (res.data.data.results[0].club !== club) {
            return false;
          }

          return true;
        },
      },
      {
        name: 'GetResults',
        query: async () => {
          const res = await axios.get(
            `http://localhost:3000/v1/results/26860/class/${encodeURIComponent('Men 20')}?sorting=place:asc&nowTimestamp=1`,
          );

          if (res.data.status !== 'success') {
            return false;
          }

          if (res.data.data.results[0]?.club !== 'GER Germany') {
            return false;
          }

          return true;
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
