import React from 'react';
import { useRoute } from '@react-navigation/native';
import { TouchableOpacity } from 'react-native';
import { OLText } from '../../text';
import { useOLNavigation } from 'hooks/useNavigation';

interface Props {
  club: string;
}

export const OLResultClub: React.FC<Props> = ({ club }) => {
  const { navigate } = useOLNavigation();
  const { params } = useRoute();

  const id = (params as any).id;

  return (
    <TouchableOpacity
      onPress={() =>
        navigate('Club', {
          clubName: club,
          competitionId: id,
          title: club,
        })
      }
      hitSlop={{ bottom: 15, left: 15, right: 15, top: 15 }}
      style={{ flexDirection: 'row', alignItems: 'center' }}>
      <OLText
        numberOfLines={1}
        size={16}
        font="Proxima Nova Regular"
        style={{
          color: 'grey',
        }}>
        {club}
      </OLText>
    </TouchableOpacity>
  );
};
