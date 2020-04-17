import * as React from 'react';
import { Lang } from 'lib/lang';
import { OLRefetcher } from 'views/components/refetcher';
import { Result } from 'lib/graphql/fragments/types/Result';
import { OLResultsTable } from 'views/components/result/table';
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

    competitionId: number;
    className: string;
}

export const OLResults: React.SFC<Props> = ({ refetch, results, className, competitionId }) => {
    return (
        <>
            <OLResultsTable
                results={results}
                competitionId={competitionId}
                className={className}
            />

            <OLRefetcher
                interval={15000}
                refetch={refetch}
                circle
            />
        </>
    );
};
