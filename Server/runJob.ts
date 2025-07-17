import 'dotenv/config';
import { OLQueue } from 'lib/queue';

const q = new OLQueue('localhost', 6379, process.env.REDIS_PASSWORD);

async function runJob() {
  await q.addJob({
    name: 'match-eventor-and-live',
    data: {
      //competitionId: 33767,
    },
  });

  process.exit(0);
}
runJob();
