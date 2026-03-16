import { useEffect, useState, useCallback } from 'react';
import { View, TouchableOpacity, Alert, ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { COLORS } from '~/util/const';
import { OLButton } from '~/views/components/button';
import { OLText } from '~/views/components/text';
import { useTheme } from '~/hooks/useTheme';
import { useOLNavigation } from '~/hooks/useNavigation';
import { $api } from '~/lib/react-query/api';
import { useUserIdStore } from '~/store/userId';
import { queryClient } from '~/lib/react-query/client';
import { OLIcon } from '~/views/components/icon';
import { OLClubsTrackingInput } from '~/views/components/tracking/clubs';
import { OLNameTrackingInput } from '~/views/scenes/tracking/name';
import { useDebounce, useThrottledCallback } from 'use-debounce';
import { TrackingInfoIcon } from '../TrackingInfoIcon';

export type OLTrackingFormMode = 'create' | 'edit';

type Props = {
  mode: OLTrackingFormMode;
  trackingId?: number;
  initialRunner?: {
    name: string;
    clubs: string[];
  };
  style?: ViewStyle;
  isUserMode?: boolean;
};

export const OLTrackingForm = ({
  mode,
  initialRunner,
  trackingId,
  style,
  isUserMode,
}: Props) => {
  const { t } = useTranslation();
  const { px } = useTheme();
  const { goBack } = useOLNavigation();
  const userId = useUserIdStore(state => state.userId);

  const [name, setName] = useState(initialRunner?.name || '');
  const [debouncedName] = useDebounce(name, 500);
  const [clubs, setClubs] = useState<string[]>(initialRunner?.clubs || []);

  const { mutateAsync: createTracking, isPending: isCreating } =
    $api.useMutation('post', '/v2/tracking/create', {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['get', '/v2/tracking/stats'],
        });
      },
    });
  const { mutateAsync: updateTracking, isPending: isUpdating } =
    $api.useMutation('put', '/v2/tracking/{id}', {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['get', '/v2/tracking/stats'],
        });
      },
    });

  const isLoading = isCreating || isUpdating;

  const addClub = useCallback(
    (clubInput: string) => {
      if (clubInput.trim() && !clubs.includes(clubInput.trim())) {
        setClubs(prev => [...prev, clubInput.trim()]);
      }
    },
    [clubs],
  );

  const removeClub = useCallback((club: string) => {
    setClubs(prev => prev.filter(c => c !== club));
  }, []);

  const handleSave = useThrottledCallback(
    async () => {
      if (!isUserMode) {
        if (!debouncedName.trim()) {
          Alert.alert(t('Error'), t('Runner name is required'));
          return;
        }

        if (!userId) {
          Alert.alert(t('Error'), t('User not found. Please restart the app.'));
          return;
        }

        if (clubs.length === 0) {
          Alert.alert(t('Error'), t('Please enter at least one club'));
          return;
        }
      }

      // Catch-all validation
      if (
        clubs.length === 0 ||
        debouncedName.trim().length === 0 ||
        debouncedName.trim().length > 254 ||
        clubs.some(c => c.length > 254) ||
        clubs.length > 29
      ) {
        if (!isUserMode) {
          Alert.alert(t('Error'));
        }
        return;
      }

      try {
        if (mode === 'create') {
          await createTracking({
            body: {
              uid: userId,
              name: debouncedName.trim(),
              clubs,
              isMe: isUserMode,
            },
          });
        } else if (mode === 'edit' && trackingId) {
          console.log('Updating tracking record', {
            name: debouncedName.trim(),
            clubs,
          });
          await updateTracking({
            params: { path: { id: trackingId } },
            body: {
              name: debouncedName.trim(),
              clubs,
            },
          });
        }
        if (!isUserMode) {
          await queryClient.invalidateQueries({
            queryKey: ['get', '/v2/tracking'],
          });
          goBack();
        } else {
          await queryClient.invalidateQueries({
            queryKey: ['get', '/v2/tracking/self'],
          });
        }
      } catch (error: any) {
        Alert.alert(t('Error'), error.message || t('Failed to save runner'));
      }
    },
    1000,
    {
      leading: true,
      trailing: false,
    },
  );

  useEffect(() => {
    if (
      isUserMode &&
      debouncedName.trim().length > 0 &&
      debouncedName !== initialRunner?.name
    ) {
      handleSave();
    }
  }, [debouncedName, handleSave, initialRunner?.name, isUserMode]);

  useEffect(() => {
    if (isUserMode) {
      handleSave();
    }
  }, [clubs, isUserMode, handleSave]);

  return (
    <View style={style ? style : { gap: px(24) }}>
      {/* Runner Name */}

      <View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: px(8),
          }}
        >
          <OLText size={16} style={{ marginBottom: px(4) }} bold>
            {isUserMode ? t('My full name') : t('Runner Name')}
          </OLText>
          {isUserMode && <TrackingInfoIcon color={COLORS.MAIN} />}
        </View>
        <OLNameTrackingInput name={name} setName={setName} />
      </View>

      {/* Clubs */}
      <View>
        <OLText size={16} style={{ marginBottom: px(4) }} bold>
          {isUserMode ? t('My clubs') : t('Clubs')}
        </OLText>
        <OLClubsTrackingInput onAddClub={addClub} />
        <View
          style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: px(4) }}
        >
          {clubs.map((club, index, total) => (
            <TouchableOpacity
              key={club}
              disabled={total.length === 1}
              onPress={() => removeClub(club)}
              style={{
                backgroundColor: COLORS.MAIN,
                paddingHorizontal: px(12),
                paddingVertical: px(6),
                borderRadius: 16,
                marginRight: px(8),
                marginBottom: px(8),
              }}
            >
              <OLText size={14} style={{ color: COLORS.WHITE }}>
                {club}{' '}
                {total.length > 1 && (
                  <OLIcon name="close" color={COLORS.WHITE} />
                )}
              </OLText>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {!isUserMode && (
        <View>
          <OLButton onPress={handleSave} disabled={isLoading}>
            {mode === 'create' ? t('Start following') : t('Update following')}
          </OLButton>
        </View>
      )}
    </View>
  );
};
