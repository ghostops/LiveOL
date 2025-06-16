const fs = require('fs');
const { exec } = require('child_process');

async function getDataKey() {
  const response = await fetch('http://localhost:3036/v1/documentation');
  const json = await response.json();
  return json.data;
}

getDataKey()
  .then(data => {
    fs.writeFileSync('/tmp/data.json', JSON.stringify(data, null, 2));
    console.log('Data written to /tmp/data.json');
    exec(
      'npx openapi-typescript /tmp/data.json -o ./src/schema.d.ts',
      (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`);
          return;
        }
        if (stdout) {
          console.log(`stdout: ${stdout}`);
        }
        if (stderr) {
          console.error(`stderr: ${stderr}`);
        }
      },
    );
  })
  .catch(err => {
    console.error(err);
  });
