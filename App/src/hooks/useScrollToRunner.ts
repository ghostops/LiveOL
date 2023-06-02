import { OlResult } from 'lib/graphql/generated/types';
import { useEffect, useRef, useState } from 'react';
import { FlatList } from 'react-native';

type Options = {
  results?: OlResult[];
  followedRunnerId?: string;
};

export const useScrollToRunner = ({ followedRunnerId, results }: Options) => {
  const flatListRef = useRef<FlatList | null>(null);
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    if (results && followedRunnerId && !hasScrolled) {
      setHasScrolled(true);

      const index = results.findIndex(result => result.id === followedRunnerId);

      setTimeout(() => {
        if (!flatListRef.current || index < 0) {
          return;
        }

        flatListRef.current.scrollToIndex({ index });
        flatListRef.current.forceUpdate();
      }, 1000);
    }
  }, [followedRunnerId, results, hasScrolled]);

  return flatListRef;
};
