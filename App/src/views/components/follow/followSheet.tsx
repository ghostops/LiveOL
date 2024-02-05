import { BottomSheetFlatList, BottomSheetModal } from '@gorhom/bottom-sheet';
import {
  Dimensions,
  FlatList,
  Platform,
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

const ListComponent =
  Platform.OS === 'android' ? BottomSheetFlatList : FlatList;

export const firstIndexSize = 65;
export const followSheetIndexes = [firstIndexSize, '50%', '90%'];
export const getFollowSheetIndex = (index: number) =>
  index > followSheetIndexes.length ? followSheetIndexes.length : index;

export const OLFollowSheet: React.FC = () => {
  const localRef = useRef<BottomSheetModalMethods | null>(null);
  const following = useFollowingStore(state => state.following);
  const setRef = useFollowBottomSheetStore(state => state.setBottomSheetRef);
  const setIsOpen = useFollowBottomSheetStore(state => state.setIsOpen);
  const { left, right } = useSafeAreaInsets();
  const { isLandscape } = useDeviceRotationStore();
  const { t } = useTranslation();
  const { px, colors } = useTheme();
  const { getNavRef } = useOLNavigationRef();

  const onItemPress = (item: FollowingData) => {
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
        <ListComponent
          data={following}
          renderItem={({ item }) => (
            <OLFollowItem item={item} onPress={() => onItemPress(item)} />
          )}
          keyExtractor={item => item.id}
          ListEmptyComponent={
            <View style={{ padding: px(16) }}>
              <OLText size={14} style={{ textAlign: 'center' }}>
                {t('follow.empty')}
              </OLText>
            </View>
          }
        />
      </View>
    </BottomSheetModal>
  );
};
