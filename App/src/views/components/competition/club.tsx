import * as React from 'react';
import { OLText } from '../text';
import { Image, ViewStyle, View } from 'react-native';
import { px } from 'util/const';

interface Props {
  name: string;
  logoUrl?: string;
  size?: string;
  style?: ViewStyle;
}

export const OLCompetitionClub: React.FC<Props> = ({
  name,
  style,
  logoUrl,
  size,
}) => {
  if (!logoUrl) {
    return null;
  }

  return (
    <View style={style}>
      <View
        style={{
          alignItems: 'center',
        }}
      >
        <Image
          source={{ uri: `${logoUrl}?type=${size}` }}
          style={{
            height: px(40),
            width: px(40),
            marginBottom: px(8),
          }}
        />

        <OLText size={18} bold italics>
          {name}
        </OLText>
      </View>
    </View>
  );
};
