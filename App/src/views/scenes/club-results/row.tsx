import { TouchableOpacity, View } from 'react-native';
import { useTheme } from '~/hooks/useTheme';
import { paths } from '~/lib/react-query/schema';
import { OLResultAnimation } from '~/views/components/result/item/animation';
import { OLResultBadge } from '~/views/components/result/item/badge';
import { OLResultLiveRunning } from '~/views/components/result/item/liveRunning';
import { OLResultTime } from '~/views/components/result/item/time';
import { OLResultTimeplus } from '~/views/components/result/item/timeplus';
import { OLText } from '~/views/components/text';
import { useOLNavigation } from '~/hooks/useNavigation';
import { OLRunnerContextMenu } from '~/views/components/result/contextMenu';

type Props = {
  olCompetitionId: string;
  resultItem: paths['/v2/results/live/organizations/{olCompetitionId}/{olOrganizationId}']['get']['responses']['200']['content']['application/json']['data']['results'][number];
};

export const OLClubResultRow = ({ resultItem, olCompetitionId }: Props) => {
  const { colors } = useTheme();
  const navigation = useOLNavigation();

  return (
    <OLRunnerContextMenu result={resultItem}>
      <OLResultAnimation hasUpdated={false}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 8,
            paddingHorizontal: 8,
          }}
        >
          <View
            style={{
              width: 60,
              alignItems: 'center',
              paddingRight: 8,
            }}
          >
            <OLResultBadge place={resultItem.place} />
          </View>
          <View style={{ flex: 1, paddingRight: 8 }}>
            <OLText numberOfLines={1}>{resultItem.name || 'N/A'}</OLText>
            {resultItem.liveClassId && resultItem.className && (
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate('LiveResults', {
                    liveClassId: resultItem.liveClassId,
                    olCompetitionId: olCompetitionId,
                  });
                }}
              >
                <OLText
                  numberOfLines={1}
                  size={12}
                  style={{ color: colors.BLUE }}
                >
                  {resultItem.className}
                </OLText>
              </TouchableOpacity>
            )}
          </View>
          <View
            style={{
              minWidth: 80,
              gap: 4,
              alignItems: 'flex-end',
              paddingRight: 8,
            }}
          >
            {resultItem.start && resultItem.isLive ? (
              <OLResultLiveRunning startTime={resultItem.start} />
            ) : (
              <>
                <OLResultTime
                  status={resultItem.status}
                  time={resultItem.result}
                />
                <OLResultTimeplus
                  status={resultItem.status}
                  timeplus={resultItem.timeplus}
                />
              </>
            )}
          </View>
        </View>
      </OLResultAnimation>
    </OLRunnerContextMenu>
  );
};
