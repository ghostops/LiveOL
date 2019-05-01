const express = require('express');
const app = express();
const port = 3000;

app.get('/api.php', (req, res) => {
    console.log(req.query.method);

    switch (req.query.method) {
        case 'getcompetitions':
            return res.json(require('./allcompetitions.json'));
        case 'getcompetitioninfo':
            return res.json(require('./getcompetitioninfo.json'));
        case 'getclasses':
            return res.json(require('./getclasses.json'));
        case 'getlastpassings':
            return res.json(require('./getlastpassings.json'));
        case 'getclassresults':
            // return res.json(require('./getclassresults.json'));
            return res.json(require('./getclassresults-radio.json'));
        case 'getclubresults':
            return res.json(require('./getclubresults.json'));
    }

    return res.json({});
});

app.listen(port, () => console.log(`Test server listening on port ${port}!`));
