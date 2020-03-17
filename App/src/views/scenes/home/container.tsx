import * as React from 'react';
import { connect } from 'react-redux';
import { Lang } from 'lib/lang';
import { NavigationProp } from '@react-navigation/native';
import { OLHome as Component } from './component';
import { Right, Left } from './header';
import { Routes } from 'lib/nav/routes';
import { today } from 'util/date';
import * as Actions from './store';

interface OwnProps {
    navigation: NavigationProp<any, any>;
}

interface StateProps {
    competitions: Comp[] | null;
    searching: boolean;
}

interface DispatchProps {
    setSearching: (value: boolean) => void;
    getCompetition: (id: number) => void;
}

type Props = StateProps & OwnProps & DispatchProps;

const DataWrapper: React.SFC<Props> = (props) => {
    React.useEffect(
        () => {
            props.navigation.setOptions({
                title: Lang.print('home.title'),
                headerLeft: Left,
                headerRight: () => <Right onPress={() => props.navigation.navigate(Routes.info)} />,
            });
        },
        [],
    );

    return (
        <Component
            competitions={props.competitions}
            todaysCompetitions={(
                (props.competitions || [])
                    .filter((comp) => today() === comp.date)
            )}
            onCompetitionPress={(competition) => {
                props.navigation.navigate(Routes.competition, {
                    id: competition.id,
                    title: competition.name,
                });
            }}
            openSearch={() => props.setSearching(true)}
            searching={props.searching}
        />
    );
};

const mapStateToProps = (state: AppState): StateProps => ({
    competitions: state.home.visibleCompetitions || state.api.competitions,
    searching: state.home.searching,
});

const mapDispatchToProps = {
    setSearching: Actions.setSearching,
};

export const OLHome = connect(mapStateToProps, mapDispatchToProps)(DataWrapper);
