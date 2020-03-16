import * as React from 'react';
import { API_CACHES_EXPIRY } from 'store/stores/api';
import { Lang } from 'lib/lang';
import { OLRefetcher } from 'views/components/refetcher';
import { ResultList } from 'views/components/result/list';
import { UNIT } from 'util/const';
import * as NB from 'native-base';

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
        <>
            <ResultList
                results={results}
                splits={splits}
                refetch={refetch}
            />

            <OLRefetcher
                interval={API_CACHES_EXPIRY.results}
                refetch={refetch}
                circle
            />
        </>
    );
};
