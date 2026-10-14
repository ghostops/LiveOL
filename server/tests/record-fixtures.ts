/**
 * Records real responses from both Liveresultat APIs into tests/fixtures/.
 *
 * Run while the legacy api.php is still answering — once it is gone these
 * recordings are the only reference for what the migration must reproduce.
 *
 *   npx tsx tests/record-fixtures.ts
 */
import fs from 'fs';
import path from 'path';

const LEGACY = 'https://liveresultat.orientering.se/api.php';
const NEW = 'https://api.orienteering.services';

const DIR = path.join(__dirname, 'fixtures');

// 40488: SM lång 2026 — 1048 runners, 32 classes. D18A has 5 split controls.
// 40467: uploaded twice, so M21E-1 has duplicate name+club pairs (one finished
//        row and one never-started ghost) — the dedupe and sweep edge case.
const MAIN = {
  comp: 40488,
  className: 'D18A',
  club: 'IFK Göteborg Orientering',
};
const DUPES = { comp: 40467, className: 'M21E-1' };

const get = async (url: string) => {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'LiveOL Server', 'Accept-Encoding': 'gzip, br' },
  });
  return {
    status: res.status,
    etag: res.headers.get('etag'),
    body: await res.text(),
  };
};

const write = (rel: string, body: string) => {
  const file = path.join(DIR, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, body);
  console.log(`  ${rel}  ${body.length}B`);
};

const legacy = (qs: string) => `${LEGACY}?${qs}`;

(async () => {
  console.log('legacy (api.php):');

  write(
    'legacy/getcompetitioninfo.json',
    (await get(legacy(`method=getcompetitioninfo&comp=${MAIN.comp}`))).body,
  );

  const classes = await get(legacy(`method=getclasses&comp=${MAIN.comp}`));
  write('legacy/getclasses.json', classes.body);
  const classesHash = JSON.parse(classes.body).hash;
  write(
    'legacy/getclasses.notmodified.json',
    (
      await get(
        legacy(`method=getclasses&comp=${MAIN.comp}&last_hash=${classesHash}`),
      )
    ).body,
  );

  const cr = await get(
    legacy(
      `method=getclassresults&comp=${MAIN.comp}&class=${encodeURIComponent(MAIN.className)}&unformattedTimes=true`,
    ),
  );
  write('legacy/getclassresults.json', cr.body);
  const crHash = JSON.parse(cr.body).hash;
  write(
    'legacy/getclassresults.notmodified.json',
    (
      await get(
        legacy(
          `method=getclassresults&comp=${MAIN.comp}&class=${encodeURIComponent(MAIN.className)}&unformattedTimes=true&last_hash=${crHash}`,
        ),
      )
    ).body,
  );

  write(
    'legacy/getclassresults.duplicates.json',
    (
      await get(
        legacy(
          `method=getclassresults&comp=${DUPES.comp}&class=${encodeURIComponent(DUPES.className)}&unformattedTimes=true`,
        ),
      )
    ).body,
  );

  write(
    'legacy/getlastpassings.json',
    (await get(legacy(`method=getlastpassings&comp=${MAIN.comp}`))).body,
  );
  write(
    'legacy/getclubresults.json',
    (
      await get(
        legacy(
          `method=getclubresults&comp=${MAIN.comp}&club=${encodeURIComponent(MAIN.club)}`,
        ),
      )
    ).body,
  );

  console.log('new (api.orienteering.services):');

  write(
    'new/competition.json',
    (await get(`${NEW}/competitions/${MAIN.comp}`)).body,
  );
  write(
    'new/classes.json',
    (await get(`${NEW}/competitions/${MAIN.comp}/classes`)).body,
  );
  write(
    'new/classresults.json',
    (
      await get(
        `${NEW}/competitions/${MAIN.comp}/classresults?class=${encodeURIComponent(MAIN.className)}`,
      )
    ).body,
  );
  write(
    'new/classresults.duplicates.json',
    (
      await get(
        `${NEW}/competitions/${DUPES.comp}/classresults?class=${encodeURIComponent(DUPES.className)}`,
      )
    ).body,
  );
  write(
    'new/classresults.unknownclass.json',
    (
      await get(
        `${NEW}/competitions/${MAIN.comp}/classresults?class=NoSuchClass`,
      )
    ).body,
  );
  write(
    'new/passings.json',
    (await get(`${NEW}/competitions/${MAIN.comp}/passings`)).body,
  );
  write(
    'new/remaining.json',
    (await get(`${NEW}/competitions/${MAIN.comp}/remaining`)).body,
  );
  write(
    'new/export.json',
    (await get(`${NEW}/competitions/${MAIN.comp}/export`)).body,
  );

  const meta = {
    recordedAt: new Date().toISOString(),
    main: MAIN,
    duplicates: DUPES,
    note: 'Recorded from the live APIs. legacy/* is what the current client consumes; new/* is what the migration must adapt to the same internal shape.',
  };
  write('meta.json', JSON.stringify(meta, null, 2) + '\n');
})();
