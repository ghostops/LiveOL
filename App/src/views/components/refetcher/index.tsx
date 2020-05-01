import * as React from 'react';
import { OLRefetcherCircle } from './circle';

interface Props {
    refetch: () => Promise<void>;
    interval: number;
    circle?: boolean;
}

export class OLRefetcher extends React.PureComponent<Props> {
    render() {
        if (!this.props.circle) {
            return null;
        }

        return (
            <OLRefetcherCircle
                interval={this.props.interval}
                promise={this.props.refetch}
            />
        );
    }
}
