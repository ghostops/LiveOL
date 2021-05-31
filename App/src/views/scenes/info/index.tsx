import * as React from 'react';
import { Alert, TouchableOpacity, View, Image, Linking, ScrollView } from 'react-native';
import { client } from 'lib/graphql/client';
import { connect } from 'react-redux';
import { GET_SERVER_VERSION } from 'lib/graphql/queries/server';
import { Lang } from 'lib/lang';
import { NavigationProp } from '@react-navigation/native';
import { OLButton } from 'views/components/button';
import { OLCard } from 'views/components/card';
import { OLFlag } from 'views/components/lang/flag';
import { OLText } from 'views/components/text';
import { ServerVersion } from 'lib/graphql/queries/types/ServerVersion';
import { VERSION, px } from 'util/const';
import * as Updates from 'expo-updates';

interface OwnProps {
	navigation: NavigationProp<any, any>;
}

interface StateProps {
	landscape: boolean;
}

type Props = StateProps & OwnProps;

interface State {
	secretTaps: number;
}

const PHRASEAPP_IMAGE = require('../../../../assets/images/phraseapp.png');

class Component extends React.PureComponent<Props, State> {
	state: State = {
		secretTaps: 0,
	};

	update = async () => {
		let canUpdate = false;

		if (!__DEV__) {
			const update = (await Updates.checkForUpdateAsync()) as any;
			canUpdate = update && update.isAvailable;
		}

		if (canUpdate) {
			Alert.alert(Lang.print('info.update.hasUpdate.title'), Lang.print('info.update.hasUpdate.text'), [
				{
					onPress: async () => {
						if (!__DEV__) {
							await Updates.fetchUpdateAsync();
							await Updates.reloadAsync();
						}
					},
					text: Lang.print('info.update.hasUpdate.cta'),
				},
				{
					text: Lang.print('info.update.hasUpdate.cancel'),
					style: 'cancel',
				},
			]);
		} else {
			Alert.alert(Lang.print('info.update.noUpdate.title'), Lang.print('info.update.noUpdate.text'));
		}
	};

	expoManifest = () => Alert.alert('Expo Manifest', JSON.stringify(Updates.manifest));

	contact = () => Linking.openURL('https://liveol.larsendahl.se/contact.html');

	BUTTONS = [
		{
			text: Lang.print('info.update.check'),
			onPress: this.update,
			onLongPress: this.expoManifest,
		},
		{
			text: Lang.print('info.contact'),
			onPress: this.contact,
		},
	];

	openPhraseApp = () => Linking.openURL('https://phraseapp.com');
	openZapSplat = () => Linking.openURL('https://www.zapsplat.com/');

	versionAlert = async () => {
		const { data } = await client.query<ServerVersion>({
			query: GET_SERVER_VERSION,
		});

		// tslint:disable: prefer-template
		Alert.alert('VERSION', `Package Version: ${VERSION}\n` + `Server Version: ${data.server.version}\n`);
		// tslint:enable: prefer-template
	};

	renderGeneralCard = () => (
		<OLCard style={{ marginVertical: px(8) }}>
			{((Lang.print('info.body') as unknown) as string[]).map((text: string) => (
				<OLText
					font="Proxima_Nova"
					size={16}
					key={text}
					style={{
						marginBottom: px(16),
					}}
				>
					{text}
				</OLText>
			))}
		</OLCard>
	);

	renderActionCard = () => (
		<OLCard style={{ marginVertical: px(8) }}>
			<TouchableOpacity style={{ width: '100%' }} onPress={this.secretTap} activeOpacity={1}>
				<OLText
					font="Proxima_Nova_Bold"
					size={16}
					style={{
						marginBottom: px(16),
					}}
				>
					{Lang.print('info.version')}: {VERSION}
				</OLText>
			</TouchableOpacity>

			{this.BUTTONS.map((button, index) => {
				return (
					<OLButton
						key={`${button.text}/${index}`}
						onPress={() => button.onPress && button.onPress()}
						onLongPress={() => button.onLongPress && button.onLongPress()}
						style={{
							marginBottom: index !== this.BUTTONS.length - 1 ? px(16) : 0,
						}}
					>
						{button.text}
					</OLButton>
				);
			})}
		</OLCard>
	);

	translationCredits: { code: string; name: string }[] = [
		{
			code: 'no',
			name: 'Pål Kittilsen',
		},
		{
			code: 'sr',
			name: 'Nikola Spaskovic',
		},
	];

	renderTranslationCredit = ({ code, name }: { code: string; name: string }, index: number) => (
		<View
			key={`${code}:${index}`}
			style={{
				flexDirection: 'row',
				alignItems: 'center',
				marginTop: px(8),
			}}
		>
			<OLFlag code={code} size={32} style={{ borderColor: 'black', borderWidth: 1 }} />

			<OLText
				font="Proxima_Nova"
				size={16}
				style={{
					marginLeft: px(5),
				}}
			>
				{name}
			</OLText>
		</View>
	);

	renderCreditCard = () => (
		<OLCard style={{ marginVertical: px(8) }}>
			<TouchableOpacity onPress={this.openZapSplat} style={{ marginBottom: 24 }}>
				<OLText
					font="Proxima_Nova"
					size={14}
					style={{ textAlign: 'center', textDecorationStyle: 'solid', textDecorationLine: 'underline' }}
				>
					Additional sound effects from zapsplat.com
				</OLText>
			</TouchableOpacity>

			<TouchableOpacity
				onPress={this.openPhraseApp}
				style={{
					alignItems: 'center',
					width: '100%',
				}}
			>
				<OLText
					font="Proxima_Nova_Bold"
					size={16}
					style={{
						marginBottom: px(16),
						textAlign: 'center',
					}}
				>
					{Lang.print('info.translations.phraseapp')}:
				</OLText>

				<Image source={PHRASEAPP_IMAGE} />
			</TouchableOpacity>

			<View
				style={{
					height: 1,
					width: '100%',
					backgroundColor: 'black',
					opacity: 0.15,
					marginVertical: 25,
				}}
			/>

			<OLText font="Proxima_Nova_Bold" size={18}>
				{Lang.print('info.translations.credit')}:
			</OLText>

			{this.translationCredits.map(this.renderTranslationCredit)}
		</OLCard>
	);

	secretTap = () => {
		this.setState({ secretTaps: this.state.secretTaps + 1 }, () => {
			if (this.state.secretTaps > 5) {
				this.setState({ secretTaps: 0 });

				void this.versionAlert();
			}
		});
	};

	render() {
		return (
			<ScrollView
				style={{
					padding: 10,
				}}
			>
				<View
					style={{
						flexDirection: this.props.landscape ? 'row' : 'column',
					}}
				>
					{this.renderGeneralCard()}
					{this.renderActionCard()}
				</View>

				<View>{this.renderCreditCard()}</View>

				<View style={{ height: px(25) }} />
			</ScrollView>
		);
	}
}

const mapStateToProps = (state: AppState): StateProps => ({
	landscape: state.general.rotation === 'landscape',
});

export const OLInfo = connect(mapStateToProps, null)(Component);
