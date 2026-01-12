import { useEffect } from 'react';
import { View, ActivityIndicator, FlatList } from 'react-native';
import { useTranslation } from 'react-i18next';
import Markdown from 'react-native-markdown-display';
import { $api } from '~/lib/react-query/api';
import { useOLNavigation } from '~/hooks/useNavigation';
import { useChangelogStore } from '~/store/changelog';
import { OLText } from '~/views/components/text';
import { OLButton } from '~/views/components/button';
import { COLORS, px } from '~/util/const';

export const OLSceneChangelog: React.FC = () => {
  const { t } = useTranslation();
  const { goBack } = useOLNavigation();
  const { markAsSeen } = useChangelogStore();

  const { data, isLoading } = $api.useQuery('get', '/v2/changelog', {
    params: { query: { limit: 50, offset: 0 } },
  });

  useEffect(() => {
    if (data?.data.entries) {
      const entryIds = data.data.entries.map(e => e.id);
      markAsSeen(entryIds);
    }
  }, [data, markAsSeen]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.MAIN} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.BACKGROUND }}>
      <FlatList
        data={data?.data.entries || []}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{
          paddingVertical: px(16),
          paddingHorizontal: px(16),
          gap: px(24),
        }}
        renderItem={({ item: entry }) => (
          <View
            style={{
              backgroundColor: COLORS.WHITE,
              borderRadius: px(8),
              padding: px(16),
              gap: px(12),
              marginBottom: px(24),
            }}
          >
            {/* Version Badge */}
            <View
              style={{ flexDirection: 'row', alignItems: 'center', gap: px(8) }}
            >
              <View
                style={{
                  backgroundColor: COLORS.MAIN,
                  paddingHorizontal: px(8),
                  paddingVertical: px(4),
                  borderRadius: px(4),
                }}
              >
                <OLText size={12} style={{ color: COLORS.WHITE }} bold>
                  {new Date(entry.publishedAt).toLocaleDateString()}
                </OLText>
              </View>
            </View>

            <OLText size={20} bold>
              {entry.title}
            </OLText>

            <Markdown
              style={{
                body: { fontSize: px(16), color: COLORS.BLACK },
                heading2: { fontSize: px(16), fontWeight: 'bold' },
                bullet_list: { marginLeft: px(16) },
                link: { color: COLORS.MAIN },
              }}
            >
              {entry.content}
            </Markdown>
          </View>
        )}
        ListFooterComponent={<View style={{ height: px(32) }} />}
      />

      <View
        style={{
          padding: px(16),
          backgroundColor: COLORS.WHITE,
          borderTopWidth: 1,
          borderTopColor: COLORS.BORDER,
        }}
      >
        <OLButton onPress={goBack}>{t('Close')}</OLButton>
      </View>
    </View>
  );
};
