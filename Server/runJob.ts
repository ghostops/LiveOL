import 'dotenv/config';
import { OLQueue } from 'lib/queue';

const q = new OLQueue('localhost', 6379, process.env.REDIS_PASSWORD);

async function runJob() {
  if (process.argv.length < 3) {
    console.error('Please provide a job name as an argument.');
    process.exit(1);
  }

  const jobName = process.argv[2];

  if (jobName === 'purge') {
    await q.purge();
  }

  if (jobName === 'run') {
    // await q.addJob({
    //   name: 'sync-eventor-competition',
    //   data: {
    //     eventorId: '23182',
    //     countryCode: 'au',
    //   },
    // });
    // await q.addJob({
    //   name: 'sync-eventor-competition',
    //   data: {
    //     eventorId: '55138',
    //     countryCode: 'se',
    //   },
    // });
    await q.addJob({
      name: 'parse-eventor-dates',
      data: {},
    });
    // await q.addJob({
    //   name: 'sync-eventor-competitions',
    //   data: {
    //     startDate: '2025-10-05',
    //     endDate: '2025-10-06',
    //     countryCode: 'au',
    //   },
    // });

    // await q.addJob({
    //   name: 'sync-live-competitions',
    //   data: {
    //     startDate: '2025-10-05',
    //     endDate: '2025-10-06',
    //   },
    // });
  }

  process.exit(0);
}
runJob();
