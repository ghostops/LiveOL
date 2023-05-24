import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Platform } from 'react-native';
import Purchases from 'react-native-purchases';
import { usePlusStore } from 'store/plus';

const LIVE_OL_PLUS_PRODUCT_ID = 'liveol_plus';

export const useIap = () => {
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);

  const {
    initialized,
    setInitialized,
    setPlusActive,
    plusActive,
    liveOlPlusProduct,
    setLiveOlPlusProduct,
  } = usePlusStore();

  const loadPurchase = useCallback(async () => {
    const info = await Purchases.getCustomerInfo();
    const isActive = !!info?.entitlements?.active?.plus?.latestPurchaseDate;
    setPlusActive(isActive);
  }, [setPlusActive]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const products = await Purchases.getProducts([LIVE_OL_PLUS_PRODUCT_ID]);

        const firstProduct = products[0];

        setLiveOlPlusProduct(firstProduct);
      } catch (e) {
        console.warn(e);
      }
    };

    const init = async () => {
      if (initialized) {
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

        await loadProducts();
        await loadPurchase();

        setInitialized();
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [initialized, loadPurchase, setInitialized, setLiveOlPlusProduct]);

  const buyLiveOLPlus = async () => {
    if (!liveOlPlusProduct) {
      return;
    }

    try {
      setLoading(true);

      await Purchases.purchaseProduct(LIVE_OL_PLUS_PRODUCT_ID);
      await loadPurchase();
    } catch (e: any) {
      if (e.userCancelled) {
        return;
      }

      console.warn(e);
    } finally {
      setLoading(false);
    }
  };

  const restoreLiveOLPlus = async () => {
    try {
      setLoading(true);

      await Purchases.restorePurchases();
      await loadPurchase();

      if (plusActive) {
        Alert.alert(t('plus.buy.restoreSuccess'));
      } else {
        Alert.alert(t('plus.buy.restoreError'));
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
    displayPrice: liveOlPlusProduct?.priceString,
    plusActive,
    loading,
  };
};
