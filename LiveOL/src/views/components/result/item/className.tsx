/* eslint-disable @typescript-eslint/unbound-method */
import * as React from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Routes } from 'lib/nav/routes';
import { TouchableOpacity } from 'react-native';
import { OLText } from '../../text';

interface Props {
  className: string;
}

export const OLClassName: React.FC<Props> = ({ className }) => {
  const { navigate } = useNavigation();
  const { params } = useRoute();

  const id = (params as any).competitionId;

  return (
    <TouchableOpacity
      onPress={() =>
        navigate(Routes.results, { className, competitionId: id })
      }>
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
