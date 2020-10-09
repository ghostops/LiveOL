import * as React from 'react';
import { ApolloProvider } from '@apollo/react-hooks';
import { client } from 'lib/graphql/client';
import { Lang } from 'lib/lang';
import { Image, View } from 'react-native';
import { OLRotationWatcher } from 'views/components/watcher/rotation';
import { Provider } from 'react-redux';
import { Root } from 'native-base';
import { store } from 'store/configure';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import * as Updates from 'expo-updates';
import Router from 'lib/nav/router';

interface State {
	ready: boolean;
}

window['clog'] = (...props) => console.warn(JSON.stringify(props));

void SplashScreen.preventAutoHideAsync();

export default class AppRoot extends React.Component<any, State> {
	state = {
		ready: false,
	};

	componentDidMount() {
		void this.onLaunch();
	}

	onLaunch = async () => {
		await this.checkForUpdates();

		await Lang.init();

		await Font.loadAsync({
			Proxima_Nova_Bold: require('../assets/fonts/Proxima-Nova-Bold-regular.otf'),
			Proxima_Nova: require('../assets/fonts/Proxima-Nova.ttf'),
			Rift_Bold: require('../assets/fonts/Rift-Bold.otf'),
			Rift_Bold_Italic: require('../assets/fonts/Rift-Bold-Italic-regular.otf'),
			'PTMono-Regular': require('../assets/fonts/PTMono-Regular.ttf'),
		});

		setTimeout(() => {
			this.setState({ ready: true }, () => void SplashScreen.hideAsync());
		}, 3000);
	};

	checkForUpdates = async () => {
		if (__DEV__ || Updates.isEmergencyLaunch) return;

		const { isAvailable } = await Updates.checkForUpdateAsync();

		if (isAvailable) {
			await Updates.fetchUpdateAsync();
			await Updates.reloadAsync();
		}
	};

	render() {
		if (!this.state.ready) {
			return (
				<Image
					source={require('../assets/images/splash.png')}
					style={{
						position: 'absolute',
						top: 0,
						left: 0,
						bottom: 0,
						right: 0,
						height: '100%',
						width: '100%',
					}}
					resizeMode="cover"
				/>
			);
		}

		return (
			<ApolloProvider client={client}>
				<Root>
					<View style={{ flex: 1 }}>
						<Provider store={store.store}>
							<OLRotationWatcher>
								<Router />
							</OLRotationWatcher>

							{/* <OLPush /> */}
						</Provider>
					</View>
				</Root>
			</ApolloProvider>
		);
	}
}
