import {
  EVENTOR_CLUB_ICON_SIZES,
  EventorClubIconSize,
  EventorCompetitionDistance,
  EventorEventItem,
} from 'lib/eventor/types';
import { LiveresultatApi } from 'lib/liveresultat/types';

export interface IOLCompetitionResponse {
  competitions: IOLCompetition[];
  today: IOLCompetition[];
  page: number;
  lastPage: number;
  search: string | null;
}

export interface IOLCompetition {
  id: number;
  name: string;
  organizer: string;
  date: string;

  // Eventor props
  eventorAvailable: boolean;
  info?: string;
  club?: string;
  clubLogoUrl?: string;
  clubLogoSizes: EventorClubIconSize[];
  canceled?: boolean | null;
  distance?: EventorCompetitionDistance;
  district?: string;
  signups?: number;
  eventorUrl?: string;
}

export const marshallCompetition =
  (eventor?: EventorEventItem) =>
  (liveres: LiveresultatApi.competition): IOLCompetition => {
    let marshall: IOLCompetition = {
      id: liveres.id,
      name: liveres.name,
      organizer: liveres.organizer,
      date: liveres.date,
      clubLogoSizes: EVENTOR_CLUB_ICON_SIZES,
      eventorAvailable: false,
      eventorUrl: undefined,
    };

    if (eventor) {
      marshall = {
        ...marshall,
        eventorAvailable: true,
        info: eventor.info,
        club: eventor.club,
        clubLogoUrl: eventor.clubLogoUrl || undefined,
        canceled: eventor.canceled,
        distance: eventor.competitionDistance || undefined,
        district: eventor.district,
        signups: eventor.signups,
        eventorUrl: eventor.url,
      };
    }

    return marshall;
  };
