import 'dotenv/config';
import { OLQueue } from 'lib/queue';

const q = new OLQueue('localhost', 6379, process.env.REDIS_PASSWORD);

async function runJob() {
  if (process.argv.length < 3) {
    console.error('Please provide a job name as an argument.');
    process.exit(1);
  }

  const methodName = process.argv[2];
  const jobName = process.argv[3];
  const jobArgs: string[] = process.argv.slice(4);
  const jobData: Record<string, string> = {};

  for (const arg of jobArgs) {
    const [key, value] = arg.split('=');
    if (key && value) {
      jobData[key] = value;
    }
  }

  if (methodName === 'purge') {
    await q.purge();
  }

  if (methodName === 'run' && jobName) {
    await q.addJob({
      name: jobName,
      data: jobData,
    });
  }
  // await q.addJob({
  //   name: 'parse-eventor-dates',
  //   data: {},
  // });
  // await q.addJob({
  //   name: 'sync-eventor-competition',
  //   data: {
  //     eventorId: '22600',
  //     countryCode: 'no',
  //   },
  // });
  // await q.addJob({
  //   name: 'sync-eventor-competition',
  //   data: {
  //     eventorId: '23185',
  //     countryCode: 'au',
  //   },
  // });
  // await q.addJob({
  //   name: 'sync-eventor-competition',
  //   data: {
  //     eventorId: '49056',
  //     countryCode: 'se',
  //   },
  // });
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

  process.exit(0);
}
runJob();
