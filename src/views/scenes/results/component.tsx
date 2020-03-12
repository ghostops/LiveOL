import * as React from 'react';
import { ResultList } from 'views/components/result/list';
import { UNIT } from 'util/const';
import * as NB from 'native-base';
import { Lang } from 'lib/lang';

const {
    Container,
    View,
    Title,
} = NB;

interface Props {
    refetch: () => Promise<void>;
    results: Result[];
    splits: SplitControl[];
}

export const OLResults: React.SFC<Props> = ({ refetch, results, splits }) => {
    return (
        <ResultList
            results={results}
            splits={splits}
            // cache is every 15 seconds, but poll a little more often
            refetchTimeout={__DEV__ ? 999999999 : 10000}
            refetch={refetch}
            subText="club"
        />
    );
};
