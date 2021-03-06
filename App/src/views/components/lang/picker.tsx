import * as React from 'react';
import { TouchableOpacity, ScrollView } from 'react-native';
import { OLFlag } from './flag';
import { UNIT, COLORS } from 'util/const';
import { Lang } from 'lib/lang';
import RNRestart from 'react-native-restart';

interface State {
	active: string;
}

export class LanguagePicker extends React.PureComponent<any, State> {
	state = { active: Lang.active };

	render() {
		return (
			<ScrollView
				style={{
					width: '100%',
					padding: UNIT / 2,
				}}
				horizontal
			>
				{Lang.available.map((lang) => (
					<TouchableOpacity
						onPress={async () => {
							await Lang.set(lang);
							this.setState({ active: lang }, () => RNRestart.Restart());
						}}
						style={{
							marginRight: UNIT,
							borderColor: lang === this.state.active ? COLORS.MAIN : 'transparent',
							borderBottomWidth: 2,
							justifyContent: 'center',
						}}
						key={lang}
					>
						<OLFlag code={lang} size={32} style={{ borderColor: 'black', borderWidth: 1 }} />
					</TouchableOpacity>
				))}
			</ScrollView>
		);
	}
}
