import { px } from '~/util/const';
import { OLResultAnimation } from '~/views/components/result/item/animation';
import { OLResultBadge } from '~/views/components/result/item/badge';
import { OLResultClub } from '~/views/components/result/item/club';
import { OLResultColumn } from '~/views/components/result/item/column';
import { OLResultName } from '~/views/components/result/item/name';
import { OLResultTime } from '~/views/components/result/item/time';
import { OLResultTimeplus } from '~/views/components/result/item/timeplus';
import { OLStartTime } from '~/views/components/result/item/start';
import { View } from 'react-native';
import { OLResultListItem } from '../item/listItem';
import { OLResultLiveRunning } from '../item/liveRunning';
import { isLiveRunning, startIsAfterNow } from '~/util/isLive';
import { OLClassName } from '../item/className';
import { OLRunnerContextMenu } from '../contextMenu';
import { paths } from '~/lib/react-query/schema';

type Props = {
  result: paths['/v1/results/{competitionId}/club/{clubName}']['get']['responses']['200']['content']['application/json']['data']['results'][0];
  disabled?: boolean;
  club?: boolean;
  followed?: boolean;
};

export const PORTRAIT_SIZE = {
  place: 15,
  name: 50,
  start: 0,
  time: 35,
};

export const OLItemTime: React.FC<Pick<Props, 'result' | 'disabled'>> = ({
  result,
  disabled,
}) => {
  if (disabled) {
    return null;
  }

  if (isLiveRunning(result)) {
    return <OLResultLiveRunning startTime={result.startTime} />;
  }

  if (!result.result?.length && !startIsAfterNow(result)) {
    return <OLStartTime time={result.start} />;
  }

  return (
    <>
      {result.result && (
        <OLResultTime status={result.status} time={result.result} />
      )}

      <View style={{ height: px(4) }} />

      <OLResultTimeplus status={result.status} timeplus={result.timeplus} />
    </>
  );
};

export const OLResultItem: React.FC<Props> = ({
  result,
  club,
  disabled,
  followed,
}) => {
  return (
    <OLRunnerContextMenu result={result} club={!!club}>
      <OLResultAnimation result={result}>
        <OLResultListItem
          style={{ backgroundColor: followed ? '#edded1' : 'transparent' }}
        >
          <OLResultColumn size={PORTRAIT_SIZE.place} align="center">
            <OLResultBadge place={result.place} />
          </OLResultColumn>

          <OLResultColumn size={PORTRAIT_SIZE.name}>
            <OLResultName name={result.name} />

            {!club && <OLResultClub club={result.club || ''} />}
            {club && <OLClassName className={result.class || ''} />}
          </OLResultColumn>

          <OLResultColumn align="flex-end" size={PORTRAIT_SIZE.time}>
            <OLItemTime result={result} disabled={disabled} />
          </OLResultColumn>
        </OLResultListItem>
      </OLResultAnimation>
    </OLRunnerContextMenu>
  );
};
