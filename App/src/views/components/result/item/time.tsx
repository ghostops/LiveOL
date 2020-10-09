import * as React from 'react';
import { View, Text } from 'native-base';
import { fontPx } from 'util/const';
import { statusI18n } from 'lib/lang/status';
import { OLText } from '../../text';

interface Props {
	time: string;
	status: number;
}

export const OLResultTime: React.FC<Props> = ({ time, status }) => {
	return (
		<OLText font="Proxima_Nova" size={20}>
			{status === 0 ? time : statusI18n(status)}
		</OLText>
	);
};
