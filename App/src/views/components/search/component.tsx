import * as React from 'react';
import _ from 'lodash';
import { Animated, TouchableOpacity, Keyboard, TextInput, View } from 'react-native';
import { hasNotch, xtraSpace } from 'util/hasNotch';
import { Lang } from 'lib/lang';
import { OLText } from '../text';
import { fontPx, px, UNIT } from 'util/const';
import { Ionicons } from '@expo/vector-icons';

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

export class OLSearch extends React.PureComponent<Props, State> {
	state: State = {
		searchAnimation: new Animated.Value(0),
		searchTerm: '',
	};

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
		Animated.spring(this.state.searchAnimation, {
			toValue: 1,
			useNativeDriver: true,
		}).start();
	};

	hideSearch = () => {
		Keyboard.dismiss();

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
				<View
					style={{
						paddingTop: 0,
						height: SEARCH_SIZE,
						backgroundColor: '#fafafa',
						flexDirection: 'row',
						width: '100%',
						alignItems: 'center',
					}}
				>
					<TouchableOpacity
						style={{
							height: '100%',
							justifyContent: 'center',
							paddingHorizontal: px(8),
						}}
						onPress={this.hideSearch}
					>
						<Ionicons name="close" size={fontPx(20)} />
					</TouchableOpacity>

					<View
						style={{
							flexDirection: 'row',
							flex: 1,
							alignItems: 'center',
							backgroundColor: '#d9d9d9',
							borderRadius: 8,
						}}
					>
						<Ionicons name="search" size={fontPx(18)} style={{ marginLeft: px(4) }} />
						<TextInput
							placeholder={Lang.print('home.search')}
							onChangeText={(searchTerm) => this.setState({ searchTerm })}
							onSubmitEditing={this.search}
							style={{
								padding: 6,
								flex: 1,
							}}
							focusable
						/>
					</View>

					<TouchableOpacity
						onPress={this.search}
						style={{ flex: 0.25, justifyContent: 'center', alignItems: 'center' }}
					>
						<OLText font="Proxima_Nova" size={16} style={{ color: 'black' }}>
							{Lang.print('home.search')}
						</OLText>
					</TouchableOpacity>
				</View>
			</Animated.View>
		);
	}
}
