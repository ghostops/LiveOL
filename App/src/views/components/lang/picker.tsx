import * as React from 'react';
import RNRestart from 'react-native-restart';
import { useTheme } from 'hooks/useTheme';
import { TouchableOpacity, ScrollView } from 'react-native';
import { OLFlag } from './flag';
import { Lang } from 'lib/lang';

export const LanguagePicker: React.FC = () => {
	const { colors, px } = useTheme();
	const [activeLanguage, setActiveLanguage] = React.useState<string>(Lang.active);

	return (
		<ScrollView
			style={{
				width: '100%',
				padding: px(8),
			}}
			horizontal
		>
			{Lang.available.map((lang) => {
				return (
					<TouchableOpacity
						onPress={async () => {
							await Lang.set(lang);
							setActiveLanguage(lang);
							RNRestart.Restart();
						}}
						style={{
							marginRight: px(16),
							borderColor: lang === activeLanguage ? colors.MAIN : 'transparent',
							borderBottomWidth: 2,
							justifyContent: 'center',
						}}
						key={lang}
					>
						<OLFlag code={lang} size={32} style={{ borderColor: 'black', borderWidth: 1 }} />
					</TouchableOpacity>
				);
			})}
		</ScrollView>
	);
};
