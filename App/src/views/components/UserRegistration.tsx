import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getLocales } from 'react-native-localize';
import { useIap } from '~/hooks/useIap';
import { useUserRegistration } from '~/hooks/useUserRegistration';
import { useDeviceIdStore } from '~/store/deviceId';
import { useUserIdStore } from '~/store/userId';

export const UserRegistration = () => {
  const deviceId = useDeviceIdStore(state => state.deviceId);
  const { initialized, plusActive } = useIap();
  const { registerUser } = useUserRegistration();
  const { i18n } = useTranslation();
  const setUserId = useUserIdStore(state => state.setUserId);

  useEffect(() => {
    async function registerUserOnStartup() {
      if (!deviceId || !initialized) {
        return;
      }

      try {
        // Get device locale
        const locales = getLocales();
        const deviceLanguage =
          i18n.resolvedLanguage || locales[0]?.languageCode || 'en';

        const response = await registerUser({
          deviceId,
          language: deviceLanguage,
          hasPlus: plusActive,
        });

        if (response?.uid) {
          setUserId(response.uid);
        }
      } catch (error) {
        __DEV__ &&
          console.warn('[User Registration] Failed on startup:', error);
      }
    }

    registerUserOnStartup();
  }, [
    deviceId,
    registerUser,
    i18n.resolvedLanguage,
    initialized,
    plusActive,
    setUserId,
  ]);

  return null;
};
