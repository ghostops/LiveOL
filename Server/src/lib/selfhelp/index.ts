import 'cross-fetch/polyfill';
import * as cron from 'node-cron';
import { request } from 'graphql-request';
import { IncomingWebhook } from '@slack/webhook';
import { getEnv } from 'lib/helpers/env';

const DEV = getEnv('env') !== 'live';

export class OLSelfHelper {
    private webhook: IncomingWebhook;

    constructor() {
        if (!process.env.SLACK_WEBHOOK) {
            console.warn('No SLACK_WEBHOOK defined, error reporting not started!');
            return;
        }

        this.webhook = new IncomingWebhook(process.env.SLACK_WEBHOOK, {
            icon_emoji: ':interrobang:',
        });

        this.start();
    }

    private start = () => {
        const schedule = DEV ? '* * * * *' : '*/15 * * * *';
        cron.schedule(schedule, this.healthcheck);
        setTimeout(this.healthcheck, DEV ? 1000 : 5000);
    }

    private healthcheck = async () => {
        const checks = [
            this.getCompetitions,
        ];

        const errors = [];

        for (const query of checks) {
            try {
                await request('http://localhost:4000', query);
            } catch (err) {
                errors.push(err);
            }
        }

        if (errors.length) {
            this.alert(errors);
        }
    }

    private alert = async (errors: any[]) => {
        await this.webhook.send({
            blocks: [
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: `${errors.length} LiveOL error(s):`,
                    }
                },
                ...errors.map((err) => {
                    return {
                        type: 'section',
                        text: {
                            type: 'mrkdwn',
                            text: '```' + String(err) + '```',
                        },
                    };
                }),
            ]
        });
    }

    private getCompetitions = `{
        competitions {
            getCompetitions {
                today {
                    id
                }
                competitions {
                    id
                }
            }
        }
    }`;
}
