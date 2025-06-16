import React from 'react';
import { px } from '~/util/const';
import { OLText } from '../text';
import { OLListItem } from '../list/item';
import { ViewStyle } from 'react-native';
import { paths } from '~/lib/react-query/schema';

interface Props {
  competition: paths['/v1/competitions']['get']['responses']['200']['content']['application/json']['data']['competitions'][0];
  index?: number;
  total?: number;
  onCompetitionPress?: (
    comp: paths['/v1/competitions']['get']['responses']['200']['content']['application/json']['data']['competitions'][0],
  ) => void;
  style?: ViewStyle;
}

export const HomeListItem: React.FC<Props> = ({
  competition,
  index,
  total,
  onCompetitionPress,
  style,
}) => {
  return (
    <OLListItem
      key={competition.id}
      style={{
        paddingHorizontal: px(16),
        paddingVertical: px(8),
        borderBottomWidth: index === (total || 0) - 1 ? 0 : 1,
        ...style,
      }}
      onPress={() => onCompetitionPress && onCompetitionPress(competition)}
    >
      <OLText size={16} numberOfLines={1}>
        {competition.name}
      </OLText>
    </OLListItem>
  );
};
