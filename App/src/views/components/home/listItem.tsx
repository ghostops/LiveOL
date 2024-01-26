import React from 'react';
import { px } from '~/util/const';
import { OLText } from '../text';
import { OLListItem } from '../list/item';
import { TRPCQueryOutput } from '~/lib/trpc/client';

interface Props {
  competition: TRPCQueryOutput['getCompetitions']['competitions'][0];
  index?: number;
  total?: number;
  onCompetitionPress?: (
    comp: TRPCQueryOutput['getCompetitions']['competitions'][0],
  ) => void;
}

export const HomeListItem: React.FC<Props> = ({
  competition,
  index,
  total,
  onCompetitionPress,
}) => {
  return (
    <OLListItem
      key={competition.id}
      style={{
        marginLeft: 0,
        paddingHorizontal: px(16),
        paddingVertical: px(12),
        width: '100%',
        borderBottomWidth: index === (total || 0) - 1 ? 0 : 1,
      }}
      onPress={() => onCompetitionPress && onCompetitionPress(competition)}
    >
      <OLText size={16}>{competition.name}</OLText>
    </OLListItem>
  );
};
