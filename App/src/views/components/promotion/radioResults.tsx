import * as React from 'react';
import { COLORS } from 'util/const';
import { Ionicons } from '@expo/vector-icons';
import { Lang } from 'lib/lang';
import { OLText } from '../text';
import { promotion } from './handler';
import { TouchableOpacity, LayoutAnimation } from 'react-native';
import { View } from 'native-base';

interface State {
	show: boolean;
}

const promo = promotion('radioResults');

export class RadioResultsPromotion extends React.PureComponent<any, State> {
	state: State = {
		show: false,
	};

	async componentDidMount() {
		const show = await promo.canShow();
		this.setState({ show });
	}

	componentDidUpdate() {
		LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
	}

	close = () => {
		this.setState({ show: false });
		void promo.close();
	};

	render() {
		if (!this.state.show) return null;

		return (
			<View
				style={{
					minHeight: 100,
					width: '100%',
					backgroundColor: COLORS.LIGHT,
					padding: 15,
				}}
			>
				<OLText
					font="Proxima_Nova_Bold"
					size={18}
					style={{
						color: 'white',
					}}
				>
					{Lang.print('promotions.didYouKnow')}
				</OLText>

				<OLText
					font="Proxima_Nova"
					size={16}
					style={{
						color: 'white',
						marginTop: 5,
					}}
				>
					{Lang.print('promotions.radioResults')}
				</OLText>

				<TouchableOpacity
					onPress={this.close}
					style={{
						position: 'absolute',
						top: 5,
						right: 10,
					}}
				>
					<Ionicons name="md-close" size={32} color="white" />
				</TouchableOpacity>
			</View>
		);
	}
}
