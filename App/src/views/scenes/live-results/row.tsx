import { View } from 'react-native';
import { useTheme } from '~/hooks/useTheme';
import { paths } from '~/lib/react-query/schema';
import { OLResultAnimation } from '~/views/components/result/item/animation';
import { OLResultBadge } from '~/views/components/result/item/badge';
import { OLResultTime } from '~/views/components/result/item/time';
import { OLResultTimeplus } from '~/views/components/result/item/timeplus';
import { OLText } from '~/views/components/text';
import { useRowWidths } from './useRowWidths';
import { useOrientation } from '~/hooks/useOrientation';
import { OrientationType } from 'react-native-orientation-locker';
import { OLRunnerContextMenu } from '~/views/components/result/contextMenu';
import { OLRowTime } from './row-time';

type Props = {
  olCompetitionId: string;
  liveResultItem: paths['/v2/results/live/{liveClassId}']['get']['responses']['200']['content']['application/json']['data']['results'][number];
  liveSplitControls?:
    | {
        name: string;
        code: string;
      }[]
    | undefined;
};

export const OLLiveResultRow = ({
  liveResultItem: result,
  olCompetitionId,
  liveSplitControls,
}: Props) => {
  const { colors, px } = useTheme();
  const { place, name, time, splits } = useRowWidths();
  const orientation = useOrientation();

  return (
    <OLRunnerContextMenu
      result={result}
      olCompetitionId={olCompetitionId}
      olOrganizationId={result.olOrganizationId}
    >
      <OLResultAnimation
        isTracking={result.isTracking}
        hasUpdated={!!result.hasRecentlyUpdated}
      >
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
            <OLText numberOfLines={1}>{result.name || 'N/A'}</OLText>
            <OLText numberOfLines={1} style={{ color: colors.BLUE }}>
              {result.organization}
            </OLText>
          </View>
          {liveSplitControls?.map(control => {
            const split = result.splitResults?.find(
              s => s.code === control.code,
            );
            return (
              <View key={control.code} style={{ width: splits, gap: px(4) }}>
                {split?.time && (
                  <>
                    <OLResultTime status={0} time={split.time} />
                    <OLResultTimeplus status={0} timeplus={split.timeplus} />
                  </>
                )}
              </View>
            );
          })}
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
