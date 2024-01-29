import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { FlatList, TouchableOpacity, View } from 'react-native';
import { useFollowBottomSheetStore } from '~/store/followBottomSheet';
import { OLFollowItem } from './followItem';
import { useTranslation } from 'react-i18next';
import { useTheme } from '~/hooks/useTheme';
import { OLText } from '../text';
import { FollowingData, useFollowingStore } from '~/store/following';
import { useOLNavigationRef } from '~/hooks/useNavigation';
import { useRef } from 'react';
import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';

export const OLFollowSheet: React.FC = () => {
  const localRef = useRef<BottomSheetModalMethods | null>(null);
  const following = useFollowingStore(state => state.following);
  const setRef = useFollowBottomSheetStore(state => state.setBottomSheetRef);
  const setIsOpen = useFollowBottomSheetStore(state => state.setIsOpen);
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

    localRef.current?.snapToIndex(0);
  };

  return (
    <BottomSheetModal
      ref={ref => {
        setRef(ref);
        localRef.current = ref;
      }}
      index={2}
      snapPoints={[75, '50%', '90%']}
      handleStyle={{
        position: 'absolute',
        left: 0,
        right: 0,
      }}
      handleIndicatorStyle={{ backgroundColor: 'white' }}
      onDismiss={() => setIsOpen(false)}
    >
      <View style={{ flex: 1 }}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => {
            localRef.current?.snapToIndex(2);
          }}
          style={{
            backgroundColor: colors.MAIN,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            height: 75,
          }}
        >
          <OLText
            size={24}
            bold
            style={{
              textAlign: 'center',
              marginTop: px(24),
              marginBottom: px(16),
              color: 'white',
            }}
          >
            {t('follow.title')}
          </OLText>
        </TouchableOpacity>
        <FlatList
          data={following}
          renderItem={({ item }) => (
            <OLFollowItem item={item} onPress={() => onItemPress(item)} />
          )}
          keyExtractor={item => item.id}
          ListFooterComponent={
            <View style={{ marginTop: px(16) }}>
              <OLText size={12} style={{ textAlign: 'center' }}>
                {t('follow.unfollow.hint')}
              </OLText>
            </View>
          }
        />
      </View>
    </BottomSheetModal>
  );
};
