import * as React from 'react';
import { connect } from 'react-redux';
import { OLResults as Component } from './component';
import { NavigationProp } from '@react-navigation/native';

interface OwnProps {
    navigation: NavigationProp<any, any>;
}

interface DispatchProps {
    fetcher: (id: number, className: string) => Promise<Result[]>;
}

type Props = OwnProps & DispatchProps;

class DataWrapper extends React.PureComponent<Props> {
    static navigationOptions = ({ navigation }) => ({
        title: `${navigation.state.params.title}`,
    })

    render() {
        return (
            <Component
                fetcher={this.props.fetcher as any}
            />
        );
    }
}

const mapDispatchToProps = {
    fetcher: () => [],
};

export const OLResults = connect(null, null)(DataWrapper);
