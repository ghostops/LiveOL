import React from 'react';
import { px } from '~/util/const';
import { OLText } from '../text';
import { OLListItem } from '../list/item';
import { TRPCQueryOutput } from '~/lib/trpc/client';
import { ViewStyle } from 'react-native';

interface Props {
  competition: TRPCQueryOutput['getCompetitions']['competitions'][0];
  index?: number;
  total?: number;
  onCompetitionPress?: (
    comp: TRPCQueryOutput['getCompetitions']['competitions'][0],
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
