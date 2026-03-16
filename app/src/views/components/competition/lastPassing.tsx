import { OLText } from '../text';
import { useStatusI18n } from '~/hooks/useStatusI18n';
import { paths } from '~/lib/react-query/schema';

type Props = {
  result: paths['/v1/competitions/{competitionId}/last-passings']['get']['responses']['200']['content']['application/json']['data']['passings'][number];
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
