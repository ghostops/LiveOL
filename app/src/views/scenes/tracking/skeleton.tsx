import { View, StyleSheet } from 'react-native';
import { useTheme } from '~/hooks/useTheme';
import { COLORS } from '~/util/const';
import { OLSkeleton } from '~/views/components/skeleton';

export const OLTrackingItemSkeleton = () => {
  const { px } = useTheme();

  return (
    <View
      style={[
        styles.itemWrapper,
        { marginVertical: px(4), marginHorizontal: px(8) },
      ]}
    >
      <View style={[styles.itemContent, { padding: px(16) }]}>
        <View style={styles.itemRow}>
          <View style={styles.itemInfo}>
            {/* Name */}
            <View style={{ marginBottom: px(4) }}>
              <OLSkeleton width="70%" height={22} />
            </View>

            {/* Clubs */}
            <View style={{ marginBottom: px(2) }}>
              <OLSkeleton width="85%" height={16} />
            </View>

            {/* Classes */}
            <View style={{ marginBottom: px(8) }}>
              <OLSkeleton width="60%" height={16} />
            </View>

            {/* Results button */}
            <OLSkeleton width={80} height={32} borderRadius={6} />
          </View>

          {/* Edit button */}
          <View style={{ padding: px(8), marginLeft: px(8) }}>
            <OLSkeleton width={40} height={20} />
          </View>
        </View>
      </View>
    </View>
  );
};

export const OLTrackingSkeletonList = () => {
  const { px } = useTheme();

  return (
    <View
      style={{
        paddingVertical: px(8),
        backgroundColor: COLORS.BACKGROUND,
      }}
    >
      <OLTrackingItemSkeleton />
      <OLTrackingItemSkeleton />
      <OLTrackingItemSkeleton />
      <OLTrackingItemSkeleton />
    </View>
  );
};

const styles = StyleSheet.create({
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
});
