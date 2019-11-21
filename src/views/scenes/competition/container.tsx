import * as React from 'react';
import { connect } from 'react-redux';
import { NavigationScreenProp } from 'react-navigation';
import { OLCompetition as Component } from './component';
import { getNavigationParam } from 'util/navigation';
import { Routes } from 'lib/nav/routes';

interface OwnProps {
    navigation: NavigationScreenProp<any, any>;
}

interface StateProps {
    competition: Comp;
    classes: Classes[];
}

interface DispatchProps {
}

type Props = StateProps & OwnProps & DispatchProps;

class DataWrapper extends React.PureComponent<Props> {
    static navigationOptions = ({ navigation }) => ({
        title: `${navigation.state.params.title}`,
    })

    render() {
        return (
            <Component
                competition={this.props.competition}
                classes={this.props.classes}

                goToLastPassings={() => {
                    const id = getNavigationParam('id', this.props.navigation);

                    this.props.navigation.push(Routes.passings, {
                        id,
                        title: this.props.competition.name,
                    });
                }}

                goToClass={(className: string) => () => {
                    const id = getNavigationParam('id', this.props.navigation);

                    this.props.navigation.push(Routes.classes, {
                        id,
                        className,
                        title: className,
                    });
                }}
            />
        );
    }
}

const mapStateToProps = (state: AppState, props: Props): StateProps => ({
    competition: state.api.competitions.find(
        (comp) => comp.id === getNavigationParam('id', props.navigation),
    ),
    classes: state.api.classes,
});

const mapDispatchToProps = {
};

export const OLCompetition = connect(mapStateToProps, mapDispatchToProps)(DataWrapper);
