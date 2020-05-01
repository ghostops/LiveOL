const { Sequelize, Model, DataTypes } = require('sequelize');
const axios = require('axios').default;
const uuid = require('uuid');
const fs = require('fs');
// const { host, database, password, username } = require('./.secret/db');

// CONFIG
const ROOT = 'https://liveresultat.orientering.se';
const COMPETITION = '17320';
const CLASSNAME = 'D14';

// How often to scrape
const INTERVAL_IN_MS = 60000;
// END CONFIG

// const sequelize = new Sequelize({
//     database,
//     host,
//     password,
//     username,
//     dialect: 'mysql',
// });

// class Result extends Model {}

// Result.init({
//     id: {
//         type: DataTypes.UUID,
//         primaryKey: true,
//     },
//     data: DataTypes.TEXT,
//     competition: DataTypes.TEXT,
//     classname: DataTypes.TEXT,
// }, { sequelize, modelName: 'result' });

const saveData = async (data) => {
    // await Result.create({
    //     id: uuid.v4(),
    //     data,
    //     competition: COMPETITION,
    //     classname: CLASSNAME,
    // });

    fs.writeFileSync(`./out-${Date.now()}`, JSON.stringify(
        {
            id: uuid.v4(),
            data,
            competition: COMPETITION,
            classname: CLASSNAME,
        }
    ));
};

const fetchData = async () => {
    try {
        const res = await axios.get(`${ROOT}/api.php?method=getclassresults&comp=${COMPETITION}&class=${CLASSNAME}`);
        return res.data;
    } catch {
        console.log('failed to fetch data', new Date().toISOString());
    }
}

let scrapeCount = 0;

const scrape = async () => {
    const data = await fetchData();

    if (data) {
        try {
            const json = JSON.stringify(data);

            await saveData(json);

            scrapeCount++;
        } catch {
            console.log('failed to save data', new Date().toISOString());
        }
    }

    console.log(`Successfuly scraped ${scrapeCount} times so far`);
}

(async () => {
    // await sequelize.sync();

    await scrape();

    setInterval(
        () => scrape(),
        INTERVAL_IN_MS,
    );
})();
