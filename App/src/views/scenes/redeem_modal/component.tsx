import React, { useState } from 'react';
import { KeyboardAvoidingView, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { COLORS } from 'util/const';
import { usePlusCodes } from 'hooks/usePlusCodes';
import { OLButton } from 'views/components/button';
import { useTheme } from 'hooks/useTheme';

export const OLRedeemCode: React.FC = () => {
  const { t } = useTranslation();
  const { px } = useTheme();
  const { redeem } = usePlusCodes();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  return (
    <KeyboardAvoidingView style={{ paddingTop: px(32) }}>
      <TextInput
        style={{
          borderWidth: 2,
          borderColor: COLORS.MAIN,
          margin: 8,
          borderRadius: 8,
          height: 60,
          paddingHorizontal: 8,
        }}
        autoFocus
        placeholder={t('plus.code.enter')}
        onChangeText={setCode}
        autoCapitalize="none"
        autoComplete="off"
        autoCorrect={false}
      />
      <View style={{ margin: 8 }}>
        <OLButton
          onPress={async () => {
            try {
              setLoading(true);
              await redeem(code);
            } finally {
              setLoading(false);
            }
          }}
          disabled={loading}
        >
          {t('plus.code.redeem')}
        </OLButton>
      </View>
    </KeyboardAvoidingView>
  );
};
