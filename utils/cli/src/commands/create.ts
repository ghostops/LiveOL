import { Command } from 'commander';
import { getDatabase } from '../lib/db';
import {
  CompetitionId,
  OrganizationId,
  RunnerId,
  generateLiveClassId,
  generateLiveResultId,
} from '../lib/id-utils';
import {
  generateMockRunners,
  MOCK_CLASS_NAME,
  MOCK_CONTROL_CODES,
  MOCK_COMPETITION_PREFIX,
} from '../lib/mock-data';
import {
  LiveCompetitionsTable,
  LiveClassesTable,
  LiveSplitControllsTable,
  LiveResultsTable,
  OLCompetitionsTable,
  OLOrganizationsTable,
  OLRunnersTable,
} from '../../../../server/src/lib/db/schema';
import { nowInCentisecondsFromMidnight } from '../lib/utils';

export const createCommand = new Command('create')
  .description('Create a new mock competition with 10 runners')
  .option(
    '--name <name>',
    'Competition name',
    `${MOCK_COMPETITION_PREFIX} Test Competition`,
  )
  .option('--organizer <org>', 'Organizer name', 'Mock OK')
  .action(async options => {
    try {
      const db = getDatabase();

      // 1. Generate unique competition ID
      const competitionId = 2147483647 - Math.floor(
        Math.random() * 10000,
      );
      const date = new Date();

      // 2. Generate OL IDs
      const olCompetitionId = new CompetitionId().generateId({
        competitionName: options.name,
        organizationName: options.organizer,
        date,
      });

      const olOrganizationId = new OrganizationId().generateId({
        organizationName: options.organizer,
      });

      console.log(`Creating mock competition: ${options.name}`);
      console.log(`  Competition ID: ${competitionId}`);

      // 3. Insert competition
      await db.db.insert(LiveCompetitionsTable).values({
        id: competitionId,
        name: options.name,
        organizer: options.organizer,
        date,
        isPublic: true,
        olCompetitionId,
        olOrganizationId,
      });

      await db.db
        .insert(OLCompetitionsTable)
        .values({
          id: olCompetitionId,
          countryCode: 'SE',
        })
        .onConflictDoNothing();

      await db.db
        .insert(OLOrganizationsTable)
        .values({
          id: olOrganizationId,
        })
        .onConflictDoNothing();

      // 4. Insert class
      const liveClassId = generateLiveClassId(competitionId, MOCK_CLASS_NAME);

      await db.db.insert(LiveClassesTable).values({
        liveClassId,
        liveCompetitionId: competitionId,
        name: MOCK_CLASS_NAME,
        status: 'InProgress',
      });

      console.log(`  Class: ${MOCK_CLASS_NAME}`);

      // 5. Insert split controls
      for (let i = 0; i < MOCK_CONTROL_CODES.length; i++) {
        await db.db.insert(LiveSplitControllsTable).values({
          liveClassId,
          code: MOCK_CONTROL_CODES[i],
          name: `Control ${i + 1}`,
          order: i,
        });
      }

      console.log(`  Controls: ${MOCK_CONTROL_CODES.join(', ')}`);

      // 6. Insert runners
      const mockRunners = generateMockRunners();
      const startTime = nowInCentisecondsFromMidnight();

      for (let i = 0; i < mockRunners.length; i++) {
        const runner = mockRunners[i];

        const olRunnerId = new RunnerId().generateId({
          className: MOCK_CLASS_NAME,
          fullName: runner.name,
          organizationName: runner.club,
        });

        const olOrgId = new OrganizationId().generateId({
          organizationName: runner.club,
        });

        const liveResultId = generateLiveResultId(
          liveClassId,
          runner.name,
          runner.club,
          '', // Place not assigned yet
        );

        // 6000 is one minute
        const runnerStartTime = startTime; // + i * 3_000; <- to stagger starts by 30 seconds

        await db.db.insert(LiveResultsTable).values({
          liveResultId,
          liveClassId,
          liveCompetitionId: competitionId,
          name: runner.name,
          organization: runner.club,
          olRunnerId,
          olOrganizationId: olOrgId,
          start: runnerStartTime,
          result: null,
          timeplus: 0,
          progress: 0,
          status: 0,
          place: null,
        });

        await db.db
          .insert(OLRunnersTable)
          .values({
            id: olRunnerId,
          })
          .onConflictDoNothing();

        await db.db
          .insert(OLOrganizationsTable)
          .values({
            id: olOrgId,
          })
          .onConflictDoNothing();
      }

      console.log(`  Runners: ${mockRunners.length}`);
      console.log('');
      console.log('✓ Mock competition created successfully!');
      console.log('');
      console.log('To progress runners through controls, run:');
      console.log(`  livecli progress ${competitionId}`);
    } catch (error) {
      console.error('Error creating mock competition:', error);
      process.exit(1);
    }
  });
