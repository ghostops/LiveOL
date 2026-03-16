import { TouchableOpacity, View } from 'react-native';
import { useIap } from '~/hooks/useIap';
import { useRefreshIntervalStore } from '~/store/refreshInterval';
import { COLORS, px } from '~/util/const';
import { OLText } from '~/views/components/text';

export const RefreshInterval = () => {
  const { plusActive, presentPaywall } = useIap();
  const refreshIntervalMs = useRefreshIntervalStore(
    state => state.refreshIntervalMs,
  );
  const setRefreshIntervalMs = useRefreshIntervalStore(
    state => state.setRefreshIntervalMs,
  );
  return (
    <View
      style={{
        flexDirection: 'row',
        gap: px(8),
      }}
    >
      {[5_000, 10_000, 15_000, 30_000, 60_000].map(interval => (
        <TouchableOpacity
          key={interval}
          onPress={() => {
            if (!plusActive) {
              presentPaywall();
              return;
            }

            setRefreshIntervalMs(interval);
          }}
          style={{
            paddingHorizontal: px(16),
            paddingVertical: px(8),
            borderRadius: px(8),
            backgroundColor:
              refreshIntervalMs === interval ? COLORS.MAIN : COLORS.BORDER,
          }}
        >
          <OLText
            size={12}
            style={{
              color:
                refreshIntervalMs === interval ? COLORS.WHITE : COLORS.BLACK,
            }}
          >
            {interval / 1000}s
          </OLText>
        </TouchableOpacity>
      ))}
    </View>
  );
};
