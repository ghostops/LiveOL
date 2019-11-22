import * as React from 'react';
import { connect } from 'react-redux';
import { OLResults as Component } from './component';
import { NavigationScreenProp } from 'react-navigation';

interface OwnProps {
    navigation: NavigationScreenProp<any, any>;
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
                fetcher={}
            />
        );
    }
}

const mapDispatchToProps = {
    fetcher: null
};

export const OLResults = connect(null, null)(DataWrapper);
