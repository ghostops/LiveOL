import { useTranslation } from 'react-i18next';
import { TouchableOpacity, View } from 'react-native';
import { useIap } from '~/hooks/useIap';
import { useTheme } from '~/hooks/useTheme';
import { $api } from '~/lib/react-query/api';
import { useDeviceIdStore } from '~/store/deviceId';
import { useFollowBottomSheetStore } from '~/store/followBottomSheet';
import { useFollowingStore } from '~/store/following';
import { PickerIcon } from '~/views/components/lang/picker';
import { OLSearch } from '~/views/components/search/container';
import { OLText } from '~/views/components/text';

type Props = {
  searching: boolean;
  landscape: boolean;
  openSearch: () => void;
};

const OLHomeButton = ({
  onPress,
  children,
  landscape,
}: {
  onPress: () => void;
  children: string;
  landscape: boolean;
}) => {
  const { px, colors } = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        paddingHorizontal: px(landscape ? 24 : 16),
        backgroundColor: colors.MAIN,
        paddingVertical: px(4),
        borderRadius: 16,
      }}
    >
      <OLText size={16} style={{ color: 'white' }}>
        {children}
      </OLText>
    </TouchableOpacity>
  );
};

export const OLHomeBar = ({ searching, landscape, openSearch }: Props) => {
  const { px } = useTheme();
  const { t } = useTranslation();
  const followingCount = useFollowingStore(state => state.following.length);
  const { plusActive, presentPaywall } = useIap();
  const openFollowSheet = useFollowBottomSheetStore(state => state.open);
  const deviceId = useDeviceIdStore(state => state.deviceId);

  const { data } = $api.useQuery('get', '/v1/track', {
    params: { query: { deviceId } },
  });

  const trackingCount = data?.data.runners?.length || 0;
  const totalCount = followingCount + trackingCount;

  if (searching) {
    return <OLSearch />;
  }

  const getFollowingText = () => {
    if (totalCount < 1) {
      return t('follow.title');
    }

    return t('follow.title') + ` (${totalCount > 99 ? '99+' : totalCount})`;
  };

  return (
    <View
      style={{
        flexDirection: 'row',
        height: px(45),
      }}
    >
      <PickerIcon />

      <View
        style={{
          height: '100%',
          justifyContent: 'center',
          alignItems: 'center',
          paddingRight: px(10),
          flexDirection: 'row',
          gap: px(landscape ? 16 : 8),
        }}
      >
        <OLHomeButton
          onPress={() => {
            if (!plusActive) {
              presentPaywall();
              return;
            }

            openFollowSheet();
          }}
          landscape={!!landscape}
        >
          {getFollowingText()}
        </OLHomeButton>

        <OLHomeButton onPress={openSearch} landscape={!!landscape}>
          {t('home.search')}
        </OLHomeButton>
      </View>
    </View>
  );
};
