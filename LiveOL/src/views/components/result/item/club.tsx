/* eslint-disable @typescript-eslint/unbound-method */
import * as React from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Routes } from 'lib/nav/routes';
import { TouchableOpacity } from 'react-native';
import { OLText } from '../../text';

interface Props {
  club: string;
}

export const OLResultClub: React.FC<Props> = ({ club }) => {
  const { navigate } = useNavigation();
  const { params } = useRoute();

  const id = (params as any).id;

  return (
    <TouchableOpacity
      onPress={() =>
        navigate(Routes.club, {
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
