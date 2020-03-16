const { deploy } = require('sftp-sync-deploy');
const readline = require('readline');
const writable = require('stream').Writable;

const mutableStdout = new writable({
    write: function(chunk, encoding, callback) {
        callback();
    }
});

const rl = readline.createInterface({
    input: process.stdin,
    output: mutableStdout,
    terminal: true,
});

const upload = (password) => {
    let config = {
        password,
        ...require('./cred.json'),
    };

    let options = {
        exclude: [
            'node_modules',
            '.ci',
        ],
        excludeMode: 'remove',
        forceUpload: false
    };

    deploy(config, options).then(() => {
        console.log('success!');
    }).catch(err => {
        console.error('error! ', err);
    }).finally(() => process.exit(1));
}

if (!!process.env['SFTP_PASSWORD']) {
    upload(process.env['SFTP_PASSWORD']);
} else {
    process.stdout.write('Password: ');

    rl.question('', (password) => {
        if (!password && !password.length) return console.error('No password');
        rl.close();
        upload(password);
    });
}
