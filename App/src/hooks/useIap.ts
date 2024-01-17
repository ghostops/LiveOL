import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Platform } from 'react-native';
import Purchases from 'react-native-purchases';
import { usePlusStore } from '~/store/plus';
import { usePlusCodes } from '~/hooks/usePlusCodes';

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

  const plusActive = customerInfo?.entitlements?.active?.plus !== undefined;

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
      if (initialized || loading) {
        return;
      }

      try {
        setLoading(true);

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
        setLoading(false);
      }
    };

    init();
  }, [
    initialized,
    loading,
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
    } catch (e: any) {
      if (e.userCancelled) {
        return;
      }

      console.warn(e);
    } finally {
      setLoading(false);
    }
  };

  return {
    buy: buyLiveOLPlus,
    restore: restoreLiveOLPlus,
    displayPrice: liveOlPlusProduct?.availablePackages[0].product.priceString,
    plusWillRenew: customerInfo?.entitlements?.active?.plus?.willRenew,
    plusExpirationDate:
      customerInfo?.entitlements?.active?.plus?.expirationDate,
    plusActive,
    loading,
  };
};
