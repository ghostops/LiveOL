import { TRPCQueryOutput } from '~/lib/trpc/client';
import { OLText } from '../text';

type Props = {
  result: TRPCQueryOutput['getCompetitionLastPassings'][0];
};

export const OLLastPassing: React.FC<Props> = ({ result }) => {
  const timeStr = result.time.includes(':') ? result.time : 'X';

  return (
    <OLText size={16} style={{ color: 'white' }}>
      {`${result.runnerName} (${result.class}): ${timeStr} ${result.controlName} -- `}
    </OLText>
  );
};
