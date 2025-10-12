import 'dotenv/config';
import { OLQueue } from 'lib/queue';

const q = new OLQueue('localhost', 6379, process.env.REDIS_PASSWORD);

async function runJob() {
  //await q.purge();

  await q.addJob({
    name: 'sync-eventor-competitions',
    data: {
      startDate: '2025-10-05',
      endDate: '2025-10-06',
    },
  });

  await q.addJob({
    name: 'sync-live-competitions',
    data: {
      startDate: '2025-10-05',
      endDate: '2025-10-06',
    },
  });

  // await q.addJob({
  //   name: 'sync-eventor-competition',
  //   data: {
  //     eventorId: 49078,
  //   },
  // });

  // await q.addJob({
  //   name: 'sync-live-competition',
  //   data: {
  //     competitionId: 34169,
  //   },
  // });

  process.exit(0);
}
runJob();
