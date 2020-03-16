import * as React from 'react';
import { Animated, TouchableOpacity, Keyboard } from 'react-native';
import { connect } from 'react-redux';
import { hasNotch, xtraSpace } from 'util/hasNotch';
import { UNIT } from 'util/const';
import * as Actions from 'views/scenes/home/store';
import * as NB from 'native-base';
import * as _ from 'lodash';
import { Lang } from 'lib/lang';

const SEARCH_SIZE = UNIT * 3.25;

interface StateProps {
    competitions: Comp[];
    searching: boolean;
}

interface DispatchProps {
    setVisibleCompetitions: (competitions: Comp[]) => void;
    setSearching: (value: boolean) => void;
}

type Props = StateProps & DispatchProps;

interface State {
    searchAnimation: Animated.Value;
    searchTerm: string;
}

const {
    Header,
    Item,
    Button,
    Icon,
    Input,
    Text,
} = NB;

class Component extends React.PureComponent<Props, State> {
    state: State = {
        searchAnimation: new Animated.Value(0),
        searchTerm: '',
    };

    searchInput: { wrappedInstance: { focus(), blur() } };

    componentDidUpdate(prevProps: Props) {
        if (
            prevProps.searching !== this.props.searching &&
            this.props.searching
        ) {
            this.showSearch();
        }
    }

    search = () => {
        setTimeout(
            () => {
                const results = this.props.competitions
                    .filter((comp) => comp.name.toLowerCase()
                    .includes(this.state.searchTerm.toLowerCase()));

                this.props.setVisibleCompetitions(results);
            },
            0,
        );
    }

    showSearch = () => {
        this.searchInput.wrappedInstance.focus();

        Animated.spring(
            this.state.searchAnimation,
            {
                toValue: 1,
                useNativeDriver: true,
            },
        ).start();
    }

    hideSearch = () => {
        Keyboard.dismiss();
        this.searchInput.wrappedInstance.blur();

        _.defer(() => {
            this.props.setSearching(false);
            this.props.setVisibleCompetitions(null);
        });

        Animated.spring(
            this.state.searchAnimation,
            {
                toValue: 0,
                useNativeDriver: true,
            },
        ).start();
    }

    render() {
        const translateY = this.state.searchAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [-(SEARCH_SIZE + (hasNotch ? xtraSpace : 0)), 0],
        });

        return (
            <Animated.View
                style={{
                    transform: [{ translateY }],
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                }}
            >
                <Header
                    searchBar
                    rounded
                    style={{
                        paddingTop: 0,
                        height: SEARCH_SIZE,
                        backgroundColor: '#fafafa',
                    }}
                >
                    <TouchableOpacity
                        style={{
                            height: '100%',
                            justifyContent: 'center',
                            paddingHorizontal: UNIT / 2,
                        }}
                        onPress={this.hideSearch}
                    >
                        <Icon name="close" />
                    </TouchableOpacity>

                    <Item>
                        <Icon name="search" />
                        <Input
                            ref={(ref) => this.searchInput = ref as any}
                            placeholder={Lang.print('home.search')}
                            onChangeText={(searchTerm) => this.setState({ searchTerm })}
                            onSubmitEditing={this.search}
                        />
                    </Item>

                    <Button
                        transparent
                        onPress={this.search}
                    >
                        <Text>
                            {Lang.print('home.search')}
                        </Text>
                    </Button>
                </Header>
            </Animated.View>
        );
    }
}

const mapStateToProps = (state: AppState): StateProps => ({
    searching: state.home.searching,
    competitions: state.api.competitions,
});

const mapDispatchToProps = {
    setVisibleCompetitions: Actions.setVisibleCompetitions,
    setSearching: Actions.setSearching,
};

export const SearchBar = connect(mapStateToProps, mapDispatchToProps)(Component);
