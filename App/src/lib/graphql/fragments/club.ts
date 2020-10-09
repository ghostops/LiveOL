import { gql } from 'apollo-boost';

export const ClubFragment = gql`
	fragment Club on OLClub {
		id
		name
		country
		address
		website
		email
		clubLogoUrl
		clubLogoSizes
	}
`;
