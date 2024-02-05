import { FlashList } from '@shopify/flash-list';
import { useEffect, useRef, useState } from 'react';
import { TRPCQueryOutput } from '~/lib/trpc/client';

type Options = {
  results?: TRPCQueryOutput['getResults'];
  followedRunnerId?: string;
  className?: string;
};

export const useScrollToRunner = ({
  followedRunnerId,
  results,
  className,
}: Options) => {
  const flashListRef = useRef<FlashList<any> | null>(null);
  const [hasScrolled, setHasScrolled] = useState<string>('');

  useEffect(() => {
    if (results && followedRunnerId && hasScrolled !== followedRunnerId) {
      setHasScrolled(followedRunnerId);

      const index = results.findIndex(result => result.id === followedRunnerId);

      setTimeout(() => {
        if (!flashListRef.current || index < 0) {
          return;
        }

        flashListRef.current.scrollToIndex({ index, animated: true });
      }, 1000);
    } else if (!followedRunnerId && className) {
      setHasScrolled('');
      flashListRef.current?.scrollToIndex({ index: 0 });
    }
  }, [followedRunnerId, results, hasScrolled, className]);

  return flashListRef;
};
