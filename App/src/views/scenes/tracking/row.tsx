import { TouchableOpacity, View } from 'react-native';
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
import { useOLNavigation } from '~/hooks/useNavigation';
import { useRowWidths } from '../live-results/useRowWidths';

type Props = {
  result: paths['/v2/results/live/tracked/{trackingId}']['get']['responses']['200']['content']['application/json']['data']['results'][number];
};

export const OLTrackingResultRow = ({ result }: Props) => {
  const { colors } = useTheme();
  const { place, name, time } = useRowWidths();
  const orientation = useOrientation();
  const navigation = useOLNavigation();

  return (
    <OLResultAnimation hasUpdated={!!result.hasRecentlyUpdated}>
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
          <OLResultBadge place={result.place} />
        </View>
        <View style={{ width: name, paddingRight: 4 }}>
          <OLText numberOfLines={1}>{result.name || 'N/A'}</OLText>
          <TouchableOpacity
            onPress={() => {
              if (result.olCompetitionId) {
                navigation.navigate('Competition', {
                  olCompetitionId: result.olCompetitionId,
                });
              }
            }}
            style={{ marginBottom: 2 }}
          >
            <OLText numberOfLines={1} style={{ color: colors.GREEN }}>
              {result.competitionName || 'N/A'}
            </OLText>
          </TouchableOpacity>
          <View style={{ flexDirection: 'row', gap: 4 }}>
            <TouchableOpacity
              onPress={() => {
                if (result.olOrganizationId && result.olCompetitionId) {
                  navigation.navigate('LiveResults', {
                    olCompetitionId: result.olCompetitionId,
                    liveClassId: result.liveClassId,
                  });
                }
              }}
            >
              <OLText numberOfLines={1} style={{ color: colors.BLUE }}>
                {result.className}
              </OLText>
            </TouchableOpacity>
            <OLText>/</OLText>
            <TouchableOpacity
              onPress={() => {
                if (result.olOrganizationId && result.olCompetitionId) {
                  navigation.navigate('ClubResults', {
                    olCompetitionId: result.olCompetitionId,
                    olOrganizationId: result.olOrganizationId,
                  });
                }
              }}
            >
              <OLText numberOfLines={1} style={{ color: colors.BLUE }}>
                {result.organization}
              </OLText>
            </TouchableOpacity>
          </View>
        </View>
        <View
          style={{
            width: time,
            gap: 4,
            alignItems: 'flex-end',
            paddingRight: 8,
          }}
        >
          <OLRowTime result={result} />
        </View>
      </View>
    </OLResultAnimation>
  );
};

const OLRowTime = ({ result }: Pick<Props, 'result'>) => {
  if (result.start && result.isLive) {
    return <OLResultLiveRunning startTime={result.start} />;
  }

  return (
    <View style={{ gap: 4, alignItems: 'flex-end', paddingRight: 8 }}>
      <OLResultTime status={result.status} time={result.result} />

      <OLResultTimeplus status={result.status} timeplus={result.timeplus} />
    </View>
  );
};
