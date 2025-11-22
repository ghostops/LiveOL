import { useCallback, useEffect, useState } from 'react';
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
import { OLClassesTrackingInput } from '~/views/components/tracking/classes';
import { OLNameTrackingInput } from '~/views/scenes/tracking/name';
import { useDebounce } from 'use-debounce';

export type OLTrackingFormMode = 'create' | 'edit' | 'user';

type Props = {
  mode: OLTrackingFormMode;
  trackingId?: number;
  initialRunner?: {
    name: string;
    clubs: string[];
    classes: string[];
  };
  style?: ViewStyle;
};

export const OLTrackingForm = ({
  mode,
  initialRunner,
  trackingId,
  style,
}: Props) => {
  const { t } = useTranslation();
  const { px } = useTheme();
  const { goBack } = useOLNavigation();
  const userId = useUserIdStore(state => state.userId);

  const [name, setName] = useState(initialRunner?.name || '');
  const [clubs, setClubs] = useState<string[]>(initialRunner?.clubs || []);
  const [classes, setClasses] = useState<string[]>(
    initialRunner?.classes || [],
  );

  const { mutateAsync: createTracking, isPending: isCreating } =
    $api.useMutation('post', '/v2/tracking/create');
  const { mutateAsync: updateTracking, isPending: isUpdating } =
    $api.useMutation('put', '/v2/tracking/{id}');

  const isLoading = isCreating || isUpdating;

  const addClub = (clubInput: string) => {
    if (clubInput.trim() && !clubs.includes(clubInput.trim())) {
      setClubs([...clubs, clubInput.trim()]);
    }
  };

  const removeClub = (club: string) => {
    setClubs(clubs.filter(c => c !== club));
  };

  const addClass = (classInput: string) => {
    if (classInput.trim() && !classes.includes(classInput.trim())) {
      setClasses([...classes, classInput.trim()]);
    }
  };

  const removeClass = (className: string) => {
    setClasses(classes.filter(c => c !== className));
  };

  const handleSave = useCallback(async () => {
    if (mode === 'user') {
      Alert.alert('Todo!');
      return;
    }

    if (!name.trim()) {
      Alert.alert(t('tracking.edit.error'), t('tracking.edit.nameRequired'));
      return;
    }

    if (!userId) {
      Alert.alert(t('tracking.edit.error'), t('tracking.edit.userNotFound'));
      return;
    }

    if (classes.length === 0 || clubs.length === 0) {
      Alert.alert(
        t('tracking.edit.error'),
        t('tracking.edit.atLeastOneClubAndClass'),
      );
      return;
    }

    if (
      name.length > 254 ||
      clubs.some(c => c.length > 254) ||
      classes.some(c => c.length > 254) ||
      clubs.length > 29 ||
      classes.length > 29
    ) {
      Alert.alert(t('tracking.edit.error'));
      return;
    }

    try {
      if (mode === 'create') {
        await createTracking({
          body: {
            uid: userId,
            name: name.trim(),
            clubs,
            classes,
          },
        });
      } else if (mode === 'edit' && trackingId) {
        await updateTracking({
          params: { path: { id: trackingId } },
          body: {
            name: name.trim(),
            clubs,
            classes,
          },
        });
      }
      await queryClient.invalidateQueries({
        queryKey: ['get', '/v2/tracking'],
      });
      goBack();
    } catch (error: any) {
      Alert.alert(
        t('tracking.edit.error'),
        error.message || t('tracking.edit.saveFailed'),
      );
    }
  }, [
    name,
    clubs,
    classes,
    mode,
    trackingId,
    createTracking,
    updateTracking,
    userId,
    t,
    goBack,
  ]);

  const [debouncedName] = useDebounce(name, 1000);

  useEffect(() => {
    if (
      debouncedName.trim().length > 0 &&
      mode === 'user' &&
      debouncedName !== initialRunner?.name
    ) {
      handleSave();
    }
  }, [debouncedName, handleSave, initialRunner?.name, mode]);

  return (
    <View style={style ? style : { gap: px(24) }}>
      {/* Runner Name */}
      <View>
        <OLText size={16} style={{ marginBottom: px(4) }} bold>
          {t('tracking.edit.name')}
        </OLText>
        <OLNameTrackingInput name={name} setName={setName} />
      </View>

      {/* Clubs */}
      <View>
        <OLText size={16} style={{ marginBottom: px(4) }} bold>
          {t('tracking.edit.clubs')}
        </OLText>
        <OLClubsTrackingInput onAddClub={addClub} />
        <View
          style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: px(4) }}
        >
          {clubs.map(club => (
            <TouchableOpacity
              key={club}
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
                {club} <OLIcon name="close" color={COLORS.WHITE} />
              </OLText>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Classes */}
      <View>
        <OLText size={16} style={{ marginBottom: px(4) }} bold>
          {t('tracking.edit.classes')}
        </OLText>
        <OLClassesTrackingInput onAddClass={addClass} />
        <View
          style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: px(4) }}
        >
          {classes.map(className => (
            <TouchableOpacity
              key={className}
              onPress={() => removeClass(className)}
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
                {className} <OLIcon name="close" color={COLORS.WHITE} />
              </OLText>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {mode !== 'user' && (
        <View>
          <OLButton onPress={handleSave} disabled={isLoading}>
            {mode === 'create'
              ? t('tracking.edit.create')
              : t('tracking.edit.update')}
          </OLButton>
        </View>
      )}
    </View>
  );
};
