import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { FlatList, View } from 'react-native';
import { useFollowBottomSheetStore } from '~/store/followBottomSheet';
import { OLFollowItem } from './followItem';
import { useTranslation } from 'react-i18next';
import { useTheme } from '~/hooks/useTheme';
import { OLText } from '../text';
import { useFollowingStore } from '~/store/following';

export const OLFollowSheet: React.FC = () => {
  const following = useFollowingStore(state => state.following);
  const setRef = useFollowBottomSheetStore(state => state.setBottomSheetRef);
  const { t } = useTranslation();
  const { px } = useTheme();

  // renders
  return (
    <BottomSheetModal ref={setRef} index={2} snapPoints={['10%', '50%', '90%']}>
      <View style={{ flex: 1 }}>
        <FlatList
          data={following}
          renderItem={({ item }) => <OLFollowItem item={item} />}
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
