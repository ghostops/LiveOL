import { View } from 'react-native';
import { useTheme } from '~/hooks/useTheme';
import { paths } from '~/lib/react-query/schema';
import { OLResultAnimation } from '~/views/components/result/item/animation';
import { OLResultBadge } from '~/views/components/result/item/badge';
import { OLResultLiveRunning } from '~/views/components/result/item/liveRunning';
import { OLResultTime } from '~/views/components/result/item/time';
import { OLResultTimeplus } from '~/views/components/result/item/timeplus';
import { OLText } from '~/views/components/text';
import { OLRunnerContextMenu } from '~/views/components/result/contextMenu';

type Props = {
  olCompetitionId: string;
  resultItem: paths['/v2/results/live/organizations/{olCompetitionId}/{olOrganizationId}']['get']['responses']['200']['content']['application/json']['data']['results'][number];
};

export const OLClubResultRow = ({
  resultItem: result,
  olCompetitionId,
}: Props) => {
  const { colors, px } = useTheme();

  return (
    <OLRunnerContextMenu
      result={result}
      olCompetitionId={olCompetitionId}
      liveClassId={result.liveClassId}
    >
      <OLResultAnimation
        hasUpdated={!!result.hasRecentlyUpdated}
        isTracking={result.isTracking}
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
              width: px(60),
              alignItems: 'center',
              paddingRight: px(8),
            }}
          >
            <OLResultBadge place={result.place} />
          </View>
          <View style={{ flex: 1, paddingRight: px(4) }}>
            <OLText numberOfLines={1}>{result.name || 'N/A'}</OLText>
            {result.liveClassId && result.className && (
              <OLText numberOfLines={1} style={{ color: colors.BLUE }}>
                {result.className}
              </OLText>
            )}
          </View>
          <View
            style={{
              minWidth: px(80),
              gap: px(4),
              alignItems: 'flex-end',
              paddingRight: px(8),
            }}
          >
            {result.start && result.isLive ? (
              <OLResultLiveRunning startTime={result.start} />
            ) : (
              <>
                <OLResultTime status={result.status} time={result.result} />
                <OLResultTimeplus
                  status={result.status}
                  timeplus={result.timeplus}
                />
              </>
            )}
          </View>
        </View>
      </OLResultAnimation>
    </OLRunnerContextMenu>
  );
};
