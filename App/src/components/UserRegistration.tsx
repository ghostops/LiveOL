import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getLocales } from 'react-native-localize';
import { useIap } from '~/hooks/useIap';
import { useUserRegistration } from '~/hooks/useUserRegistration';
import { useDeviceIdStore } from '~/store/deviceId';

export const UserRegistration = () => {
  const deviceId = useDeviceIdStore(state => state.deviceId);
  const { initialized, plusActive } = useIap();
  const { registerUser } = useUserRegistration();
  const { i18n } = useTranslation();

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

        __DEV__ &&
          console.log('[User Registration] Registering user on startup', {
            deviceId,
            language: deviceLanguage,
            plusActive,
          });

        await registerUser({
          deviceId,
          language: deviceLanguage,
          hasPlus: plusActive,
        });
      } catch (error) {
        __DEV__ &&
          console.warn('[User Registration] Failed on startup:', error);
      }
    }

    registerUserOnStartup();
  }, [deviceId, registerUser, i18n.resolvedLanguage, initialized, plusActive]);

  return null;
};
