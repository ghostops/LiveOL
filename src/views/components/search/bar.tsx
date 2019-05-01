import * as React from 'react';
import * as NB from 'native-base';
import { Animated, TouchableOpacity, Keyboard } from 'react-native';
import { UNIT } from 'util/const';
import Lang from 'lib/lang';
import { isIphoneX, xtraSpace } from 'util/iphonex';

const SEARCH_SIZE = UNIT * 3.25;

interface Props {
    onSearch: (term: string) => void;
}

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

export class SearchBar extends React.PureComponent<Props, State> {
    state: State = {
        searchAnimation: new Animated.Value(0),
        searchTerm: '',
    };

    searchInput: { wrappedInstance: { focus(), blur() } };

    search = () => {
        this.props.onSearch(this.state.searchTerm);
    }

    showSearch = () => {
        Animated.spring(
            this.state.searchAnimation,
            {
                toValue: 1,
                useNativeDriver: true,
            },
        ).start(() => {
            this.searchInput.wrappedInstance.focus();
        });
    }

    hideSearch = () => {
        Animated.spring(
            this.state.searchAnimation,
            {
                toValue: 0,
                useNativeDriver: true,
            },
        ).start(() => {
            Keyboard.dismiss();
            this.searchInput.wrappedInstance.blur();
            this.props.onSearch('');
        });
    }

    render() {
        const translateY = this.state.searchAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [-(SEARCH_SIZE + (isIphoneX ? xtraSpace : 0)), 0],
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
