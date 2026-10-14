import { sql } from 'drizzle-orm';

/**
 * Several Liveresultat uploads can share one olCompetitionId: the same race
 * uploaded twice, with the organizer spelled slightly differently
 * ("Vänersborgs SK" / "VänersborgsSK"), slugs to the same id. A lookup of one
 * competition by olCompetitionId must pick one deterministically, or an empty
 * duplicate can hide the real one. Prefer the upload that has classes, then
 * the newest.
 *
 * Only for single-competition lookups. The EXISTS runs once per candidate row
 * (cheap via live_classes_liveCompetitionId_idx), but joined into the list
 * queries it would run for every competition on every request.
 */
export const liveCompetitionPreference = (alias: string) =>
  sql.raw(
    `EXISTS (SELECT 1 FROM live_classes AS c WHERE c."liveCompetitionId" = ${alias}.id) DESC, ${alias}.id DESC`,
  );

/** `LEFT JOIN` exposing the preferred live competition of `oc` as `lc`. */
export const preferredLiveCompetitionJoin = sql`
  LEFT JOIN LATERAL (
    SELECT l.* FROM live_competitions AS l
    WHERE l."olCompetitionId" = oc.id
    ORDER BY ${liveCompetitionPreference('l')}
    LIMIT 1
  ) AS lc ON true`;
