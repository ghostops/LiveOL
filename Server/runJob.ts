import 'dotenv/config';
import { OLQueue } from 'lib/queue';

const q = new OLQueue('localhost', 6379, process.env.REDIS_PASSWORD);

async function runJob() {
  await q.addJob({
    name: 'sync-competition',
    data: {
      competitionId: 33766,
    },
  });

  process.exit(0);
}
runJob();
