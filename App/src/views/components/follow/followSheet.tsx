import { BottomSheetSectionList, BottomSheetModal } from '@gorhom/bottom-sheet';
import {
  Dimensions,
  Platform,
  SectionList,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFollowBottomSheetStore } from '~/store/followBottomSheet';
import { OLFollowItem } from './followItem';
import { useTranslation } from 'react-i18next';
import { useTheme } from '~/hooks/useTheme';
import { OLText } from '../text';
import { FollowingData, useFollowingStore } from '~/store/following';
import { useOLNavigationRef } from '~/hooks/useNavigation';
import { useRef } from 'react';
import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { useDeviceRotationStore } from '~/store/deviceRotation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { OLButton } from '../button';
import { $api } from '~/lib/react-query/api';
import { useDeviceIdStore } from '~/store/deviceId';
import { paths } from '~/lib/react-query/schema';
import { OLTrackingItem } from './trackingItem';

const ListComponent =
  Platform.OS === 'android' ? BottomSheetSectionList : SectionList;

export type OLTrackingData =
  paths['/v1/track']['get']['responses']['200']['content']['application/json']['data']['runners'][number];

export const firstIndexSize = 65;
export const followSheetIndexes = [firstIndexSize, '50%', '90%'];
export const getFollowSheetIndex = (index: number) =>
  index > followSheetIndexes.length ? followSheetIndexes.length : index;

export const OLFollowSheet: React.FC = () => {
  const localRef = useRef<BottomSheetModalMethods | null>(null);
  const following = useFollowingStore(state => state.following);
  const setRef = useFollowBottomSheetStore(state => state.setBottomSheetRef);
  const setIsOpen = useFollowBottomSheetStore(state => state.setIsOpen);
  const { left, right, bottom } = useSafeAreaInsets();
  const { isLandscape } = useDeviceRotationStore();
  const { t } = useTranslation();
  const { px, colors } = useTheme();
  const { getNavRef } = useOLNavigationRef();
  const deviceId = useDeviceIdStore(state => state.deviceId);
  const { data } = $api.useQuery('get', '/v1/track', {
    params: { query: { deviceId } },
  });

  const onTrackItemPress = (item: OLTrackingData) => {
    getNavRef()?.navigate('TrackRunner', {
      runner: item,
    });
    localRef.current?.snapToIndex(getFollowSheetIndex(0));
  };

  const onFollowItemPress = (item: FollowingData) => {
    if (item.type === 'runner') {
      getNavRef()?.navigate('Results', {
        competitionId: Number(item.competitionId),
        className: item.className,
        runnerId: item.id,
      });
    }

    if (item.type === 'club') {
      const [competitionId, clubName] = item.id.split(':');

      getNavRef()?.navigate('Club', {
        competitionId: Number(competitionId),
        clubName,
        title: clubName,
      });
    }

    if (item.type === 'class') {
      const [competitionId, className] = item.id.split(':');

      getNavRef()?.navigate('Results', {
        competitionId: Number(competitionId),
        className,
      });
    }

    localRef.current?.snapToIndex(getFollowSheetIndex(0));
  };

  return (
    <BottomSheetModal
      ref={ref => {
        setRef(ref);
        localRef.current = ref;
      }}
      index={followSheetIndexes.length - 1}
      snapPoints={followSheetIndexes}
      handleStyle={{
        position: 'absolute',
        left: 0,
        right: 0,
      }}
      handleIndicatorStyle={{ backgroundColor: 'white' }}
      onDismiss={() => setIsOpen(false)}
      style={{
        width: isLandscape ? Dimensions.get('window').width / 2 : undefined,
        marginLeft: isLandscape ? Math.max(left, right) : 0,
      }}
    >
      <View style={{ flex: 1 }}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => {
            localRef.current?.snapToIndex(
              getFollowSheetIndex(isLandscape ? 2 : 1),
            );
          }}
          style={{
            backgroundColor: colors.BLUE,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            height: firstIndexSize,
            justifyContent: 'center',
          }}
        >
          <OLText
            size={18}
            bold
            style={{
              textAlign: 'center',
              color: 'white',
            }}
          >
            {t('follow.title')}
          </OLText>
        </TouchableOpacity>
        <ListComponent<FollowingData | OLTrackingData>
          sections={[
            {
              title: t('follow.title'),
              data: following,
              key: 'following',
            },
            {
              title: t('follow.track.title'),
              data: data?.data.runners || [],
              key: 'tracking',
            },
          ]}
          renderSectionHeader={({ section }) => (
            <View style={{ backgroundColor: colors.BLUE, padding: px(12) }}>
              <OLText size={px(16)} style={{ color: 'white' }} bold>
                {section.title}
              </OLText>
            </View>
          )}
          renderItem={({ item, section }) => {
            if (section.key === 'following') {
              return (
                <OLFollowItem
                  item={item as FollowingData}
                  onPress={() => onFollowItemPress(item as FollowingData)}
                />
              );
            }

            if (section.key === 'tracking') {
              return (
                <OLTrackingItem
                  item={item as OLTrackingData}
                  onPress={onTrackItemPress}
                />
              );
            }

            return null;
          }}
          keyExtractor={item => item.id.toString()}
          ListEmptyComponent={
            <View style={{ padding: px(16) }}>
              <OLText size={px(14)} style={{ color: 'white' }} bold>
                {t('follow.empty')}
              </OLText>
            </View>
          }
          ListFooterComponent={
            <View style={{ padding: px(8) }}>
              <OLButton
                onPress={() => {
                  getNavRef()?.navigate('EditTrackRunner', { isNew: true });
                  localRef.current?.snapToIndex(getFollowSheetIndex(0));
                }}
              >
                {t('follow.track.add')}
              </OLButton>
            </View>
          }
        />
      </View>
      <View style={{ height: bottom }} />
    </BottomSheetModal>
  );
};
