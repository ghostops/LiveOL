import * as React from 'react';
import { GET_CLUB_BY_NAME } from 'lib/graphql/queries/clubs';
import { GetClubByName, GetClubByNameVariables } from 'lib/graphql/queries/types/GetClubByName';
import { OLError } from 'views/components/error';
import { useQuery } from '@apollo/react-hooks';
import { View } from 'native-base';
import { Lang } from 'lib/lang';
import { OLText } from '../text';
import { Image, Linking, ViewStyle } from 'react-native';
import { px } from 'util/const';
import { clubLogoUrl } from 'util/clubUrl';
import { TouchableOpacity } from 'react-native-gesture-handler';

interface Props {
    clubName: string;
    style?: ViewStyle;
}

export const OLCompetitionClub: React.SFC<Props> = ({ clubName, style }) => {
    const { data, loading, error } =
        useQuery<GetClubByName, GetClubByNameVariables>(
            GET_CLUB_BY_NAME,
            { variables: { name: clubName } },
        );

    if (error) return <OLError error={error} />;

    if (loading) return <View />;

    const club = data.clubs.getClubByName;

    const goToWebsite = () => Linking.openURL(club.website);

    return (
        <View style={style}>
            <TouchableOpacity
                onPress={goToWebsite}
                activeOpacity={!!club.website ? .55 : 1}
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                }}
            >
                <Image
                    source={{ uri: clubLogoUrl(club, 2) }}
                    style={{
                        height: px(40),
                        width: px(40),
                        marginRight: px(8),
                    }}
                />

                <OLText
                    size={16}
                    font="Proxima_Nova"
                >
                    {club.name}
                </OLText>
            </TouchableOpacity>
        </View>
    );
};
