import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  useRedeemPlusCodeMutation,
  useValidatePlusCodeQuery,
} from 'lib/graphql/generated/gql';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';
import { getUniqueId } from 'react-native-device-info';
import { usePlusStore } from 'store/plus';
import { useOLNavigation } from './useNavigation';

const PLUS_CODE_KEY = 'plusKey';

let deviceId: string;

getUniqueId().then(id => {
  deviceId = id;
});

export const usePlusCodes = () => {
  const { setCustomerInfo } = usePlusStore();
  const { t } = useTranslation();
  const { goBack } = useOLNavigation();

  const { refetch } = useValidatePlusCodeQuery({
    skip: true,
  });

  const enableLiveOLPlus = () =>
    setCustomerInfo({ entitlements: { active: { plus: {} } } } as any);

  const [redeemPlusCode] = useRedeemPlusCodeMutation();

  const redeem = async (code: string) => {
    redeemPlusCode({
      variables: { code, deviceId },
      onCompleted: data => {
        if (data.server.redeemPlusCode) {
          Alert.alert(t('plus.buy.success'));
          AsyncStorage.setItem(PLUS_CODE_KEY, code);
          enableLiveOLPlus();
          goBack();
        }
      },
      onError: error => {
        if (error.message === 'Invalid code') {
          Alert.alert(t('plus.code.invalid'));
          return;
        }

        if (error.message === 'Code claimed') {
          Alert.alert(t('plus.code.claimed'));
          return;
        }
      },
    });
  };

  const loadCode = async () => {
    try {
      const loadedCode = await AsyncStorage.getItem(PLUS_CODE_KEY);

      const response = await refetch({ code: loadedCode, deviceId });

      if (!response.data.server.validatePlusCode) {
        return false;
      }

      enableLiveOLPlus();

      __DEV__ && console.log('Enabled LiveOL+ via code:', loadedCode);

      return true;
    } catch {
      return false;
    }
  };

  return { redeem, loadCode };
};
