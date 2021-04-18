import 'cross-fetch/polyfill';
import * as cron from 'node-cron';
import { request } from 'graphql-request';
import { IncomingWebhook } from '@slack/webhook';
import { getEnv } from 'lib/helpers/env';

const DEV = getEnv('env') !== 'live';

interface HealthCheck {
	name: string;
	query: string;
	meta?: any;
}

export class OLSelfHelper {
	private webhook: IncomingWebhook;

	constructor() {
		if (!process.env.SLACK_WEBHOOK) {
			console.warn('No SLACK_WEBHOOK defined - remote error reporting not started!');
		} else {
			this.webhook = new IncomingWebhook(process.env.SLACK_WEBHOOK, {
				icon_emoji: ':interrobang:',
			});
		}

		// this.start();
	}

	private start = () => {
		const schedule = DEV ? '* * * * *' : '*/15 * * * *';
		cron.schedule(schedule, this.healthcheck);
		setTimeout(this.healthcheck, DEV ? 1000 : 5000);
	};

	private healthcheck = async () => {
		const checks: HealthCheck[] = [
			{
				name: 'GetCompetitions',
				query: this.getCompetitions,
			},
			{
				name: 'GetSingleCompetition',
				query: this.getCompetition,
				meta: {
					competitionId: 18595,
				},
			},
		];

		const errors = [];

		for (const check of checks) {
			try {
				console.info(`Test: running ${check.name}`);
				await request('http://localhost:4000', check.query);
				console.info(`Test: success ${check.name}`);
			} catch (err) {
				errors.push({ name: check.name, error: err });
			}
		}

		if (errors.length) {
			this.alert(errors);
		}
	};

	private alert = async (errors: any[]) => {
		if (!this.webhook) {
			console.error(errors);
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
				...errors.map((err) => {
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

	private getCompetitions = `query getCompetitionsHealthcheck {
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

	private getCompetition = `query getCompetitionHealthcheck {
        competitions {
          getCompetition(competitionId: 18595) {
            name
            id
            organizer
            eventor
            clubLogoUrl
            info
            clubLogoSizes
            canceled
            distance
            district
            signups
            date
            club
          }
        }
      }`;
}
