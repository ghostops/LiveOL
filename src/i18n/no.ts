import { Platform } from 'react-native';

export default {
    home: {
        title: 'LiveOL',
        today: 'I dag',
        page: 'Side',
        search: 'Søk',
        goToday: 'Gå til dagens arrangement',
        nothingToday: 'Det er ingen arrangement i dag',
        nothingSearch: 'Ingen arrangement ble funnet',
    },
    competitions: {
        organizedBy: 'Arrangeres av',
        classes: 'Klasser',
        lastPassings: 'Siste passeringer',
        noClasses: 'Ingen klasser',
        passings: {
            title: 'Siste passeringer',
            class: 'Klasse',
            name: 'Navn',
            passTime: 'Passeringstid',
            info: 'Dra for å oppdatere',
        },
    },
    classes: {
        autoUpdate: 'Automatisk oppdatering',
        resultsFor: 'Resultat for',
    },
    info: {
        title: 'Informasjon',
        // tslint:disable
        body: [
            `LiveOL er en app som viser resultater live og bygger på liveresultat.orientering.se.`,
            `Du får resultatene direkte i mobilen eller på nettbrettet via et enkelt brukergrensesnitt.`,
            `Appen er utviklet av Ludvig Larsendahl og koden finnes som Open Source på GitHub (søk etter LiveOL).`,
        ],
        // tslint:enable
        rate: 'Sett karakter på appen',
        update: {
            noUpdate: {
                title: 'Ingen oppdatering',
                text: 'Ingen nyere versjon funnet',
            },
            hasUpdate: {
                title: 'Oppdatering funnet',
                text: 'En nyere versjon er klar for nedlasting',
                cta: 'Oppdatere nå',
                cancel: 'Avbryt',
            },
            check: 'Se etter oppdateringer',
        },
        version: 'Gjeldende version',
        appStore: `Åpne ${Platform.OS === 'ios' ? 'App Store' : 'Google Play'}`,
        contact: 'Kontakt meg',
        purgeCache: 'Ta bort cache',
        purged: 'lagrede løp ble slettet',
    },
    back: 'Tilbake',
    status: {
        short: [
            'OK',
            'DNS',
            'DNF',
            'DSQ',
            'DSQ',
            'OT',
            '',
            '',
            '',
            'Ikke startet',
            'Ikke startet',
            'Stått over',
            'Byttet klasse',
        ],
        long: [
            'OK',
            'Ikke startet',
            'Brutt',
            'Diskvalifisert',
            'Diskvalifisert',
            'Over makstid',
            '',
            '',
            '',
            'Ikke startet',
            'Ikke startet',
            'Stått over',
            'Byttet klasse',
        ],
    },
};
