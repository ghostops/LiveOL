import axios from 'axios';
import uuid from 'uuid';
import fs from 'fs';

// CONFIG
const ROOT = 'https://liveresultat.orientering.se';
const COMPETITION = '17340';
const CLASSNAME = 'D17-20';
const OUT_DIR = './out';

// How often to scrape
const INTERVAL_IN_MS = 60000;
// END CONFIG

const saveData = async (data: unknown) => {
  fs.writeFileSync(
    `${OUT_DIR}/${Date.now()}.json`,
    JSON.stringify({
      id: uuid.v4(),
      data,
      competition: COMPETITION,
      classname: CLASSNAME,
    }),
  );
};

const fetchData = async () => {
  try {
    const res = await axios.get(
      `${ROOT}/api.php?method=getclassresults&comp=${COMPETITION}&class=${CLASSNAME}`,
    );
    return res.data;
  } catch {
    console.log('failed to fetch data', new Date().toISOString());
  }
};

let scrapeCount = 0;

const scrape = async () => {
  const data = await fetchData();

  if (data) {
    try {
      await saveData(data);

      scrapeCount++;
    } catch {
      console.log('failed to save data', new Date().toISOString());
    }
  }

  console.log(`Successfuly scraped ${scrapeCount} times so far`);
};

(async () => {
  try {
    fs.opendirSync(OUT_DIR);
  } catch (e) {
    fs.mkdirSync(OUT_DIR);
  }

  await scrape();

  setInterval(() => scrape(), INTERVAL_IN_MS);
})();
