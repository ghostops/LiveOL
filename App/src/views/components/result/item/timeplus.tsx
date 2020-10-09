import * as React from 'react';
import { statusI18n } from 'lib/lang/status';
import { View, Text } from 'native-base';
import { OLText } from '../../text';

interface Props {
	timeplus: string;
	status: number;
}

export const OLResultTimeplus: React.FC<Props> = ({ timeplus, status }) => {
	if (status < 0 || status === 10 || status === 9) {
		return null;
	}

	return (
		<OLText
			font="Proxima_Nova"
			style={{
				textAlign: 'right',
			}}
			size={status === 0 ? 14 : 12}>
			{status === 0 ? timeplus : `(${statusI18n(status, 'long')})`}
		</OLText>
	);
};
