import { sql } from 'drizzle-orm';

/**
 * Several Liveresultat uploads can share one olCompetitionId: the same race
 * uploaded twice, with the organizer spelled slightly differently
 * ("Vänersborgs SK" / "VänersborgsSK"), slugs to the same id. Every read from
 * olCompetitionId to a live competition picks one: the upload that has
 * classes, then the newest.
 *
 * Ordered on live_competitions' own columns only. A subquery on live_classes
 * here runs once per competition in the list queries, which is what took the
 * API down in #94.
 */
export const liveCompetitionPreference = (alias: string) =>
  sql.raw(`${alias}."hasClasses" DESC, ${alias}.id DESC`);

/**
 * `LEFT JOIN` exposing the preferred live competition of `oc` as `lc`. An
 * anti-join rather than LATERAL … LIMIT 1, so the list queries keep a hash
 * join: a per-row lateral lookup was ~10x slower on the main page.
 */
export const preferredLiveCompetitionJoin = sql`
  LEFT JOIN live_competitions AS lc
    ON lc."olCompetitionId" = oc.id
    AND NOT EXISTS (
      SELECT 1 FROM live_competitions AS better
      WHERE better."olCompetitionId" = lc."olCompetitionId"
        AND (better."hasClasses", better.id) > (lc."hasClasses", lc.id)
    )`;
