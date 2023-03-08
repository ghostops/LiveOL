import React from 'react';
import { TouchableOpacity } from 'react-native';
import { OLText } from '../../text';
import { useOLNavigation } from 'hooks/useNavigation';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStack } from 'lib/nav/router';

interface Props {
  className: string;
}

export const OLClassName: React.FC<Props> = ({ className }) => {
  const { navigate } = useOLNavigation();

  const {
    params: { competitionId },
  } = useRoute<RouteProp<RootStack, 'Results'>>();

  return (
    <TouchableOpacity
      onPress={() => navigate('Results', { className, competitionId })}
    >
      <OLText
        numberOfLines={1}
        size={16}
        style={{
          color: 'grey',
        }}
      >
        {className}
      </OLText>
    </TouchableOpacity>
  );
};
