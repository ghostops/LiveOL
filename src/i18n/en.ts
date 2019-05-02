import { Platform } from 'react-native';

export default {
    home: {
        title: 'LiveOL',
        today: 'Today',
        page: 'Page',
        search: 'Search',
        goToday: 'Scroll to Today',
        nothingToday: 'There are no competitions today',
        nothingSearch: 'No competitions found',
    },
    competitions: {
        organizedBy: 'Organized by',
        classes: 'Classes',
        lastPassings: 'Last Passings',
        noClasses: 'No classes',
        passings: {
            title: 'Latest passings',
            class: 'Class',
            name: 'Name',
            passTime: 'Pass-time',
            info: 'Pull to refresh',
        },
    },
    classes: {
        autoUpdate: 'Turn on live updating results',
        resultsFor: 'Results for',
    },
    info: {
        title: 'Information',
        // tslint:disable
        body: [
            `LiveOL is an app that displays orienteering-results live, built upon liveresultat.orientering.se.`,
            `You get the results conveniently on your phone or tablet packaged in a neat interface.`,
            `The app is made by Ludvig Larsendahl and the code is Open Source on GitHub (search LiveOL).`,
        ],
        // tslint:enable
        rate: 'Rate the app',
        update: {
            noUpdate: {
                title: 'No update',
                text: 'No newer version found',
            },
            hasUpdate: {
                title: 'Update found',
                text: 'A newer version was found',
                cta: 'Update now',
                cancel: 'Cancel',
            },
            check: 'Check for updates',
        },
        version: 'Current version',
        appStore: `Open ${Platform.OS === 'ios' ? 'App Store' : 'Google Play'}`,
        contact: 'Contact me',
        purgeCache: 'Clear cached results',
        purged: 'saved events were removed',
        donate: 'Donate to support the app',
        donateExplanation: 'Support the development of the app by donating',
    },
    back: 'Back',
    status: {
        short: [
            'OK',
            'DNS',
            'DNF',
            'MP',
            'DSQ',
            'OT',
            '',
            '',
            '',
            'Not Started Yet',
            'Not Started Yet',
            'Walk Over',
            'Moved Up',
        ],
        long: [
            'OKAY',
            'Did Not Start',
            'Did Not Finish',
            'Missing Punch',
            'Disqualified',
            'Over Max Time',
            '',
            '',
            '',
            'Not Started Yet',
            'Not Started Yet',
            'Walk Over',
            'Moved Up',
        ],
    },
};
