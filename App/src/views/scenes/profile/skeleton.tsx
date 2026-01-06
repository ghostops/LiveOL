import { View } from 'react-native';
import { COLORS, px } from '~/util/const';
import { OLSkeleton } from '~/views/components/skeleton';
import { OLCard } from '~/views/components/card';

export const UserProfileFormSkeleton = () => {
  return (
    <View style={{ gap: px(8) }}>
      {/* Name input */}
      <View>
        <OLSkeleton width={120} height={20} style={{ marginBottom: px(4) }} />
        <OLSkeleton width="100%" height={40} borderRadius={8} />
      </View>

      {/* Clubs */}
      <View>
        <OLSkeleton width={80} height={20} style={{ marginBottom: px(4) }} />
        <OLSkeleton width="100%" height={40} borderRadius={8} />
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            marginTop: px(4),
            gap: px(8),
          }}
        >
          <OLSkeleton width={100} height={32} borderRadius={16} />
          <OLSkeleton width={120} height={32} borderRadius={16} />
        </View>
      </View>

      {/* Classes */}
      <View>
        <OLSkeleton width={100} height={20} style={{ marginBottom: px(4) }} />
        <OLSkeleton width="100%" height={40} borderRadius={8} />
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            marginTop: px(4),
            gap: px(8),
          }}
        >
          <OLSkeleton width={80} height={32} borderRadius={16} />
          <OLSkeleton width={90} height={32} borderRadius={16} />
          <OLSkeleton width={70} height={32} borderRadius={16} />
        </View>
      </View>

      {/* View my races button */}
      <View style={{ marginTop: px(8) }}>
        <OLSkeleton width="100%" height={44} borderRadius={8} />
      </View>
    </View>
  );
};

export const SubscriptionManagementSkeleton = () => {
  return (
    <OLCard>
      {/* Title */}
      <OLSkeleton width={150} height={20} style={{ marginBottom: px(8) }} />

      {/* Description */}
      <View style={{ marginBottom: px(16), gap: px(4) }}>
        <OLSkeleton width="100%" height={16} />
        <OLSkeleton width="90%" height={16} />
        <OLSkeleton width="95%" height={16} />
      </View>

      {/* Benefits box */}
      <View
        style={{
          backgroundColor: COLORS.BACKGROUND,
          padding: px(16),
          borderRadius: px(8),
          marginBottom: px(16),
          gap: px(8),
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: px(8) }}>
          <OLSkeleton width={18} height={18} borderRadius={9} />
          <OLSkeleton width="80%" height={16} />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: px(8) }}>
          <OLSkeleton width={18} height={18} borderRadius={9} />
          <OLSkeleton width="70%" height={16} />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: px(8) }}>
          <OLSkeleton width={18} height={18} borderRadius={9} />
          <OLSkeleton width="75%" height={16} />
        </View>
      </View>

      {/* Price */}
      <View style={{ alignItems: 'center', marginBottom: px(12) }}>
        <OLSkeleton width={150} height={22} />
      </View>

      {/* Get LiveOL+ button */}
      <View style={{ marginBottom: px(12) }}>
        <OLSkeleton width="100%" height={44} borderRadius={8} />
      </View>

      {/* Restore purchases link */}
      <View style={{ alignItems: 'center' }}>
        <OLSkeleton width={120} height={16} />
      </View>
    </OLCard>
  );
};

export const RunningStatsSkeleton = () => {
  return (
    <OLCard>
      {/* Title */}
      <OLSkeleton
        width={180}
        height={20}
        style={{ marginBottom: px(12) }}
      />

      {/* Stat rows */}
      <View style={{ gap: px(10) }}>
        {[1, 2, 3, 4].map(index => (
          <View
            key={index}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingVertical: px(4),
              borderBottomWidth: index < 4 ? 1 : 0,
              borderBottomColor: COLORS.BORDER,
            }}
          >
            <View
              style={{ flexDirection: 'row', alignItems: 'center', gap: px(8) }}
            >
              <OLSkeleton width={18} height={18} />
              <OLSkeleton width={150} height={16} />
            </View>
            <OLSkeleton width={50} height={16} />
          </View>
        ))}
      </View>
    </OLCard>
  );
};
