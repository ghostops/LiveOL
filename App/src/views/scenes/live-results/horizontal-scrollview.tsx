import { useLayoutEffect, useRef } from 'react';
import { Dimensions, ScrollView } from 'react-native';

export const OLHorizontalScrollView = ({
  children,
  hasRadio,
}: React.PropsWithChildren<{ hasRadio: boolean }>) => {
  const scrollViewRef = useRef<ScrollView | null>(null);
  const hasTriggeredRef = useRef(false);

  useLayoutEffect(() => {
    const deviceWidth = Dimensions.get('window').width;
    if (scrollViewRef.current && hasRadio && !hasTriggeredRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ x: deviceWidth, animated: true });
      }, 500);
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ x: 0, animated: true });
      }, 1700);
      hasTriggeredRef.current = true;
    }
  }, [hasRadio]);

  return (
    <ScrollView horizontal ref={scrollViewRef}>
      {children}
    </ScrollView>
  );
};
