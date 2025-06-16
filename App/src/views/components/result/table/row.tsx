import React from 'react';
import { Dimensions, View } from 'react-native';
import { px } from '~/util/const';
import { OLStartTime } from '~/views/components/result/item/start';
import { OLSplits } from '~/views/components/result/item/splits';
import { OLResultTimeplus } from '~/views/components/result/item/timeplus';
import { OLResultTime } from '~/views/components/result/item/time';
import { OLResultName } from '~/views/components/result/item/name';
import { OLResultLiveRunning } from '../item/liveRunning';
import { OLResultListItem } from '../item/listItem';
import { OLResultColumn } from '~/views/components/result/item/column';
import { OLResultClub } from '~/views/components/result/item/club';
import { OLResultBadge } from '~/views/components/result/item/badge';
import { OLResultAnimation } from '~/views/components/result/item/animation';
import { isLiveRunning } from '~/util/isLive';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { OLRunnerContextMenu } from '../contextMenu';
import { OLClassName } from '../item/className';
import { paths } from '~/lib/react-query/schema';

interface OwnProps {
  result: paths['/v1/results/{competitionId}/club/{clubName}']['get']['responses']['200']['content']['application/json']['data']['results'][0];
  disabled?: boolean;
  followed?: boolean;
  club?: boolean;
}

type Props = OwnProps;

export const LANDSCAPE_WIDTH = {
  place: px(60),
  name: px(160),
  start: px(100),
  time: px(80),
  splits: px(90),
};

export const getExtraSize = (splits?: number): number => {
  const { width } = Dimensions.get('window');

  const noSplits = [
    LANDSCAPE_WIDTH.place,
    LANDSCAPE_WIDTH.name,
    LANDSCAPE_WIDTH.start,
    LANDSCAPE_WIDTH.time,
  ].reduce((a, b) => a + b, 0);

  const withSplits = noSplits + LANDSCAPE_WIDTH.splits * (splits || 1);

  let extraSize = 0;

  if (withSplits < width) {
    extraSize = width - withSplits;
  }

  return extraSize - px(20);
};

const OLRowTime: React.FC<Props> = ({ result, disabled }) => {
  if (disabled) {
    return null;
  }

  if (isLiveRunning(result)) {
    return <OLResultLiveRunning startTime={result.startTime} />;
  }

  return (
    <>
      <OLResultTime status={result.status} time={result.result} />

      <View style={{ height: px(4) }} />

      <OLResultTimeplus status={result.status} timeplus={result.timeplus} />
    </>
  );
};

export const OLTableRow: React.FC<Props> = ({
  result,
  disabled,
  followed,
  club,
}) => {
  const { left, right } = useSafeAreaInsets();

  const extraSize = getExtraSize(result.splits.length);

  return (
    <OLRunnerContextMenu result={result} club={!!club}>
      <OLResultAnimation
        result={result}
        style={{
          paddingLeft: left,
          paddingRight: right,
        }}
      >
        <OLResultListItem
          style={{ backgroundColor: followed ? '#edded1' : 'transparent' }}
        >
          <OLResultColumn
            align="center"
            style={{ width: LANDSCAPE_WIDTH.place }}
          >
            <OLResultBadge place={result.place} />
          </OLResultColumn>

          <OLResultColumn style={{ width: LANDSCAPE_WIDTH.name + extraSize }}>
            <OLResultName name={result.name} />
            {!club && <OLResultClub club={result.club || ''} />}
            {club && <OLClassName className={result.class || ''} />}
          </OLResultColumn>

          <OLResultColumn style={{ width: LANDSCAPE_WIDTH.start }}>
            <OLStartTime time={result.start} />
          </OLResultColumn>

          {result.splits.map(split => {
            return (
              <OLResultColumn
                style={{ width: LANDSCAPE_WIDTH.splits }}
                key={split.id}
                align="flex-start"
              >
                <OLSplits split={split} best={split.place === 1} />
              </OLResultColumn>
            );
          })}

          <OLResultColumn
            align="flex-end"
            style={{ width: LANDSCAPE_WIDTH.time }}
          >
            <OLRowTime result={result} disabled={disabled} />
          </OLResultColumn>
        </OLResultListItem>
      </OLResultAnimation>
    </OLRunnerContextMenu>
  );
};
