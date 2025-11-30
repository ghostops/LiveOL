import { View } from 'react-native';
import { useTheme } from '~/hooks/useTheme';
import { paths } from '~/lib/react-query/schema';
import { OLResultAnimation } from '~/views/components/result/item/animation';
import { OLResultBadge } from '~/views/components/result/item/badge';
import { OLResultLiveRunning } from '~/views/components/result/item/liveRunning';
import { OLResultTime } from '~/views/components/result/item/time';
import { OLResultTimeplus } from '~/views/components/result/item/timeplus';
import { OLText } from '~/views/components/text';
import { useOrientation } from '~/hooks/useOrientation';
import { OrientationType } from 'react-native-orientation-locker';
import { useRowWidths } from '../live-results/useRowWidths';
import { OLRunnerContextMenu } from '~/views/components/result/contextMenu';

type Props = {
  result: paths['/v2/results/live/tracked/{trackingId}']['get']['responses']['200']['content']['application/json']['data']['results'][number];
};

export const OLTrackingResultRow = ({ result }: Props) => {
  const { colors, px } = useTheme();
  const { place, name, time } = useRowWidths();
  const orientation = useOrientation();

  return (
    <OLRunnerContextMenu
      result={result}
      olCompetitionId={result.olCompetitionId || undefined}
      olOrganizationId={result.olOrganizationId}
      liveClassId={result.liveClassId}
      canTrackRunner={false}
      canGoToCompetition={true}
    >
      <OLResultAnimation hasUpdated={!!result.hasRecentlyUpdated}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: px(8),
          }}
        >
          <View
            style={{
              width: place,
              alignItems:
                orientation === OrientationType.PORTRAIT
                  ? 'center'
                  : 'flex-end',
              paddingRight: px(8),
            }}
          >
            <OLResultBadge place={result.place} />
          </View>
          <View style={{ width: name, paddingRight: px(4) }}>
            <OLText numberOfLines={1} style={{ marginBottom: px(4) }}>
              {result.name || 'N/A'}
            </OLText>
            <OLText numberOfLines={1} style={{ color: colors.GREEN }} bold>
              {result.competitionName || 'N/A'}
            </OLText>
            <OLText numberOfLines={1} style={{ color: colors.BLUE }}>
              {result.className}
            </OLText>
            <OLText numberOfLines={1} style={{ color: colors.BLUE }}>
              {result.organization}
            </OLText>
          </View>
          <View
            style={{
              width: time,
              gap: px(4),
              alignItems: 'flex-end',
              paddingRight: px(8),
            }}
          >
            <OLRowTime result={result} />
          </View>
        </View>
      </OLResultAnimation>
    </OLRunnerContextMenu>
  );
};

const OLRowTime = ({ result }: Pick<Props, 'result'>) => {
  const { px } = useTheme();

  if (result.start && result.isLive) {
    return <OLResultLiveRunning startTime={result.start} />;
  }

  return (
    <View style={{ gap: px(4), alignItems: 'flex-end', paddingRight: px(8) }}>
      <OLResultTime status={result.status} time={result.result} />

      <OLResultTimeplus status={result.status} timeplus={result.timeplus} />
    </View>
  );
};
