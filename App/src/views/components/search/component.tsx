import * as React from 'react';
import _ from 'lodash';
import { Animated, TouchableOpacity, Keyboard } from 'react-native';
import { hasNotch, xtraSpace } from 'util/hasNotch';
import { Header, Item, Button, Icon, Input } from 'native-base';
import { Lang } from 'lib/lang';
import { OLText } from '../text';
import { UNIT } from 'util/const';

const SEARCH_SIZE = UNIT * 3.25;

interface Props {
	searching: boolean;
	setSearchTerm: (term: string) => void;
	setSearching: (value: boolean) => void;
}

interface State {
	searchAnimation: Animated.Value;
	searchTerm: string;
}

type InputRef = { wrappedInstance: { focus(); blur() } };

export class OLSearch extends React.PureComponent<Props, State> {
	state: State = {
		searchAnimation: new Animated.Value(0),
		searchTerm: '',
	};

	searchInput: InputRef;

	componentDidUpdate(prevProps: Props) {
		if (prevProps.searching !== this.props.searching && this.props.searching) {
			this.showSearch();
		}
	}

	search = () => {
		setTimeout(() => {
			this.props.setSearchTerm(this.state.searchTerm);
		}, 0);
	};

	showSearch = () => {
		this.searchInput.wrappedInstance.focus();

		Animated.spring(this.state.searchAnimation, {
			toValue: 1,
			useNativeDriver: true,
		}).start();
	};

	hideSearch = () => {
		Keyboard.dismiss();
		this.searchInput.wrappedInstance.blur();

		_.defer(() => {
			this.props.setSearching(false);
			this.props.setSearchTerm(null);
		});

		Animated.spring(this.state.searchAnimation, {
			toValue: 0,
			useNativeDriver: true,
		}).start();
	};

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
							ref={(ref) => (this.searchInput = (ref as unknown) as InputRef)}
							placeholder={Lang.print('home.search')}
							onChangeText={(searchTerm) => this.setState({ searchTerm })}
							onSubmitEditing={this.search}
						/>
					</Item>

					<Button transparent onPress={this.search}>
						<OLText font="Proxima_Nova" size={16}>
							{Lang.print('home.search')}
						</OLText>
					</Button>
				</Header>
			</Animated.View>
		);
	}
}
