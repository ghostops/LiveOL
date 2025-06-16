import { FlashList } from '@shopify/flash-list';
import { useEffect, useRef, useState } from 'react';
import { paths } from '~/lib/react-query/schema';

type Options = {
  results?: paths['/v1/results/{competitionId}/class/{className}']['get']['responses']['200']['content']['application/json']['data']['results'];
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
    if (
      results?.length &&
      followedRunnerId &&
      hasScrolled !== followedRunnerId
    ) {
      setHasScrolled(followedRunnerId);

      const index = results.findIndex(result => result.id === followedRunnerId);

      setTimeout(() => {
        if (!flashListRef.current || index < 0) {
          return;
        }

        flashListRef.current.scrollToIndex({ index, animated: true });
      }, 1000);
    } else if (results?.length && !followedRunnerId) {
      setHasScrolled('');
      flashListRef.current?.scrollToIndex({ index: 0 });
    }
  }, [followedRunnerId, results, hasScrolled, className]);

  return flashListRef;
};
