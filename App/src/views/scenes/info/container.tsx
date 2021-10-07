import React from 'react';
import * as Updates from 'expo-updates';
import { VERSION } from 'util/const';
import { useRecoilState, useRecoilValue } from 'recoil';
import { ServerVersion } from 'lib/graphql/queries/types/ServerVersion';
import { OLInfo as Component } from './component';
import { Lang } from 'lib/lang';
import { isLandscapeSelector } from 'store/isLandscapeSelector';
import { GET_SERVER_VERSION } from 'lib/graphql/queries/server';
import { client } from 'lib/graphql/client';
import { Alert, Linking } from 'react-native';
import { textSizeMultiplierAtom } from 'store/textSizeMultiplier';

const translationCredits: { code: string; name: string }[] = [
	{
		code: 'no',
		name: 'Pål Kittilsen',
	},
	{
		code: 'sr',
		name: 'Nikola Spaskovic',
	},
	{
		code: 'it',
		name: 'Paolo Gallerani',
	},
	{
		code: 'cs',
		name: 'Petr Havliček',
	},
	{
		code: 'de',
		name: 'Petr Havliček',
	},
];

export const OLInfo: React.FC = () => {
	const isLandscape = useRecoilValue(isLandscapeSelector);

	const [textSizeMultiplier, setTextSizeMultiplier] = useRecoilState(textSizeMultiplierAtom);

	const [secretTaps, setSecretTaps] = React.useState(0);
	const contact = () => Linking.openURL('https://liveol.larsendahl.se/contact.html');
	const openPhraseApp = () => Linking.openURL('https://phraseapp.com');
	const openZapSplat = () => Linking.openURL('https://www.zapsplat.com/');

	const increaseTextSize = () => {
		if (textSizeMultiplier > 1.25) return;
		setTextSizeMultiplier(textSizeMultiplier + 0.1);
	};
	const decreaseTextSize = () => {
		if (textSizeMultiplier < 0.75) return;
		setTextSizeMultiplier(textSizeMultiplier - 0.1);
	};

	const update = async () => {
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

	const secretTap = async () => {
		setSecretTaps(secretTaps + 1);

		if (secretTaps > 5) {
			setSecretTaps(0);

			const { data } = await client.query<ServerVersion>({
				query: GET_SERVER_VERSION,
			});

			// tslint:disable: prefer-template
			Alert.alert('VERSION', `Package Version: ${VERSION}\n` + `Server Version: ${data.server.version}\n`);
			// tslint:enable: prefer-template
		}
	};

	return (
		<Component
			contact={contact}
			landscape={isLandscape}
			update={update}
			translationCredits={translationCredits}
			openPhraseApp={openPhraseApp}
			openZapSplat={openZapSplat}
			secretTap={secretTap}
			deceaseFontSize={decreaseTextSize}
			increaseFontSize={increaseTextSize}
		/>
	);
};
