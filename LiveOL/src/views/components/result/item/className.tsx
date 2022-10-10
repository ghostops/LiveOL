import React from 'react';
import { TouchableOpacity } from 'react-native';
import { OLText } from '../../text';
import { useOLNavigation } from 'hooks/useNavigation';
import { useRoute } from '@react-navigation/native';

interface Props {
  className: string;
}

export const OLClassName: React.FC<Props> = ({ className }) => {
  const { navigate } = useOLNavigation();
  const { params } = useRoute();

  const id = (params as any).competitionId;

  return (
    <TouchableOpacity
      onPress={() => navigate('Results', { className, competitionId: id })}>
      <OLText
        numberOfLines={1}
        size={16}
        font="Proxima Nova Regular"
        style={{
          color: 'grey',
        }}>
        {className}
      </OLText>
    </TouchableOpacity>
  );
};
