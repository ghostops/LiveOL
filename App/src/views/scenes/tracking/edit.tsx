import { useState } from 'react';
import {
  View,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { COLORS } from '~/util/const';
import { OLButton } from '~/views/components/button';
import { OLText } from '~/views/components/text';
import { useTheme } from '~/hooks/useTheme';
import { useOLNavigation } from '~/hooks/useNavigation';
import { $api } from '~/lib/react-query/api';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUserIdStore } from '~/store/userId';
import { queryClient } from '~/lib/react-query/client';

interface EditTrackRunnerProps {
  route: {
    params?: {
      mode: 'create' | 'edit';
      trackingId?: number;
      runner?: {
        name: string;
        clubs: string[];
        classes: string[];
      };
    };
  };
}

export const OLSceneEditTrackRunner: React.FC<EditTrackRunnerProps> = ({
  route,
}) => {
  const { t } = useTranslation();
  const { px } = useTheme();
  const { goBack } = useOLNavigation();
  const userId = useUserIdStore(state => state.userId);

  const mode = route.params?.mode || 'create';
  const trackingId = route.params?.trackingId;
  const initialRunner = route.params?.runner;

  const [name, setName] = useState(initialRunner?.name || '');
  const [clubInput, setClubInput] = useState('');
  const [classInput, setClassInput] = useState('');
  const [clubs, setClubs] = useState<string[]>(initialRunner?.clubs || []);
  const [classes, setClasses] = useState<string[]>(
    initialRunner?.classes || [],
  );

  const { mutateAsync: createTracking, isPending: isCreating } =
    $api.useMutation('post', '/v2/tracking/create');
  const { mutateAsync: updateTracking, isPending: isUpdating } =
    $api.useMutation('put', '/v2/tracking/{id}');

  const isLoading = isCreating || isUpdating;

  const addClub = () => {
    if (clubInput.trim() && !clubs.includes(clubInput.trim())) {
      setClubs([...clubs, clubInput.trim()]);
      setClubInput('');
    }
  };

  const removeClub = (club: string) => {
    setClubs(clubs.filter(c => c !== club));
  };

  const addClass = () => {
    if (classInput.trim() && !classes.includes(classInput.trim())) {
      setClasses([...classes, classInput.trim()]);
      setClassInput('');
    }
  };

  const removeClass = (className: string) => {
    setClasses(classes.filter(c => c !== className));
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert(t('tracking.edit.error'), t('tracking.edit.nameRequired'));
      return;
    }

    if (!userId) {
      Alert.alert(t('tracking.edit.error'), t('tracking.edit.userNotFound'));
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
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: COLORS.BACKGROUND }}
      edges={['bottom', 'left', 'right']}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1, padding: px(16) }}
      >
        {/* Runner Name */}
        <View style={{ marginBottom: px(24) }}>
          <OLText size={16} style={{ marginBottom: px(8) }}>
            {t('tracking.edit.name')} *
          </OLText>
          <TextInput
            style={{
              borderWidth: 2,
              borderColor: COLORS.MAIN,
              borderRadius: 8,
              height: 50,
              paddingHorizontal: px(12),
              fontSize: 16,
            }}
            placeholder={t('tracking.edit.namePlaceholder')}
            placeholderTextColor="#666"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            autoCorrect={false}
          />
        </View>

        {/* Clubs */}
        <View style={{ marginBottom: px(24) }}>
          <OLText size={16} style={{ marginBottom: px(8) }}>
            {t('tracking.edit.clubs')}
          </OLText>
          <View style={{ flexDirection: 'row', marginBottom: px(8) }}>
            <TextInput
              style={{
                flex: 1,
                borderWidth: 2,
                borderColor: COLORS.MAIN,
                borderRadius: 8,
                height: 50,
                paddingHorizontal: px(12),
                fontSize: 16,
                marginRight: px(8),
              }}
              placeholder={t('tracking.edit.clubPlaceholder')}
              placeholderTextColor="#666"
              value={clubInput}
              onChangeText={setClubInput}
              onSubmitEditing={addClub}
              returnKeyType="done"
              autoCapitalize="words"
              autoCorrect={false}
            />
            <TouchableOpacity
              onPress={addClub}
              style={{
                backgroundColor: COLORS.MAIN,
                paddingHorizontal: px(16),
                borderRadius: 8,
                justifyContent: 'center',
              }}
            >
              <OLText size={16} bold>
                {t('tracking.edit.add')}
              </OLText>
            </TouchableOpacity>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
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
                <OLText size={14}>{club} ×</OLText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Classes */}
        <View style={{ marginBottom: px(24) }}>
          <OLText size={16} style={{ marginBottom: px(8) }}>
            {t('tracking.edit.classes')}
          </OLText>
          <View style={{ flexDirection: 'row', marginBottom: px(8) }}>
            <TextInput
              style={{
                flex: 1,
                borderWidth: 2,
                borderColor: COLORS.MAIN,
                borderRadius: 8,
                height: 50,
                paddingHorizontal: px(12),

                fontSize: 16,
                marginRight: px(8),
              }}
              placeholder={t('tracking.edit.classPlaceholder')}
              placeholderTextColor="#666"
              value={classInput}
              onChangeText={setClassInput}
              onSubmitEditing={addClass}
              returnKeyType="done"
              autoCapitalize="characters"
              autoCorrect={false}
            />
            <TouchableOpacity
              onPress={addClass}
              style={{
                backgroundColor: COLORS.MAIN,
                paddingHorizontal: px(16),
                borderRadius: 8,
                justifyContent: 'center',
              }}
            >
              <OLText size={16} bold>
                {t('tracking.edit.add')}
              </OLText>
            </TouchableOpacity>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
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
                <OLText size={14}>{className} ×</OLText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Save Button */}
        <View style={{ marginTop: px(16) }}>
          <OLButton onPress={handleSave} disabled={isLoading}>
            {mode === 'create'
              ? t('tracking.edit.create')
              : t('tracking.edit.update')}
          </OLButton>
        </View>

        {/* Cancel Button */}
        <View style={{ marginTop: px(12) }}>
          <TouchableOpacity
            onPress={goBack}
            style={{
              padding: px(16),
              alignItems: 'center',
            }}
          >
            <OLText size={16} style={{ color: '#999' }}>
              {t('tracking.edit.cancel')}
            </OLText>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
