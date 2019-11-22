import * as React from 'react';
import { connect } from 'react-redux';
import { NavigationScreenProp } from 'react-navigation';
import { OLHome as Component } from './component';
import { Right, Left } from './header';
import { Routes } from 'lib/nav/routes';
import Lang from 'lib/lang';
import * as Actions from './store';
import { getCompetition } from 'store/stores/api';
import { today } from 'util/date';

interface OwnProps {
    navigation: NavigationScreenProp<any, any>;
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

class DataWrapper extends React.PureComponent<Props> {
    static navigationOptions = ({ navigation }) => ({
        title: Lang.print('home.title'),
        headerRight: <Right onPress={() => navigation.push(Routes.info)} />,
        headerLeft: <Left />,
    })

    render() {
        return (
            <Component
                competitions={this.props.competitions}
                todaysCompetitions={(
                    (this.props.competitions || [])
                        .filter((comp) => today() === comp.date)
                )}
                onCompetitionPress={(competition) => {
                    this.props.getCompetition(competition.id);

                    this.props.navigation.push(Routes.competition, {
                        id: competition.id,
                        title: competition.name,
                    });
                }}
                openSearch={() => this.props.setSearching(true)}
                searching={this.props.searching}
            />
        );
    }
}

const mapStateToProps = (state: AppState): StateProps => ({
    competitions: state.home.visibleCompetitions || state.api.competitions,
    searching: state.home.searching,
});

const mapDispatchToProps = {
    getCompetition,
    setSearching: Actions.setSearching,
};

export const OLHome = connect(mapStateToProps, mapDispatchToProps)(DataWrapper);
