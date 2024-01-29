import { Alert } from 'react-native';
import { OLText } from '../text';
import { useTranslation } from 'react-i18next';
import { FollowingData, useFollowingStore } from '~/store/following';
import { OLListItem } from '../list/item';
import { useTheme } from '~/hooks/useTheme';

type Props = { item: FollowingData; onPress: () => void };

export const OLFollowItem: React.FC<Props> = ({ item, onPress }) => {
  const { px } = useTheme();
  const { unFollow } = useFollowingStore();
  const { t } = useTranslation();

  return (
    <OLListItem
      style={{
        marginLeft: 0,
        paddingHorizontal: px(16),
        paddingVertical: px(12),
        width: '100%',
      }}
      onPress={onPress}
      onLongPress={() =>
        Alert.alert(t('follow.unfollow.title'), undefined, [
          {
            onPress: () => unFollow(item.id),
            text: t('follow.unfollow.cta'),
            style: 'destructive',
          },
          { text: t('info.update.hasUpdate.cancel'), style: 'cancel' },
        ])
      }
    >
      <OLText size={16}>{item.name}</OLText>
    </OLListItem>
  );
};
