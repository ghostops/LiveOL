import { TouchableOpacity, View } from 'react-native';
import { useTheme } from '~/hooks/useTheme';
import { paths } from '~/lib/react-query/schema';
import { OLResultAnimation } from '~/views/components/result/item/animation';
import { OLResultBadge } from '~/views/components/result/item/badge';
import { OLResultLiveRunning } from '~/views/components/result/item/liveRunning';
import { OLResultTime } from '~/views/components/result/item/time';
import { OLResultTimeplus } from '~/views/components/result/item/timeplus';
import { OLText } from '~/views/components/text';
import { useRowWidths } from './useRowWidths';
import { useOrientation } from '~/hooks/useOrientation';
import { OrientationType } from 'react-native-orientation-locker';
import { useOLNavigation } from '~/hooks/useNavigation';

type Props = {
  olCompetitionId: string;
  liveResultItem: paths['/v2/results/live/{liveClassId}']['get']['responses']['200']['content']['application/json']['data']['results'][number];
};

export const OLLiveResultRow = ({ olCompetitionId, liveResultItem }: Props) => {
  const { colors } = useTheme();
  const { place, name, time, splits } = useRowWidths();
  const orientation = useOrientation();
  const navigation = useOLNavigation();

  return (
    <OLResultAnimation hasUpdated={!!liveResultItem.hasRecentlyUpdated}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 8,
        }}
      >
        <View
          style={{
            width: place,
            alignItems:
              orientation === OrientationType.PORTRAIT ? 'center' : 'flex-end',
            paddingRight: 8,
          }}
        >
          <OLResultBadge place={liveResultItem.place} />
        </View>
        <View style={{ width: name, paddingRight: 4 }}>
          <OLText numberOfLines={1}>{liveResultItem.name || 'N/A'}</OLText>
          <TouchableOpacity
            onPress={() => {
              if (liveResultItem.olOrganizationId) {
                navigation.navigate('ClubResults', {
                  olCompetitionId,
                  olOrganizationId: liveResultItem.olOrganizationId,
                });
              }
            }}
          >
            <OLText numberOfLines={1} style={{ color: colors.BLUE }}>
              {liveResultItem.organization}
            </OLText>
          </TouchableOpacity>
        </View>
        {liveResultItem.splitResults?.map(split => (
          <View key={split.code} style={{ width: splits, gap: 4 }}>
            <OLResultTime
              status={split.time ? 0 : split.status}
              time={split.time}
            />
            <OLResultTimeplus
              status={split.time ? 0 : split.status}
              timeplus={split.timeplus}
            />
          </View>
        ))}
        <View
          style={{
            width: time,
            gap: 4,
            alignItems: 'flex-end',
            paddingRight: 8,
          }}
        >
          <OLRowTime liveResultItem={liveResultItem} />
        </View>
      </View>
    </OLResultAnimation>
  );
};

const OLRowTime = ({ liveResultItem }: Pick<Props, 'liveResultItem'>) => {
  if (liveResultItem.start && liveResultItem.isLive) {
    return <OLResultLiveRunning startTime={liveResultItem.start} />;
  }

  return (
    <View style={{ gap: 4, alignItems: 'flex-end', paddingRight: 8 }}>
      <OLResultTime
        status={liveResultItem.status}
        time={liveResultItem.result}
      />

      <OLResultTimeplus
        status={liveResultItem.status}
        timeplus={liveResultItem.timeplus}
      />
    </View>
  );
};
