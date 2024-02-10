import { TRPCQueryOutput } from '~/lib/trpc/client';
import { OLText } from '../text';
import { useStatusI18n } from '~/hooks/useStatusI18n';

type Props = {
  result: TRPCQueryOutput['getCompetitionLastPassings'][0];
};

export const OLLastPassing: React.FC<Props> = ({ result }) => {
  const statusText = useStatusI18n(result.status);
  const timeStr = result.status === 0 ? result.time : statusText;

  return (
    <OLText size={16} style={{ color: 'white' }}>
      {`${result.runnerName} (${result.class}): ${timeStr} ${result.controlName} -- `}
    </OLText>
  );
};
