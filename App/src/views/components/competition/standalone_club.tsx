import * as React from 'react';
import _ from 'lodash';
import { clubLogoUrl } from 'util/clubUrl';
import { GET_CLUB_BY_NAME } from 'lib/graphql/queries/clubs';
import { GetClubByName, GetClubByNameVariables } from 'lib/graphql/queries/types/GetClubByName';
import { Image, Linking, ViewStyle, View } from 'react-native';
import { OLError } from 'views/components/error';
import { OLText } from '../text';
import { px } from 'util/const';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useQuery } from '@apollo/react-hooks';

interface Props {
	clubName: string;
	logoUrl?: string;
	style?: ViewStyle;
}

export const OLCompetitionClub: React.FC<Props> = ({ clubName, style, logoUrl }) => {
	const { data, loading, error } = useQuery<GetClubByName, GetClubByNameVariables>(GET_CLUB_BY_NAME, {
		variables: { name: clubName },
	});

	if (error) return <OLError error={error} />;

	const club = _.get(data, 'clubs.getClubByName', {});

	const goToWebsite = () => club && Linking.openURL(club.website);

	return (
		<View style={style}>
			<TouchableOpacity
				onPress={goToWebsite}
				activeOpacity={club.website ? 0.55 : 1}
				style={{
					flexDirection: 'row',
					alignItems: 'center',
				}}
			>
				<Image
					source={{ uri: loading ? logoUrl : clubLogoUrl(club, 2) }}
					style={{
						height: px(40),
						width: px(40),
						marginRight: px(8),
					}}
				/>

				<OLText size={16} font="Proxima_Nova">
					{club.name}
				</OLText>
			</TouchableOpacity>
		</View>
	);
};
