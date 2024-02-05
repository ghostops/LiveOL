import {
  EVENTOR_CLUB_ICON_SIZES,
  EventorClub,
  EventorClubIconSize,
} from 'lib/eventor/types';

export interface IOLClub {
  id: number;
  name: string;
  country: string;
  address: string;
  website: string;
  email: string;
  clubLogoUrl: string;
  clubLogoSizes: EventorClubIconSize[];
}

export const marshallClub = (res?: EventorClub): IOLClub | null => {
  if (!res) {
    return null;
  }

  return {
    id: res.id,
    name: res.name,
    address: res.address,
    country: res.country,
    email: res.email,
    website: res.website,
    clubLogoUrl: res.clubLogoUrl,
    clubLogoSizes: EVENTOR_CLUB_ICON_SIZES,
  };
};
