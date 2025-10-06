import { eq, or } from 'drizzle-orm';
import {
  EventorResultsTable,
  EventorSignupsTable,
  OLOrganizationsTable,
  OLRunnersTable,
} from 'lib/db/schema';
import { apiSingletons } from '../singletons';

export const matchEventorSignUpToRunner = async (
  eventorSignup: typeof EventorSignupsTable.$inferSelect,
) => {
  const api = apiSingletons.createApiSingletons();
  const eventorName = eventorSignup.name.toLowerCase().trim();

  const [matchingRunner] = await api.Drizzle.db
    .select()
    .from(OLRunnersTable)
    .where(
      or(
        eq(OLRunnersTable.eventorName, eventorName),
        eq(OLRunnersTable.liveName, eventorName),
      ),
    )
    .limit(1);

  if (matchingRunner) {
    await api.Drizzle.db
      .update(EventorSignupsTable)
      .set({ olRunnerId: matchingRunner.id })
      .where(eq(EventorSignupsTable.id, eventorSignup.id));

    return;
  }

  const organization = await matchOrganization(eventorSignup.organization);

  await api.Drizzle.db.insert(OLRunnersTable).values({
    eventorName: eventorSignup.name.trim(),
    olOrganizationId: organization?.id,
    punchCardNumbers: eventorSignup.punchCardNumber
      ? [eventorSignup.punchCardNumber]
      : [],
  });
};

export const matchEventorResultToRunner = async (
  eventorResult: typeof EventorResultsTable.$inferSelect,
) => {
  const api = apiSingletons.createApiSingletons();
  const eventorName = eventorResult.name.toLowerCase().trim();

  const [matchingRunner] = await api.Drizzle.db
    .select()
    .from(OLRunnersTable)
    .where(
      or(
        eq(OLRunnersTable.eventorName, eventorName),
        eq(OLRunnersTable.liveName, eventorName),
      ),
    )
    .limit(1);

  if (matchingRunner) {
    await api.Drizzle.db
      .update(EventorResultsTable)
      .set({ olRunnerId: matchingRunner.id })
      .where(eq(EventorResultsTable.id, eventorResult.id));

    return;
  }

  const organization = await matchOrganization(eventorResult.organization);

  await api.Drizzle.db.insert(OLRunnersTable).values({
    eventorName: eventorResult.name.trim(),
    olOrganizationId: organization?.id,
  });
};

const matchOrganization = async (orgName?: string | null) => {
  if (!orgName) return undefined;
  const api = apiSingletons.createApiSingletons();

  let organization: typeof OLOrganizationsTable.$inferSelect | undefined =
    undefined;

  if (orgName) {
    [organization] = await api.Drizzle.db
      .select()
      .from(OLOrganizationsTable)
      .where(eq(OLOrganizationsTable.eventorName, orgName.trim()))
      .limit(1);

    if (!organization) {
      [organization] = await api.Drizzle.db
        .insert(OLOrganizationsTable)
        .values({
          eventorName: orgName.trim(),
        })
        .returning();
    }
  }

  return organization;
};
