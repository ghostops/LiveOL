import * as cron from 'node-cron';
import { getEnv } from 'lib/helpers/env';
import axios from 'axios';
import { LiveresultatUrl } from 'lib/eventor/scrapers/urls';
import { ServiceStatusTable } from 'lib/db/schema';
import { apiSingletons } from 'lib/singletons';
import { eq } from 'drizzle-orm/sql/expressions/conditions';

const api = apiSingletons.createApiSingletons();

const DEV = getEnv('env') !== 'live';

interface HealthCheck {
  name: string;
  query: () => Promise<boolean>;
}

export class OLSelfHelper {
  private botToken: string | undefined;
  private chatId: string | undefined;
  private alertTimestamps: number[] = [];
  private readonly MAX_ALERTS_PER_HOUR = 4;
  private readonly ONE_HOUR_MS = 60 * 60 * 1000;
  private throttleNotificationSent = false;

  constructor() {
    if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHAT_ID) {
      console.warn(
        'No TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID defined for self helper!',
      );
    } else {
      this.botToken = process.env.TELEGRAM_BOT_TOKEN;
      this.chatId = process.env.TELEGRAM_CHAT_ID;
    }
  }

  public start = () => {
    const schedule = DEV ? '* * * * *' : '*/15 * * * *';
    cron.schedule(schedule, this.internalHealthchecks);
    cron.schedule(schedule, this.externalHealthchecks);
    setTimeout(this.internalHealthchecks, DEV ? 1000 : 5000);
    setTimeout(this.externalHealthchecks, DEV ? 1000 : 5000);
  };

  private externalHealthchecks = async () => {
    const checks: HealthCheck[] = [
      {
        name: LiveresultatUrl,
        query: async () => {
          const url = `${LiveresultatUrl}/api.php?method=getcompetitions`;
          const res = await axios.get(url, { timeout: 8_000 });
          if (res.status !== 200) {
            return false;
          }
          if (typeof res.data !== 'string') {
            return false;
          }
          if (!res.data.startsWith('{')) {
            return false;
          }
          return true;
        },
      },
      // Enable these when Eventor will be supported
      // {
      //   name: EventorUrls.se,
      //   query: async () => {
      //     const res = await axios.get(EventorUrls.se);
      //     return res.status === 200;
      //   },
      // },
      // {
      //   name: EventorUrls.au,
      //   query: async () => {
      //     const res = await axios.get(EventorUrls.au);
      //     return res.status === 200;
      //   },
      // },
      // {
      //   name: EventorUrls.no,
      //   query: async () => {
      //     const res = await axios.get(EventorUrls.no);
      //     return res.status === 200;
      //   },
      // },
    ];

    for (const check of checks) {
      const [current] = await api.Drizzle.db
        .select()
        .from(ServiceStatusTable)
        .where(eq(ServiceStatusTable.id, check.name))
        .limit(1);

      if (!current) {
        await api.Drizzle.db
          .insert(ServiceStatusTable)
          .values({ id: check.name, status: true });
      }

      try {
        console.info(`External check: running ${check.name}`);
        const res = await check.query();
        if (!res) {
          throw new Error(`Query succeded but response data was invalid.`);
        }
        if (current?.status === false) {
          console.info(`External check: success ${check.name}`);
          await api.Drizzle.db
            .update(ServiceStatusTable)
            .set({ status: true })
            .where(eq(ServiceStatusTable.id, check.name));
        }
      } catch {
        console.error(`External check: failed ${check.name}`);
        await api.Drizzle.db
          .update(ServiceStatusTable)
          .set({ status: false })
          .where(eq(ServiceStatusTable.id, check.name));
      }
    }
  };

  private internalHealthchecks = async () => {
    const checks: HealthCheck[] = [
      {
        name: 'GetCompetitions',
        query: async () => {
          const res = await axios.get('http://127.0.0.1:3000/v2/competitions');
          return res.data.status === 'success';
        },
      },
      {
        name: 'GetSingleCompetition',
        query: async () => {
          const res = await axios.get(
            'http://127.0.0.1:3000/v2/competitions/2025-08-09~arostraffen~vasterassok',
          );
          return res.data.status === 'success';
        },
      },
      {
        name: 'GetResults',
        query: async () => {
          const res = await axios.get(
            `http://127.0.0.1:3000/v2/results/live/4b0146ca00f96d593c3d4597b6fa75a2?sortingKey=place&sortingDirection=asc&nowTimestamp=1&uid=3wy9kewRdMt8VPfPaZUZ6`,
          );

          if (res.data.status !== 'success') {
            return false;
          }

          if (res.data.data.className !== 'W21E') {
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

  private canSendAlert = (): boolean => {
    const now = Date.now();
    const oneHourAgo = now - this.ONE_HOUR_MS;

    this.alertTimestamps = this.alertTimestamps.filter(
      timestamp => timestamp > oneHourAgo,
    );

    if (this.alertTimestamps.length < this.MAX_ALERTS_PER_HOUR) {
      this.alertTimestamps.push(now);
      this.throttleNotificationSent = false;
      return true;
    }

    return false;
  };

  private sendTelegram = async (text: string) => {
    await axios.post(
      `https://api.telegram.org/bot${this.botToken}/sendMessage`,
      { chat_id: this.chatId, text, parse_mode: 'HTML' },
    );
  };

  private alert = async (errors: any[]) => {
    if (!this.botToken || !this.chatId) {
      console.error(errors);
      return;
    }

    if (!this.canSendAlert()) {
      if (!this.throttleNotificationSent) {
        this.throttleNotificationSent = true;
        console.warn(
          `Alert throttled: ${errors.length} error(s) suppressed. Max ${this.MAX_ALERTS_PER_HOUR} alerts/hour reached.`,
        );
        await this.sendTelegram(
          `⚠️ <b>LiveOL Alert Throttling Active</b>\n\nMax ${this.MAX_ALERTS_PER_HOUR} alerts per hour reached. Further alerts will be suppressed until the rate limit resets.\n\nLast error count: ${errors.length}`,
        );
      } else {
        console.warn(
          `Alert suppressed: ${errors.length} error(s). Rate limit active.`,
        );
      }
      return;
    }

    const errorLines = errors
      .map(
        err =>
          `• <b>${err.name}</b>: <code>${this.forceStringify(err.error)}</code>`,
      )
      .join('\n');

    await this.sendTelegram(
      `🚨 <b>${errors.length} LiveOL error(s):</b>\n\n${errorLines}`,
    );
  };

  private forceStringify = (error: any): string => {
    try {
      return JSON.stringify(error);
    } catch {
      return String(error);
    }
  };
}
