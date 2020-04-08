import { Club } from 'lib/graphql/fragments/types/Club';

export const clubLogoUrl = (club: Club, size: number): string => {
    if (size > club.clubLogoSizes.length - 1) {
        throw new Error(`size can max be ${club.clubLogoSizes.length - 1}`);
    }
    return `${club.clubLogoUrl}?type=${club.clubLogoSizes[size]}`;
};
