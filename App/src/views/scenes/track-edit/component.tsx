import { useTranslation } from 'react-i18next';
import {
  Alert,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '~/hooks/useTheme';
import { OLButton } from '~/views/components/button';
import { OLIcon } from '~/views/components/icon';
import { OLText } from '~/views/components/text';
import { useState } from 'react';
import { WINDOW_WIDTH } from '@gorhom/bottom-sheet';
import { OLLoading } from '~/views/components/loading';

type Props = {
  runnerName: string;
  runnerClasses: string[];
  runnerClubs: string[];
  setRunnerName: (name: string) => void;
  runnerNameError: string | null;
  addRunnerClass: (name: string) => void;
  removeRunnerClass: (name: string) => void;
  runnerClassesError: string | null;
  addRunnerClub: (name: string) => void;
  removeRunnerClub: (name: string) => void;
  runnerClubsError: string | null;
  onSubmit: () => Promise<void>;
  isPending: boolean;
};

export const OLEditTrackRunner: React.FC<Props> = ({
  addRunnerClass,
  addRunnerClub,
  onSubmit,
  removeRunnerClass,
  removeRunnerClub,
  runnerClasses,
  runnerClubs,
  runnerName,
  setRunnerName,
  isPending,
  runnerClassesError,
  runnerClubsError,
  runnerNameError,
}) => {
  const { t } = useTranslation();
  const { px, fontPx, colors } = useTheme();

  const [newClubText, setNewClubText] = useState('');
  const [newClassText, setNewClassText] = useState('');

  const inputStyle = {
    backgroundColor: 'white',
    padding: px(16),
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: fontPx(16),
    borderRadius: 8,
    marginTop: px(8),
    flex: 1,
  };

  return (
    <ScrollView
      contentContainerStyle={{ gap: px(16), paddingBottom: px(64) }}
      automaticallyAdjustKeyboardInsets
    >
      <View
        style={{
          padding: px(16),
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderBottomWidth: 1,
          borderColor: '#ddd',
        }}
      >
        <OLText size={14} bold style={{ marginLeft: px(4) }}>
          {t('follow.track.name')}
        </OLText>
        <OLText size={14} style={{ marginLeft: px(4), opacity: 0.9 }}>
          {t('follow.track.edit.hints.name')}
        </OLText>
        <TextInput
          style={inputStyle}
          value={runnerName}
          onChangeText={setRunnerName}
        />
        {runnerNameError && (
          <OLText size={14} style={{ color: 'red', marginTop: px(4) }}>
            {runnerNameError}
          </OLText>
        )}
      </View>

      <View
        style={{
          padding: px(16),
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderBottomWidth: 1,
          borderColor: '#ddd',
        }}
      >
        <OLText size={14} bold style={{}}>
          {t('follow.track.clubs')}
        </OLText>
        <OLText size={14} style={{ opacity: 0.9 }}>
          {t('follow.track.edit.hints.club')}
        </OLText>
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: px(4),
            marginTop: px(8),
          }}
        >
          {runnerClubs.map((club, index) => (
            <TouchableOpacity
              key={index}
              activeOpacity={1}
              onLongPress={() => Alert.alert(club)}
              style={{
                backgroundColor: colors.LIGHT,
                padding: px(8),
                borderRadius: 8,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <OLText
                size={16}
                style={{ color: 'white', maxWidth: px(WINDOW_WIDTH * 0.5) }}
                numberOfLines={1}
              >
                {club}
              </OLText>
              <TouchableOpacity
                style={{ paddingLeft: px(8) }}
                onPress={() => removeRunnerClub(club)}
              >
                <OLIcon name="close" size={18} color="white" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: px(8),
            marginTop: px(8),
          }}
        >
          <TextInput
            style={inputStyle}
            value={newClubText}
            onChangeText={setNewClubText}
            placeholder={t('follow.track.edit.clubPlaceholder')}
          />
          <OLButton
            style={{ position: 'relative', top: px(4) }}
            onPress={() => {
              addRunnerClub(newClubText.trim());
              setNewClubText('');
            }}
          >
            {t('follow.track.edit.add')}
          </OLButton>
        </View>
        {runnerClubsError && (
          <OLText size={14} style={{ color: 'red', marginTop: px(4) }}>
            {runnerClubsError}
          </OLText>
        )}
      </View>

      <View
        style={{
          padding: px(16),
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderBottomWidth: 1,
          borderColor: '#ddd',
        }}
      >
        <OLText size={14} bold>
          {t('follow.track.classes')}
        </OLText>

        <OLText size={14} style={{ opacity: 0.9 }}>
          {t('follow.track.edit.hints.class')}
        </OLText>
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: px(4),
            marginTop: px(8),
          }}
        >
          {runnerClasses.map((_class, index) => (
            <TouchableOpacity
              key={index}
              activeOpacity={1}
              onLongPress={() => Alert.alert(_class)}
              style={{
                backgroundColor: colors.MAIN,
                padding: px(8),
                borderRadius: 8,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <OLText
                size={16}
                style={{ color: 'white', maxWidth: px(WINDOW_WIDTH * 0.5) }}
                numberOfLines={1}
              >
                {_class}
              </OLText>
              <TouchableOpacity
                style={{ paddingLeft: px(8) }}
                onPress={() => removeRunnerClass(_class)}
              >
                <OLIcon name="close" size={18} color="white" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>
        {runnerClasses.length > 5 && (
          <OLText
            size={14}
            style={{
              backgroundColor: '#c90000',
              color: 'white',
              marginTop: px(8),
              padding: px(4),
              borderRadius: 4,
            }}
          >
            {t('follow.track.edit.error.tooManyClasses')}
          </OLText>
        )}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: px(8),
            marginTop: px(8),
          }}
        >
          <TextInput
            style={inputStyle}
            value={newClassText}
            onChangeText={setNewClassText}
            placeholder={t('follow.track.edit.classPlaceholder')}
          />
          <OLButton
            style={{ position: 'relative', top: px(4) }}
            onPress={() => {
              addRunnerClass(newClassText.trim());
              setNewClassText('');
            }}
            disabled={runnerClasses.length > 10}
          >
            {t('follow.track.edit.add')}
          </OLButton>
        </View>
        {runnerClassesError && (
          <OLText size={14} style={{ color: 'red', marginTop: px(4) }}>
            {runnerClassesError}
          </OLText>
        )}
      </View>

      <View style={{ paddingHorizontal: px(16) }}>
        <OLButton onPress={() => onSubmit()}>
          {t('follow.track.edit.save')}
        </OLButton>
      </View>

      {isPending && <OLLoading badge />}
    </ScrollView>
  );
};
