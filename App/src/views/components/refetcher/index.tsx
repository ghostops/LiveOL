import * as React from 'react';
import { OLRefetcherCircle } from './circle';

interface Props {
    refetch: () => Promise<void>;
    interval: number;
    circle?: boolean;
}

export const OLRefetcher: React.SFC<Props> = ({ refetch, interval, circle }) => {
    let poller: NodeJS.Timeout;

    React.useEffect(
        () => {
            startPoll();

            return () => {
                clearPoll();
            };
        },
        [],
    );

    const startPoll = () => {
        refetch();
        poller = setInterval(refetch, interval);
    };

    const clearPoll = () => {
        poller && clearInterval(poller);
    };

    if (!circle) {
        return null;
    }

    return (
        <OLRefetcherCircle
            interval={interval}
        />
    );
};
