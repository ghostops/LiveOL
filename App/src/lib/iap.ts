import { useCallback, useEffect } from 'react';
import { Platform } from 'react-native';
import Purchases from 'react-native-purchases';
import { usePlusStore } from 'store/plus';

const LIVE_OL_PLUS_PRODUCT_ID = 'liveol_plus_onetime';

export const useIap = () => {
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
    setPlusActive(!!info?.entitlements?.active?.plus?.latestPurchaseDate);
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

      if (Platform.OS === 'ios') {
        Purchases.configure({
          apiKey: 'appl_OtUwntmQhFBGPJdHfftulaOLABs',
        });
      }

      if (Platform.OS === 'android') {
        // await Purchases.configure({ apiKey: <public_google_api_key> });
      }

      await loadProducts();
      await loadPurchase();

      setInitialized();
    };

    init();
  }, [initialized, loadPurchase, setInitialized, setLiveOlPlusProduct]);

  const buyLiveOLPlus = async () => {
    if (!liveOlPlusProduct) {
      return;
    }

    try {
      await Purchases.purchaseProduct(LIVE_OL_PLUS_PRODUCT_ID);
      await loadPurchase();
    } catch (e: any) {
      if (e.userCancelled) {
        return;
      }

      console.warn(e);
    }
  };

  const restoreLiveOLPlus = async () => {
    try {
      await Purchases.restorePurchases();
      await loadPurchase();
    } catch (e: any) {
      if (e.userCancelled) {
        return;
      }

      console.warn(e);
    }
  };

  return {
    buy: buyLiveOLPlus,
    restore: restoreLiveOLPlus,
    displayPrice: liveOlPlusProduct?.priceString,
    plusActive,
  };
};
