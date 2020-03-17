import * as React from 'react';
import { connect } from 'react-redux';
import { Lang } from 'lib/lang';
import { NavigationProp } from '@react-navigation/native';
import { OLResults as Component } from './component';
import { RouterProps } from 'lib/nav/routes';
import { showToast } from 'lib/toasts/rotate';
import { GetResults, GetResultsVariables } from 'lib/graphql/queries/types/GetResults';
import { GET_RESULTS } from 'lib/graphql/queries/results';
import { useQuery } from '@apollo/react-hooks';
import { OLError } from 'views/components/error';
import { Result } from 'lib/graphql/fragments/types/Result';
import _ from 'lodash';
import { OLLoading } from 'views/components/loading';

interface OwnProps extends RouterProps<{ id, className }> {}

type Props = OwnProps;

const DataWrapper: React.SFC<Props> = ({ route, navigation }) => {
    const className: string = route.params.className;
    const competitionId: number = route.params.id;

    React.useEffect(
        () => {
            navigation.setOptions({
                title: `${Lang.print('classes.resultsFor')}: ${route.params.className}`,
            });

            showToast();
        },
        [],
    );

    const { data, loading, error, refetch } =
        useQuery<GetResults, GetResultsVariables>(
            GET_RESULTS,
            { variables: { competitionId, className } },
        );

    if (error) return <OLError error={error} />;
    if (loading) return <OLLoading />;

    const results: Result[] = _.get(data, 'results.getResults', null);

    return (
        <Component
            results={results}
            splits={[]}
            refetch={() => void refetch({ className, competitionId })}
        />
    );
};

export const OLResults = connect(null, null)(DataWrapper);
