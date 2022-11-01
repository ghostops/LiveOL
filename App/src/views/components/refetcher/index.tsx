import * as React from 'react';
import { OLRefetcherBar } from './bar';

interface Props {
  refetch: () => Promise<void>;
  interval: number;
  bar?: boolean;
}

export class OLRefetcher extends React.PureComponent<Props> {
  render() {
    return (
      <OLRefetcherBar
        interval={this.props.interval}
        promise={this.props.refetch}
      />
    );
  }
}
