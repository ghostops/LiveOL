import fs from 'fs';
import path from 'path';

const DIR = path.join(__dirname, '..', 'fixtures');

/** Raw fixture text, exactly as the API returned it. */
export const raw = (rel: string): string =>
  fs.readFileSync(path.join(DIR, rel), 'utf8');

export const json = <T>(rel: string): T => JSON.parse(raw(rel)) as T;

export const fixtureMeta = () =>
  json<{
    main: { comp: number; className: string; club: string };
    duplicates: { comp: number; className: string };
  }>('meta.json');
