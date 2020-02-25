const express = require('express');
const app = express();
const port = 3000;
const fs = require('fs');

const getData = (file) => {
    const str = fs.readFileSync(__dirname + '/' + file).toString();

    return JSON.parse(str);
}

app.get('/api.php', (req, res) => {
    console.log(req.query.method);

    switch (req.query.method) {
        case 'getcompetitions':
            return res.json(getData('allcompetitions.json'));
        case 'getcompetitioninfo':
            return res.json(getData('getcompetitioninfo.json'));
        case 'getclasses':
            return res.json(getData('getclasses.json'));
        case 'getlastpassings':
            return res.json(getData('getlastpassings.json'));
        case 'getclassresults':
            return res.json(getData('getclassresults-radio.json'));
        case 'getclubresults':
            return res.json(getData('getclubresults.json'));
    }

    return res.json({});
});

app.listen(port, () => console.log(`Test server listening on port ${port}!`));
