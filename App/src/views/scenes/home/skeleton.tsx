import { View, StyleSheet } from 'react-native';
import { useTheme } from '~/hooks/useTheme';
import { COLORS } from '~/util/const';
import { OLSkeleton } from '~/views/components/skeleton';

export const OLHomeRowSkeleton = () => {
  const { px } = useTheme();

  return (
    <View style={style.item}>
      <View style={style.row}>
        <View style={{ flex: 1 }}>
          <OLSkeleton width="80%" height={20} />
          <View style={{ marginTop: px(4) }}>
            <OLSkeleton width="60%" height={14} />
          </View>
        </View>
      </View>
      <View style={[style.row, { marginTop: px(4) }]}>
        <View style={{ flex: 1 }}>
          <OLSkeleton width={24} height={18} />
        </View>
        <View style={{ flexDirection: 'row', gap: px(4) }}>
          <OLSkeleton width={50} height={20} borderRadius={12} />
          <OLSkeleton width={60} height={20} borderRadius={12} />
        </View>
      </View>
    </View>
  );
};

export const OLHomeSkeletonList = () => {
  const { px } = useTheme();

  return (
    <View>
      {/* Today section */}
      <View
        style={{
          backgroundColor: COLORS.MAIN,
          paddingHorizontal: px(8),
          paddingBottom: px(16),
          paddingTop: px(8),
        }}
      >
        <OLSkeleton
          width={100}
          height={20}
          style={{ marginBottom: px(8) }}
        />
        <View style={{ backgroundColor: COLORS.WHITE }}>
          <OLHomeRowSkeleton />
          <OLHomeRowSkeleton />
        </View>
      </View>

      {/* Section headers and items */}
      {[1, 2, 3].map(section => (
        <View key={section}>
          <View style={style.header}>
            <OLSkeleton width={120} height={14} />
          </View>
          <OLHomeRowSkeleton />
          <OLHomeRowSkeleton />
          <OLHomeRowSkeleton />
        </View>
      ))}
    </View>
  );
};

const style = StyleSheet.create({
  header: {
    padding: 8,
    backgroundColor: COLORS.BACKGROUND,
  },
  item: {
    padding: 8,
    backgroundColor: COLORS.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
