import { Command } from 'commander';
import { eq } from '../../../../server/node_modules/drizzle-orm';
import { getDatabase } from '../lib/db';
import { TimeGenerator, DEFAULT_TIME_CONFIG } from '../lib/time-generator';
import {
  LiveCompetitionsTable,
  LiveResultsTable,
  LiveSplitResultsTable,
  LiveSplitControllsTable,
} from '../../../../server/src/lib/db/schema';
import { MOCK_COMPETITION_PREFIX } from '../lib/mock-data';

interface RunnerProgress {
  result: typeof LiveResultsTable.$inferSelect;
  splitTime: number;
  controlIndex: number;
  controlCode: string;
}

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export const progressCommand = new Command('progress')
  .description('Advance all runners through one more control')
  .argument('<competitionId>', 'Competition ID to progress')
  .action(async competitionId => {
    try {
      const db = getDatabase();
      const compId = parseInt(competitionId);

      if (isNaN(compId)) {
        console.error(`Invalid competition ID: ${competitionId}`);
        process.exit(1);
      }

      // 1. Validate competition exists
      const [competition] = await db.db
        .select()
        .from(LiveCompetitionsTable)
        .where(eq(LiveCompetitionsTable.id, compId))
        .limit(1);

      if (!competition) {
        console.error(`Competition ${compId} not found`);
        process.exit(1);
      }

      if (!competition.name.startsWith(MOCK_COMPETITION_PREFIX)) {
        console.error(
          `Can only progress mock competitions (must start with ${MOCK_COMPETITION_PREFIX})`,
        );
        process.exit(1);
      }

      // 2. Fetch all results
      const results = await db.db
        .select()
        .from(LiveResultsTable)
        .where(eq(LiveResultsTable.liveCompetitionId, compId));

      if (results.length === 0) {
        console.error(`No runners found for competition ${compId}`);
        process.exit(1);
      }

      // 3. Fetch controls
      const controls = await db.db
        .select()
        .from(LiveSplitControllsTable)
        .where(eq(LiveSplitControllsTable.liveClassId, results[0].liveClassId))
        .orderBy(LiveSplitControllsTable.order);

      const timeGen = new TimeGenerator(DEFAULT_TIME_CONFIG);
      const updatedRunners: RunnerProgress[] = [];

      // 4. Process each runner
      for (const result of results) {
        // Check current progress
        const existingSplits = await db.db
          .select()
          .from(LiveSplitResultsTable)
          .where(eq(LiveSplitResultsTable.liveResultId, result.liveResultId));

        const completedCount = existingSplits.length;

        // If already finished, skip
        if (completedCount >= 3) continue;

        // Determine next control
        const nextControlIndex = completedCount;
        const nextControl = controls[nextControlIndex];

        if (!nextControl) {
          console.error(`No control found at index ${nextControlIndex}`);
          continue;
        }

        // Generate split time (cumulative from start)
        const splitTime = timeGen.generateSplitTime(
          result.liveResultId,
          nextControlIndex,
        );

        // Store for ranking calculation
        updatedRunners.push({
          result,
          splitTime,
          controlIndex: nextControlIndex,
          controlCode: nextControl.code,
        });
      }

      // Check if any runners to progress
      if (updatedRunners.length === 0) {
        console.log('All runners have already finished!');
        return;
      }

      // 5. Calculate rankings and timeplus
      updatedRunners.sort((a, b) => a.splitTime - b.splitTime);
      const leaderTime = updatedRunners[0].splitTime;

      // 6. Insert split results and update runner progress
      for (let i = 0; i < updatedRunners.length; i++) {
        const runner = updatedRunners[i];
        const timeplus = runner.splitTime - leaderTime;
        const place = i + 1;

        await db.db.insert(LiveSplitResultsTable).values({
          liveResultId: runner.result.liveResultId,
          code: runner.controlCode,
          time: runner.splitTime,
          timeplus,
          place,
          status: 0,
        });

        // Update progress
        const newProgress = Math.round(
          ((runner.controlIndex + 1) / 3) * 100,
        );

        if (runner.controlIndex === 2) {
          // Finished
          await db.db
            .update(LiveResultsTable)
            .set({
              progress: 100,
              result: runner.splitTime,
              timeplus,
              place: String(place),
              updatedAt: new Date(),
            })
            .where(
              eq(LiveResultsTable.liveResultId, runner.result.liveResultId),
            );
        } else {
          // Still running
          await db.db
            .update(LiveResultsTable)
            .set({
              progress: newProgress,
              timeplus,
              place: String(place),
              updatedAt: new Date(),
            })
            .where(
              eq(LiveResultsTable.liveResultId, runner.result.liveResultId),
            );
        }
      }

      // 7. Output results
      console.log('');
      console.log(
        `✓ Advanced ${updatedRunners.length} runners through control ${updatedRunners[0].controlCode}`,
      );
      console.log(
        `  Leader: ${updatedRunners[0].result.name} (${formatTime(leaderTime)})`,
      );
      console.log('');
      console.log('Current standings:');

      for (let i = 0; i < Math.min(5, updatedRunners.length); i++) {
        const runner = updatedRunners[i]!;
        const time = formatTime(runner.splitTime);
        const behind =
          i === 0 ? '' : ` +${formatTime(runner.splitTime - leaderTime)}`;
        console.log(
          `  ${i + 1}. ${runner.result.name.padEnd(20)} ${time}${behind}`,
        );
      }

      const completedControls = updatedRunners[0].controlIndex + 1;
      console.log('');
      console.log(`Status: ${completedControls} of 3 controls completed`);

      if (completedControls < 3) {
        console.log('Run again to progress to next control');
      } else {
        console.log('All runners have finished!');
      }
      console.log('');
    } catch (error) {
      console.error('Error progressing competition:', error);
      process.exit(1);
    }
  });
