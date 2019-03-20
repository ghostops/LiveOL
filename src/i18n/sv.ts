import { Platform } from 'react-native';

export default {
    home: {
        title: 'LiveOL',
        today: 'Idag',
        page: 'Sida',
        search: 'Sök',
        goToday: 'Gå till Idag',
        nothingToday: 'Det är inga tävlingar idag',
        nothingSearch: 'Inga tävlingar hittades',
    },
    competitions: {
        organizedBy: 'Organiseras av',
        classes: 'Klasser',
        lastPassings: 'Senaste Passeringarna',
        noClasses: 'Inga klasser',
        passings: {
            title: 'Senaste passeringarna',
            class: 'Klass',
            name: 'Namn',
            passTime: 'Passeringstid',
            info: 'Dra för att uppdatera',
        },
    },
    classes: {
        autoUpdate: 'Automatisk uppdatering',
        resultsFor: 'Resultat för',
    },
    info: {
        title: 'Information',
        // tslint:disable
        body: [
            `LiveOL är en app som visar orienteringsresultat live och bygger på liveresultat.orientering.se.`,
            `Du får resultaten direkt i mobilen eller på surfplattan paketerat i ett smidigt användargränssnitt.`,
            `Appen är framtagen av Ludvig Larsendahl och koden finns Open Source på GitHub (sök på LiveOL).`,
        ],
        // tslint:enable
        rate: 'Betygsätt appen',
        update: {
            noUpdate: {
                title: 'Ingen uppdatering',
                text: 'Ingen nyare version fanns att hämta',
            },
            hasUpdate: {
                title: 'Uppdatering hittad',
                text: 'En nyare version finns att hämta',
                cta: 'Uppdatera nu',
                cancel: 'Avbryt',
            },
            check: 'Kolla efter uppdateringar',
        },
        version: 'Nuvarande version',
        appStore: `Öppna ${Platform.OS === 'ios' ? 'App Store' : 'Google Play'}`,
        contact: 'Kontakta mig',
        purgeCache: 'Ta bort cache',
        purged: 'sparade tävlingar togs bort',
        donate: 'Donera för att supporta appen',
        donateExplanation: 'Stöd appens utveckling och underhåll genom att donera en slant',
    },
    back: 'Bakåt',
    status: {
        short: [
            'OK',
            'DNS',
            'DNF',
            'MP',
            'DSQ',
            'OT',
            'Ej Startat',
            'Ej Startat',
            'Walk Over',
            'Bytte Klass',
        ],
        long: [
            'OKEJ',
            'Startade Ej',
            'Avslutade Ej',
            'Missade Kontroll',
            'Diskvalificerad',
            'Över Maxtid',
            'Ej Startat',
            'Ej Startat',
            'Walk Over',
            'Bytte Klass',
        ],
    },
};
