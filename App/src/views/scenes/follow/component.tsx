import { useTheme } from 'hooks/useTheme';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, View } from 'react-native';
import { FollowingData } from 'store/following';
import { OLFollowItem } from 'views/components/follow/followItem';
import { OLText } from 'views/components/text';

type Props = {
  following: FollowingData[];
};

export const OLFollow: React.FC<Props> = ({ following }) => {
  const { t } = useTranslation();
  const { px } = useTheme();

  return (
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
  );
};
