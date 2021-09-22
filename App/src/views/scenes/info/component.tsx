/* eslint-disable @typescript-eslint/no-unsafe-return */
import React from 'react';
import { TouchableOpacity, View, Image, ScrollView } from 'react-native';
import { Lang } from 'lib/lang';
import { OLButton } from 'views/components/button';
import { OLCard } from 'views/components/card';
import { OLFlag } from 'views/components/lang/flag';
import { OLText } from 'views/components/text';
import { VERSION, px } from 'util/const';

type Props = {
	landscape: boolean;
	contact: () => void;
	update: () => void;
	openZapSplat: () => void;
	openPhraseApp: () => void;
	translationCredits: { code: string; name: string }[];
	secretTap: () => void;
	increaseFontSize: () => void;
	deceaseFontSize: () => void;
};

const PHRASE_IMAGE = require('../../../../assets/images/phrase.png');

export const OLInfo: React.FC<Props> = ({
	landscape,
	contact,
	update,
	openZapSplat,
	openPhraseApp,
	translationCredits,
	secretTap,
	increaseFontSize,
	deceaseFontSize,
}) => {
	const buttons = React.useMemo(
		() => [
			{
				text: Lang.print('info.update.check'),
				onPress: update,
			},
			{
				text: Lang.print('info.contact'),
				onPress: contact,
			},
		],
		[],
	);

	const renderTranslationCredit = ({ code, name }: { code: string; name: string }, index: number) => (
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

	return (
		<ScrollView
			style={{
				paddingVertical: px(10),
				paddingHorizontal: px(landscape ? 40 : 10),
			}}
		>
			<View>
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

				<OLCard style={{ marginVertical: px(8) }}>
					<TouchableOpacity style={{ width: '100%' }} onPress={secretTap} activeOpacity={1}>
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

					{buttons.map((button, index) => {
						return (
							<OLButton
								key={`${button.text}/${index}`}
								onPress={() => button.onPress && button.onPress()}
								style={{
									marginBottom: index !== buttons.length - 1 ? px(16) : 0,
								}}
							>
								{button.text}
							</OLButton>
						);
					})}
				</OLCard>
			</View>

			<View>
				<OLCard>
					<OLText
						font="Proxima_Nova_Bold"
						size={16}
						style={{
							marginBottom: px(8),
						}}
					>
						{Lang.print('info.changeTextSize.title')}
					</OLText>

					<OLText font="Proxima_Nova" size={14}>
						{Lang.print('info.changeTextSize.text')}
					</OLText>

					<View style={{ flexDirection: 'row', justifyContent: 'space-evenly', paddingTop: px(16) }}>
						<OLButton onPress={deceaseFontSize}>{Lang.print('info.changeTextSize.decrease')}</OLButton>
						<OLButton onPress={increaseFontSize}>{Lang.print('info.changeTextSize.increase')}</OLButton>
					</View>
				</OLCard>
			</View>

			<View>
				<OLCard style={{ marginVertical: px(8) }}>
					<TouchableOpacity onPress={openZapSplat} style={{ marginBottom: 24 }}>
						<OLText
							font="Proxima_Nova"
							size={14}
							style={{
								textAlign: 'center',
								textDecorationStyle: 'solid',
								textDecorationLine: 'underline',
							}}
						>
							Additional sound effects from zapsplat.com
						</OLText>
					</TouchableOpacity>

					<TouchableOpacity
						onPress={openPhraseApp}
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

						<Image source={PHRASE_IMAGE} style={{ width: 180, height: 60 }} resizeMode="contain" />
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

					{translationCredits.map(renderTranslationCredit)}
				</OLCard>
			</View>

			<View style={{ height: px(25) }} />
		</ScrollView>
	);
};
