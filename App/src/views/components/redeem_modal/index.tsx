import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { OLText } from '../text';
import { usePlusStore } from 'store/plus';
import { OLIcon } from '../icon';
import { useTranslation } from 'react-i18next';
import { COLORS, HIT_SLOP } from 'util/const';
import { OLButton } from '../button';
import { usePlusCodes } from 'hooks/usePlusCodes';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const OLRedeemModal: React.FC = () => {
  const { redeemModalVisible, toggleRedeemModal } = usePlusStore();
  const { t } = useTranslation();
  const { redeem } = usePlusCodes();
  const [code, setCode] = useState('');
  const { top, bottom } = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);

  return (
    <Modal visible={redeemModalVisible} animationType="slide">
      <KeyboardAvoidingView style={{ paddingTop: top, paddingBottom: bottom }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            height: 60,
            marginHorizontal: 16,
          }}
        >
          <TouchableOpacity onPress={toggleRedeemModal} hitSlop={HIT_SLOP}>
            <OLIcon name="close" size={32} color="black" />
          </TouchableOpacity>

          <OLText size={18} style={{ flex: 1, textAlign: 'center' }}>
            {t('plus.code.redeem')}
          </OLText>
        </View>
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
    </Modal>
  );
};
