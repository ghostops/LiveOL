import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  useRedeemPlusCodeMutation,
  useValidatePlusCodeQuery,
} from 'lib/graphql/generated/gql';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';
import { getUniqueId } from 'react-native-device-info';
import { usePlusStore } from 'store/plus';

const PLUS_CODE_KEY = 'plusKey';

let deviceId: string;

getUniqueId().then(id => {
  deviceId = id;
});

export const usePlusCodes = () => {
  const { setCustomerInfo } = usePlusStore();
  const [code, setCode] = useState<string | undefined>();
  const { t } = useTranslation();

  useEffect(() => {
    const loadCode = async () => {
      const loadedCode = await AsyncStorage.getItem(PLUS_CODE_KEY);
      setCode(loadedCode);
    };

    loadCode();
  }, []);

  useValidatePlusCodeQuery({
    variables: { code, deviceId },
    skip: !code,
    onCompleted: data => {
      if (!data.server.validatePlusCode) {
        return;
      }

      setCustomerInfo({ entitlements: { active: { plus: {} } } } as any);
    },
  });

  const [redeemPlusCode] = useRedeemPlusCodeMutation({
    onCompleted: data => {
      if (data.server.redeemPlusCode) {
        Alert.alert(t('plus.buy.success'));
        AsyncStorage.setItem(PLUS_CODE_KEY, code);
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

  const redeem = async () => {
    Alert.prompt(t('plus.code.redeem'), undefined, codeInput => {
      if (!codeInput) {
        return;
      }

      setCode(codeInput);
      redeemPlusCode({ variables: { code: codeInput, deviceId } });
    });
  };

  return { redeem };
};
