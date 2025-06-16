import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Platform } from 'react-native';
import Purchases from 'react-native-purchases';
import { usePlusStore } from '~/store/plus';
import { usePlusCodes } from '~/hooks/usePlusCodes';
import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui';

let isInitializing = false;

async function presentPaywall(): Promise<boolean> {
  const paywallResult: PAYWALL_RESULT = await RevenueCatUI.presentPaywall();

  switch (paywallResult) {
    case PAYWALL_RESULT.NOT_PRESENTED:
    case PAYWALL_RESULT.ERROR:
    case PAYWALL_RESULT.CANCELLED:
      return false;
    case PAYWALL_RESULT.PURCHASED:
    case PAYWALL_RESULT.RESTORED:
      return true;
    default:
      return false;
  }
}

export const useIap = () => {
  const { t } = useTranslation();

  const { loadCode } = usePlusCodes();

  const [loading, setLoading] = useState(false);

  const {
    initialized,
    setInitialized,
    liveOlPlusProduct,
    setLiveOlPlusProduct,
    setCustomerInfo,
    customerInfo,
  } = usePlusStore();

  // TODO FIX THIS!
  const plusActive = true; // customerInfo?.entitlements?.active?.plus !== undefined;

  const loadPurchase = useCallback(async () => {
    const info = await Purchases.getCustomerInfo();
    setCustomerInfo(info);
  }, [setCustomerInfo]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const offerings = await Purchases.getOfferings();
        if (offerings.current) {
          setLiveOlPlusProduct(offerings.current);
        }
      } catch (e) {
        console.warn(e);
      }
    };

    const init = async () => {
      if (initialized || isInitializing) {
        return;
      }

      try {
        isInitializing = true;

        if (Platform.OS === 'ios') {
          Purchases.configure({
            apiKey: 'appl_OtUwntmQhFBGPJdHfftulaOLABs',
          });
        }

        if (Platform.OS === 'android') {
          Purchases.configure({
            apiKey: 'goog_OsqyCxWJutnnvzoYlgjzKhnpYOS',
          });
        }

        const hasValidCode = await loadCode();
        await loadProducts();

        if (!hasValidCode) {
          await loadPurchase();
        }

        setInitialized();
      } finally {
        isInitializing = false;
      }
    };

    init();
  }, [
    initialized,
    loadPurchase,
    setInitialized,
    setLiveOlPlusProduct,
    loadCode,
  ]);

  const buyLiveOLPlus = async () => {
    if (!liveOlPlusProduct) {
      return Promise.reject();
    }

    try {
      setLoading(true);

      await Purchases.purchasePackage(liveOlPlusProduct.availablePackages[0]);
      await loadPurchase();
    } finally {
      setLoading(false);
    }
  };

  const restoreLiveOLPlus = async () => {
    try {
      setLoading(true);

      const info = await Purchases.restorePurchases();

      if (info?.entitlements?.active?.plus !== undefined) {
        await loadPurchase();
        Alert.alert(t('plus.buy.restoreSuccess'));
      } else {
        Alert.alert(
          t('plus.buy.restoreError.title'),
          t('plus.buy.restoreError.text'),
        );
      }

      return true;
    } catch (e: any) {
      if (e.userCancelled) {
        return false;
      }

      console.warn(e);

      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    buy: buyLiveOLPlus,
    restore: restoreLiveOLPlus,
    displayPrice: liveOlPlusProduct?.availablePackages[0].product.priceString,
    plusWillRenew: customerInfo?.entitlements?.active?.plus?.willRenew,
    plusExpirationDate: customerInfo?.entitlements?.active?.plus?.expirationDate
      ? new Date(customerInfo.entitlements.active.plus.expirationDate)
      : undefined,
    plusActive,
    loading,
    initialized,
    presentPaywall: async () => {
      setLoading(true);
      const success = await presentPaywall();
      if (success) {
        await loadPurchase();
      }
      setLoading(false);
    },
  };
};
