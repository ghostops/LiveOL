import { RouteProp, useRoute } from '@react-navigation/native';
import { View } from 'react-native';
import { RootStack } from '~/lib/nav/router';
import { OLText } from '~/views/components/text';

export const OLSceneLiveResults = () => {
  const { params } = useRoute<RouteProp<RootStack, 'LiveResults'>>();
  const { liveClassId } = params;

  return (
    <View>
      <OLText>Results V2 Scene: {liveClassId}</OLText>
    </View>
  );
};
