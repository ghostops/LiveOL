import { useLayoutEffect, useRef } from 'react';
import { Dimensions, ScrollView } from 'react-native';
import { useHintsStore } from '~/store/hints';

export const OLHorizontalScrollView = ({
  children,
  hasRadio,
}: React.PropsWithChildren<{ hasRadio: boolean }>) => {
  const { getHint, setHint } = useHintsStore();
  const scrollViewRef = useRef<ScrollView | null>(null);
  const hasTriggeredRef = useRef(false);
  const showHint = getHint('horizontalResults') !== 'dismissed';

  useLayoutEffect(() => {
    const deviceWidth = Dimensions.get('window').width;
    if (
      showHint &&
      hasRadio &&
      scrollViewRef.current &&
      !hasTriggeredRef.current
    ) {
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ x: deviceWidth, animated: true });
      }, 500);
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ x: 0, animated: true });
      }, 1700);
      setHint('horizontalResults', 'dismissed', 24 * 60 * 60 * 1000 * 7); // 7 days
      hasTriggeredRef.current = true;
    }
  }, [hasRadio, showHint, setHint]);

  return (
    <ScrollView horizontal ref={scrollViewRef}>
      {children}
    </ScrollView>
  );
};
