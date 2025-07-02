import 'dotenv/config';
import { OLQueue } from 'lib/queue';

const q = new OLQueue('localhost', 6379, process.env.REDIS_PASSWORD);

async function runJob() {
  await q.addJob({
    name: 'sync-competition',
    data: {
      competitionId: 33767,
    },
  });
  await q.addJob({
    name: 'sync-class',
    data: {
      competitionId: 33767,
      className: 'H21',
    },
  });

  process.exit(0);
}
runJob();
