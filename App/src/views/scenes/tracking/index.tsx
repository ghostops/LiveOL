import {
  View,
  TouchableOpacity,
  Alert,
  FlatList,
  StyleSheet,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { OLText } from '~/views/components/text';
import { useOLNavigation } from '~/hooks/useNavigation';
import { useTheme } from '~/hooks/useTheme';
import { $api } from '~/lib/react-query/api';
import { COLORS } from '~/util/const';
import { OLLoading } from '~/views/components/loading';
import { useUserIdStore } from '~/store/userId';
import { paths } from '~/lib/react-query/schema';
import { ReanimatedSwipeable } from '~/views/components/ReanimatedSwipeable';
import { queryClient } from '~/lib/react-query/client';
import { OLButton } from '~/views/components/button';

type TrackingItem =
  paths['/v2/tracking']['get']['responses']['200']['content']['application/json']['data']['tracking'][0];

export const OLSceneTracking = () => {
  const { t } = useTranslation();
  const { navigate } = useOLNavigation();
  const { px } = useTheme();
  const userId = useUserIdStore(state => state.userId);

  const { data: trackingData, isLoading } = $api.useQuery(
    'get',
    '/v2/tracking',
    {
      params: {
        query: {
          uid: userId,
        },
      },
    },
    {
      enabled: !!userId,
    },
  );

  const { mutateAsync: deleteTracking } = $api.useMutation(
    'delete',
    '/v2/tracking/{id}/delete',
  );

  const handleDelete = async (id: number, name: string) => {
    Alert.alert(
      t('tracking.delete.title'),
      t('tracking.delete.message', { name }),
      [
        {
          text: t('tracking.delete.cancel'),
          style: 'cancel',
        },
        {
          text: t('tracking.delete.confirm'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTracking({
                params: { path: { id } },
              });
              queryClient.invalidateQueries({
                queryKey: ['get', '/v2/tracking'],
              });
            } catch (error: any) {
              Alert.alert(t('tracking.delete.error'), error.message);
            }
          },
        },
      ],
    );
  };

  const renderRightActions = (item: TrackingItem) => (
    <TouchableOpacity
      onPress={() => handleDelete(item.id, item.name)}
      style={[styles.deleteButton, { paddingHorizontal: px(20) }]}
    >
      <OLText size={16} bold style={styles.deleteButtonText}>
        {t('tracking.delete.action')}
      </OLText>
    </TouchableOpacity>
  );

  const renderItem = ({ item }: { item: TrackingItem }) => (
    <View
      style={[
        styles.itemWrapper,
        { marginVertical: px(4), marginHorizontal: px(8) },
      ]}
    >
      <ReanimatedSwipeable
        renderRightActions={() => renderRightActions(item)}
        rightActionsWidth={px(100)}
      >
        <View style={[styles.itemContent, { padding: px(16) }]}>
          <View style={styles.itemRow}>
            <View style={styles.itemInfo}>
              <OLText
                size={18}
                bold
                style={{ marginBottom: px(4) }}
                numberOfLines={1}
              >
                {item.name}
              </OLText>
              {item.clubs.length > 0 && (
                <OLText
                  size={14}
                  style={[styles.itemMeta, { marginBottom: px(2) }]}
                >
                  {t('tracking.list.clubs')}: {item.clubs.join(', ')}
                </OLText>
              )}
              {item.classes.length > 0 && (
                <OLText size={14} style={styles.itemMeta}>
                  {t('tracking.list.classes')}: {item.classes.join(', ')}
                </OLText>
              )}
              <OLButton
                small
                style={{ alignSelf: 'flex-start', marginTop: px(8) }}
                onPress={() => {
                  navigate('TrackingResults', { trackingId: item.id });
                }}
              >
                {t('tracking.results')}
              </OLButton>
            </View>
            <TouchableOpacity
              onPress={() =>
                navigate('EditTrackRunner', {
                  mode: 'edit',
                  trackingId: item.id,
                  runner: {
                    name: item.name,
                    clubs: item.clubs,
                    classes: item.classes,
                  },
                })
              }
              style={{ padding: px(8), marginLeft: px(8) }}
            >
              <OLText size={16} style={styles.editButtonText}>
                {t('tracking.list.edit')}
              </OLText>
            </TouchableOpacity>
          </View>
        </View>
      </ReanimatedSwipeable>
    </View>
  );

  const tracking = trackingData?.data.tracking || [];

  return (
    <View style={styles.container}>
      {isLoading && <OLLoading badge />}
      <FlatList
        data={tracking}
        renderItem={renderItem}
        contentContainerStyle={{ paddingVertical: px(8) }}
        ListEmptyComponent={
          isLoading ? null : (
            <View style={[styles.emptyContainer, { padding: px(32) }]}>
              <OLText
                size={20}
                bold
                style={[styles.emptyTitle, { marginBottom: px(8) }]}
              >
                {t('tracking.empty.title')}
              </OLText>
              <OLText size={16} style={styles.emptyMessage}>
                {t('tracking.empty.message')}
              </OLText>
            </View>
          )
        }
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        onPress={() => navigate('EditTrackRunner', { mode: 'create' })}
        style={[
          styles.fab,
          {
            bottom: px(24),
            right: px(24),
            width: px(60),
            height: px(60),
            borderRadius: px(30),
          },
        ]}
      >
        <OLText size={32} bold>
          +
        </OLText>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: 'white',
  },
  itemWrapper: {
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  itemContent: {
    backgroundColor: COLORS.WHITE,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
  },
  itemMeta: {},
  editButtonText: {
    color: COLORS.MAIN,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    textAlign: 'center',
  },
  emptyMessage: {
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    backgroundColor: COLORS.MAIN,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
});
