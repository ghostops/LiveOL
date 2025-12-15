import { View } from 'react-native';
import { useTheme } from '~/hooks/useTheme';
import { paths } from '~/lib/react-query/schema';
import { OLResultLiveRunning } from '~/views/components/result/item/liveRunning';
import { OLStartTime } from '~/views/components/result/item/start';
import { OLResultTime } from '~/views/components/result/item/time';
import { OLResultTimeplus } from '~/views/components/result/item/timeplus';

type Props = {
  result: paths['/v2/results/live/tracked/{trackingId}']['get']['responses']['200']['content']['application/json']['data']['results'][number];
};

export const OLRowTime = ({ result }: Props) => {
  const { px } = useTheme();

  if (result.start && result.isLive) {
    return <OLResultLiveRunning startTime={result.start} />;
  }

  if (result.start && !result.result && !result.isLive) {
    return <OLStartTime time={result.start} />;
  }

  return (
    <View style={{ gap: px(4), alignItems: 'flex-end', paddingRight: px(8) }}>
      <OLResultTime status={result.status} time={result.result} />

      <OLResultTimeplus status={result.status} timeplus={result.timeplus} />
    </View>
  );
};
