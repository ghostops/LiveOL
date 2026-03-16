import { useEffect, useState } from 'react';
import { View, ActivityIndicator, FlatList } from 'react-native';
import { useTranslation } from 'react-i18next';
import Markdown from 'react-native-markdown-display';
import { $api } from '~/lib/react-query/api';
import { useOLNavigation } from '~/hooks/useNavigation';
import { useChangelogStore } from '~/store/changelog';
import { OLText } from '~/views/components/text';
import { OLButton } from '~/views/components/button';
import { COLORS, px } from '~/util/const';
import { paths } from '~/lib/react-query/schema';
import { StyleSheet } from 'react-native';

type Entry =
  paths['/v2/changelog']['get']['responses']['200']['content']['application/json']['data']['entries'][0];

export const OLSceneChangelog: React.FC = () => {
  const { t } = useTranslation();
  const { goBack, setOptions } = useOLNavigation();
  const { markAsSeen, seenEntryIds } = useChangelogStore();
  const [entries, setEntries] = useState<Entry[]>([]);

  const { data, isLoading } = $api.useQuery('get', '/v2/changelog', {
    params: { query: { limit: 50, offset: 0 } },
  });

  useEffect(() => {
    if (!entries.length && data?.data.entries) {
      const entryIds = data.data.entries.map(e => e.id);
      markAsSeen(entryIds);

      let parsedEntries = data.data.entries;

      if (seenEntryIds.length === 0) {
        setOptions({ title: t('Welcome to LiveOL') });
        parsedEntries = [...data.data.entries].sort((a, b) => {
          if (a.displayOrder === 0) {
            return -1;
          }
          if (b.displayOrder === 0) {
            return 1;
          }
          return 0;
        });
      }

      setEntries(parsedEntries);
    }
  }, [
    data,
    markAsSeen,
    setEntries,
    entries,
    seenEntryIds.length,
    setOptions,
    t,
  ]);
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.MAIN} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={entries}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContent}
        renderItem={({ item: entry }) => (
          <View style={styles.entryCard}>
            {entry.displayOrder !== 0 && (
              <View style={styles.dateContainer}>
                <View style={styles.dateBadge}>
                  <OLText size={12} style={styles.dateText} bold>
                    {new Date(entry.publishedAt).toLocaleDateString()}
                  </OLText>
                </View>
              </View>
            )}

            <OLText size={20} bold>
              {entry.title}
            </OLText>

            <Markdown
              style={{
                body: { fontSize: px(16), color: COLORS.BLACK },
                heading2: {
                  fontSize: px(16),
                  fontWeight: 'bold',
                  marginTop: px(12),
                },
                bullet_list: { marginLeft: px(16) },
                link: { color: COLORS.MAIN },
              }}
            >
              {entry.content}
            </Markdown>
          </View>
        )}
        ListFooterComponent={<View style={styles.listFooter} />}
      />

      <View style={styles.footer}>
        <OLButton onPress={goBack}>{t('Close')}</OLButton>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  listContent: {
    paddingVertical: px(16),
    paddingHorizontal: px(16),
    gap: px(24),
  },
  entryCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: px(8),
    padding: px(16),
    gap: px(12),
    marginBottom: px(24),
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: px(8),
  },
  dateBadge: {
    backgroundColor: COLORS.MAIN,
    paddingHorizontal: px(8),
    paddingVertical: px(4),
    borderRadius: px(4),
  },
  dateText: {
    color: COLORS.WHITE,
  },
  listFooter: {
    height: px(32),
  },
  footer: {
    padding: px(16),
    paddingBottom: px(32),
    backgroundColor: COLORS.WHITE,
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER,
  },
});
