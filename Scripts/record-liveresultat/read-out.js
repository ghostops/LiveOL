const fs = require('fs');
const readline = require('readline');

// CONFIG
const OUT_DIR = './out';
const FOLLOW = 'Dominykas Prakapas';
// END CONFIG

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const readFile = (file) => {
    const data = fs.readFileSync(`${OUT_DIR}/${file}`).toString();
    const parsed = JSON.parse(data);

    if (typeof parsed.data !== 'object') {
        parsed.data = JSON.parse(parsed.data);
    }

    const followed = parsed.data.results.find((u) => u.name === FOLLOW);

    console.log(JSON.stringify(followed, null, 4));
}

const prompt = (index, dir) => {
    if (index === dir.length) {
        process.exit(0);
    };

    rl.question('Continue?', () => {
        readFile(dir[index]);
        index = index + 1;
        prompt(index, dir);
    });
}

(async () => {
    const dir = fs.readdirSync(OUT_DIR);

    prompt(0, dir);
})();
