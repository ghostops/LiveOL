import * as React from 'react';
import { OLRefetcherCircle } from './circle';

interface Props {
	refetch: () => Promise<void>;
	interval: number;
}

export class OLRefetcher extends React.PureComponent<Props> {
	render() {
		return <OLRefetcherCircle interval={this.props.interval} promise={this.props.refetch} />;
	}
}
