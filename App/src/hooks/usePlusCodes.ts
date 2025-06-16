import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';
import { getUniqueId } from 'react-native-device-info';
import { usePlusStore } from '~/store/plus';
import { useOLNavigation } from './useNavigation';
import { useState } from 'react';
import { $api } from '~/lib/react-query/api';

const PLUS_CODE_KEY = 'plusKey';

let deviceId: string;

getUniqueId().then(id => {
  deviceId = id;
});

export const usePlusCodes = () => {
  const { setCustomerInfo } = usePlusStore();
  const { t } = useTranslation();
  const { goBack } = useOLNavigation();
  const [loadingCode, setLoadingCode] = useState(false);

  const enableLiveOLPlus = () =>
    setCustomerInfo({ entitlements: { active: { plus: {} } } } as any);

  const { mutateAsync: redeemPlusCode } = $api.useMutation(
    'post',
    '/v1/plus/redeem',
  );

  const { mutateAsync: validatePlusCode } = $api.useMutation(
    'post',
    '/v1/plus/validate',
  );

  const redeem = async (code: string) => {
    redeemPlusCode(
      { body: { code, deviceId } },
      {
        onSuccess: res => {
          if (res) {
            Alert.alert(t('plus.buy.success'));
            AsyncStorage.setItem(PLUS_CODE_KEY, code);
            enableLiveOLPlus();
            goBack();
          }
        },
        onError: ({ error }) => {
          if (error.message === 'Invalid code') {
            Alert.alert(t('plus.code.invalid'));
            return;
          }

          if (error.message === 'Code claimed') {
            Alert.alert(t('plus.code.claimed'));
            return;
          }
        },
      },
    );
  };

  const loadCode = async () => {
    if (loadingCode) {
      return;
    }

    try {
      setLoadingCode(true);

      const loadedCode = await AsyncStorage.getItem(PLUS_CODE_KEY);

      const response = await validatePlusCode({
        body: {
          code: loadedCode || '',
          deviceId,
        },
      });

      if (!response.data.result) {
        return false;
      }

      enableLiveOLPlus();

      __DEV__ && console.log('Enabled LiveOL+ via code:', loadedCode);

      return true;
    } catch {
      return false;
    } finally {
      setLoadingCode(false);
    }
  };

  return { redeem, loadCode };
};
