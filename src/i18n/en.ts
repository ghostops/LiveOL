import { Platform } from 'react-native';

export default {
    home: {
        title: 'LiveOL',
        today: 'Today',
        page: 'Page',
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
            `LiveOL is an app that displays orienteering-results live, built upon Peter Löfås' liveresultat.orientering.se.`,
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
    },
    back: 'Back',
};
