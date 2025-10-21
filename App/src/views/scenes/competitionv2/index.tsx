import { RouteProp, useRoute } from '@react-navigation/native';
import { View } from 'react-native';
import { useTheme } from '~/hooks/useTheme';
import { RootStack } from '~/lib/nav/router';
import { $api } from '~/lib/react-query/api';
import { OLText } from '~/views/components/text';
import { useOLNavigation } from '~/hooks/useNavigation';
import { useLayoutEffect } from 'react';

export const OLSceneCompetitionV2 = () => {
  const { colors } = useTheme();
  const { params } = useRoute<RouteProp<RootStack, 'CompetitionV2'>>();
  const navigation = useOLNavigation();

  const getCompetitionQuery = $api.useQuery('get', '/v2/competitions/{id}', {
    params: {
      path: {
        id: params.olCompetitionId,
      },
    },
  });

  const title = getCompetitionQuery.data?.data.competition.name;

  useLayoutEffect(() => {
    navigation.setOptions({ title });
  }, [navigation, title]);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.WHITE,
      }}
    >
      <OLText>{getCompetitionQuery.data?.data.competition.name}</OLText>
    </View>
  );
};
