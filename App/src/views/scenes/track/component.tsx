import { useTranslation } from 'react-i18next';
import { FlatList, RefreshControl, TouchableOpacity, View } from 'react-native';
import { useOLNavigation } from '~/hooks/useNavigation';
import { useTheme } from '~/hooks/useTheme';
import { paths } from '~/lib/react-query/schema';
import { isLiveRunning } from '~/util/isLive';
import { OLButton } from '~/views/components/button';
import { OLResultBadge } from '~/views/components/result/item/badge';
import { OLResultClub } from '~/views/components/result/item/club';
import { OLResultColumn } from '~/views/components/result/item/column';
import { OLResultListItem } from '~/views/components/result/item/listItem';
import { OLResultName } from '~/views/components/result/item/name';
import { OLItemTime, PORTRAIT_SIZE } from '~/views/components/result/list/item';
import { OLText } from '~/views/components/text';
import { FlashingRedDot } from '~/views/components/flashing/dot';

type Props = {
  runner: paths['/v1/track/{id}']['get']['responses']['200']['content']['application/json']['data']['runner'];
  results: paths['/v1/track/{id}']['get']['responses']['200']['content']['application/json']['data']['results'];
  refresh: () => void;
  isLoading: boolean;
  onSetTodaysDate?: () => void;
};

export const OLTrackRunner: React.FC<Props> = ({
  results,
  refresh,
  isLoading,
  onSetTodaysDate,
  runner,
}) => {
  const { px, colors } = useTheme();
  const { t } = useTranslation();
  const { navigate } = useOLNavigation();

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={results}
        renderItem={({ item: { result, class: _class, competition } }) => {
          const onPress = () => {
            navigate('Results', {
              competitionId: Number(competition.id),
              className: _class.name,
              runnerId: result.id,
            });
          };

          return (
            <TouchableOpacity
              style={{ backgroundColor: 'white' }}
              onPress={onPress}
            >
              <View
                style={{
                  padding: px(8),
                  backgroundColor: '#eee',
                }}
              >
                <OLText size={16} bold>
                  {competition.name}: {_class.name}
                </OLText>
              </View>
              <OLResultListItem>
                <OLResultColumn size={PORTRAIT_SIZE.place} align="center">
                  <OLResultBadge place={result.place} />
                </OLResultColumn>

                <OLResultColumn size={PORTRAIT_SIZE.name}>
                  <OLResultName name={result.name} />

                  <OLResultClub club={result.club || ''} />
                </OLResultColumn>

                <OLResultColumn align="flex-end" size={PORTRAIT_SIZE.time}>
                  {isLiveRunning(result) ? (
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: px(8),
                      }}
                    >
                      <FlashingRedDot />
                      <OLText size={16} style={{ color: 'red' }}>
                        {t('follow.track.live')}
                      </OLText>
                    </View>
                  ) : (
                    <OLItemTime result={result} />
                  )}
                </OLResultColumn>
              </OLResultListItem>
            </TouchableOpacity>
          );
        }}
        style={{ flex: 1 }}
        ListFooterComponent={
          <View style={{ paddingTop: px(32), paddingHorizontal: px(8) }}>
            <TouchableOpacity activeOpacity={1} onLongPress={onSetTodaysDate}>
              <OLText
                size={13}
                style={{ textAlign: 'center', marginBottom: px(16) }}
              >
                {t('follow.track.disclaimer')}
              </OLText>
            </TouchableOpacity>

            <OLButton
              onPress={() => {
                navigate('EditTrackRunner', {
                  isNew: false,
                  runner,
                });
              }}
            >
              {t('follow.track.edit.title')}
            </OLButton>
          </View>
        }
        ListEmptyComponent={
          <View style={{ padding: px(16) }}>
            <OLText size={24} style={{ textAlign: 'center' }}>
              {t('follow.track.empty')}
            </OLText>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refresh}
            colors={[colors.MAIN]}
            tintColor={colors.MAIN}
          />
        }
      />
    </View>
  );
};
