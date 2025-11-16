import { useState } from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { COLORS } from '~/util/const';
import { OLText } from '~/views/components/text';
import { useTheme } from '~/hooks/useTheme';
import { TrackingInfoIcon } from '~/views/components/TrackingInfoIcon';

export const UserProfileForm: React.FC = () => {
  const { t } = useTranslation();
  const { px } = useTheme();

  const [name, setName] = useState('');
  const [clubInput, setClubInput] = useState('');
  const [classInput, setClassInput] = useState('');
  const [clubs, setClubs] = useState<string[]>([]);
  const [classes, setClasses] = useState<string[]>([]);

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

  return (
    <View style={{ gap: px(8) }}>
      {/* Full Name */}
      <View>
        <OLText size={14} bold style={{ marginBottom: px(6) }}>
          {t('profile.tracking.name')}
        </OLText>
        <View
          style={{ flexDirection: 'row', gap: px(6), alignItems: 'center' }}
        >
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: COLORS.BORDER,
              borderRadius: 6,
              height: 40,
              paddingHorizontal: px(10),
              fontSize: 14,
              backgroundColor: COLORS.WHITE,
              flex: 1,
            }}
            placeholder={t('tracking.edit.namePlaceholder')}
            placeholderTextColor="#999"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            autoCorrect={false}
          />
          <TrackingInfoIcon color={COLORS.MAIN} />
        </View>
      </View>

      {/* Clubs */}
      <View>
        <OLText size={14} bold style={{ marginBottom: px(6) }}>
          {t('profile.tracking.clubs')}
        </OLText>
        <View style={{ flexDirection: 'row', marginBottom: px(6) }}>
          <TextInput
            style={{
              flex: 1,
              borderWidth: 1,
              borderColor: COLORS.BORDER,
              borderRadius: 6,
              height: 40,
              paddingHorizontal: px(10),
              fontSize: 14,
              marginRight: px(6),
              backgroundColor: COLORS.WHITE,
            }}
            placeholder={t('tracking.edit.clubPlaceholder')}
            placeholderTextColor="#999"
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
              paddingHorizontal: px(12),
              borderRadius: 6,
              justifyContent: 'center',
              minWidth: 50,
              alignItems: 'center',
            }}
          >
            <OLText size={14} bold style={{ color: COLORS.WHITE }}>
              +
            </OLText>
          </TouchableOpacity>
        </View>
        {clubs.length > 0 && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {clubs.map(club => (
              <TouchableOpacity
                key={club}
                onPress={() => removeClub(club)}
                style={{
                  backgroundColor: COLORS.LIGHT,
                  paddingHorizontal: px(10),
                  paddingVertical: px(4),
                  borderRadius: 12,
                  marginRight: px(6),
                  marginBottom: px(6),
                }}
              >
                <OLText size={12} style={{ color: COLORS.WHITE }}>
                  {club} ×
                </OLText>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Classes */}
      <View>
        <OLText size={14} bold style={{ marginBottom: px(6) }}>
          {t('profile.tracking.classes')}
        </OLText>
        <View style={{ flexDirection: 'row', marginBottom: px(6) }}>
          <TextInput
            style={{
              flex: 1,
              borderWidth: 1,
              borderColor: COLORS.BORDER,
              borderRadius: 6,
              height: 40,
              paddingHorizontal: px(10),
              fontSize: 14,
              marginRight: px(6),
              backgroundColor: COLORS.WHITE,
            }}
            placeholder={t('tracking.edit.classPlaceholder')}
            placeholderTextColor="#999"
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
              paddingHorizontal: px(12),
              borderRadius: 6,
              justifyContent: 'center',
              minWidth: 50,
              alignItems: 'center',
            }}
          >
            <OLText size={14} bold style={{ color: COLORS.WHITE }}>
              +
            </OLText>
          </TouchableOpacity>
        </View>
        {classes.length > 0 && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {classes.map(className => (
              <TouchableOpacity
                key={className}
                onPress={() => removeClass(className)}
                style={{
                  backgroundColor: COLORS.LIGHT,
                  paddingHorizontal: px(10),
                  paddingVertical: px(4),
                  borderRadius: 12,
                  marginRight: px(6),
                  marginBottom: px(6),
                }}
              >
                <OLText size={12} style={{ color: COLORS.WHITE }}>
                  {className} ×
                </OLText>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};
